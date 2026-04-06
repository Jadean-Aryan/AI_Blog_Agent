from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Post, Outline, Section, SEOAnalysis, MetaTag, UserRole
from schemas import SEOAnalysisOut, MetaTagOut
from services import analyze_post, generate_meta, suggest_internal_links
from routers.auth import require_user

router = APIRouter(prefix="/seo", tags=["SEO"])


def _build_full_text(sections: list) -> str:
    sorted_sections = sorted(sections, key=lambda s: s.order_index)
    parts = []
    for s in sorted_sections:
        if s.content:
            parts.append(f"{s.heading}\n{s.content}")
    return "\n\n".join(parts)


def _check_post_access(post: Post, current_user) -> None:
    """USER can only access their own posts. ADMIN can access any."""
    if current_user.role != UserRole.admin and post.user_id != current_user.id:
        raise HTTPException(403, "You can only access your own posts")


# ─── Run full SEO analysis ────────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.post("/analyze/{post_id}", response_model=SEOAnalysisOut)
async def run_seo_analysis(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.outlines).selectinload(Outline.sections),
            selectinload(Post.meta_tags),
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    _check_post_access(post, current_user)  # 🔒 ownership check

    active_outline = next((o for o in post.outlines if o.is_active), None)
    if not active_outline:
        raise HTTPException(400, "No active outline found")

    sections_data = [
        {
            "heading": s.heading,
            "heading_level": s.heading_level,
            "order_index": s.order_index,
            "content": s.content or "",
        }
        for s in active_outline.sections
    ]

    full_text = _build_full_text(active_outline.sections)
    active_meta = next((m for m in post.meta_tags if m.is_active), None)

    analysis = analyze_post(
        full_text=full_text,
        keywords=post.target_keywords or [],
        sections=sections_data,
        meta_title=active_meta.meta_title if active_meta else None,
        meta_description=active_meta.meta_description if active_meta else None,
        has_separate_title=True,
    )
    analyzed_word_count = analysis.pop("word_count", 0)
    post.word_count = analyzed_word_count

    links = []
    if full_text:
        try:
            links = await suggest_internal_links(
                post.topic, post.target_keywords or [], full_text
            )
        except Exception:
            links = []

    seo = SEOAnalysis(
        post_id=post.id,
        outline_id=active_outline.id,
        suggested_links=links,
        **analysis,
    )
    db.add(seo)
    await db.flush()
    return SEOAnalysisOut.model_validate(seo)


# ─── Get latest SEO analysis ──────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.get("/analysis/{post_id}", response_model=list[SEOAnalysisOut])
async def get_seo_analyses(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    _check_post_access(post, current_user)  # 🔒 ownership check

    result = await db.execute(
        select(SEOAnalysis)
        .where(SEOAnalysis.post_id == post_id)
        .order_by(SEOAnalysis.created_at.desc())
    )
    return result.scalars().all()


# ─── Generate meta tags ───────────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.post("/meta/{post_id}", response_model=MetaTagOut)
async def generate_meta_tags(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.outlines).selectinload(Outline.sections),
            selectinload(Post.meta_tags),
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    _check_post_access(post, current_user)  # 🔒 ownership check

    active_outline = next((o for o in post.outlines if o.is_active), None)
    full_text = _build_full_text(active_outline.sections) if active_outline else ""

    try:
        meta_data = await generate_meta(
            title=post.title,
            topic=post.topic,
            focus_keyword=(post.target_keywords or [""])[0],
            content_summary=full_text[:500],
        )
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    for m in post.meta_tags:
        m.is_active = False
    await db.flush()

    meta = MetaTag(
        post_id=post.id,
        outline_id=active_outline.id if active_outline else None,
        meta_title=meta_data.get("meta_title", "")[:60],
        meta_description=meta_data.get("meta_description", "")[:160],
        og_title=meta_data.get("og_title", "")[:100],
        og_description=meta_data.get("og_description", "")[:200],
        focus_keyword=(post.target_keywords or [""])[0],
        is_active=True,
    )
    db.add(meta)
    await db.flush()

    title_variations = meta_data.get("title_variations", [])
    if title_variations:
        seo_result = await db.execute(
            select(SEOAnalysis)
            .where(SEOAnalysis.post_id == post_id)
            .order_by(SEOAnalysis.created_at.desc())
            .limit(1)
        )
        latest_seo = seo_result.scalar_one_or_none()
        if latest_seo:
            latest_seo.title_variations = title_variations

    return MetaTagOut.model_validate(meta)


# ─── Get meta tags ────────────────────────────────────────────────────────────
# 🔒 Must be logged in.

@router.get("/meta/{post_id}", response_model=list[MetaTagOut])
async def get_meta_tags(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    _check_post_access(post, current_user)  # 🔒 ownership check

    result = await db.execute(
        select(MetaTag)
        .where(MetaTag.post_id == post_id)
        .order_by(MetaTag.created_at.desc())
    )
    return result.scalars().all()

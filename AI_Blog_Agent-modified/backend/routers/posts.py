from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Post, Outline, Section, SEOAnalysis, MetaTag, User, UserRole, PostStatus
from schemas import PostCreate, PostOut, PostSummary, FullPostOut, OutlineOut
from services import generate_outline
from routers.auth import get_optional_user, require_user

router = APIRouter(prefix="/posts", tags=["Posts"])


# ─── Helper: ownership check ─────────────────────────────────────────────────

def _check_post_access(post: Post, current_user: User) -> None:
    """USER can only touch their own posts. ADMIN can touch any post."""
    if current_user.role != UserRole.admin and post.user_id != current_user.id:
        raise HTTPException(403, "You can only modify your own posts")


# ─── CREATE ──────────────────────────────────────────────────────────────────
# 🔒 Requires login (USER or ADMIN). Guests cannot create posts.

@router.post("/", response_model=FullPostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),  # 🔒 must be logged in
):
    try:
        outline_data = await generate_outline(body.topic, body.target_keywords)
    except Exception as e:
        raise HTTPException(502, f"LLM outline generation failed: {e}")

    post = Post(
        title=outline_data.get("title", body.topic),
        topic=body.topic,
        target_keywords=body.target_keywords or outline_data.get("suggested_keywords", []),
        user_id=current_user.id,  # always set — logged-in users own their posts
    )
    db.add(post)
    await db.flush()

    outline = Outline(post_id=post.id, version=1, is_active=True)
    db.add(outline)
    await db.flush()

    for i, s in enumerate(outline_data.get("sections", [])):
        db.add(Section(
            outline_id=outline.id,
            heading=s["heading"],
            heading_level=s.get("heading_level", 2),
            order_index=s.get("order_index", i),
        ))

    await db.flush()

    result = await db.execute(
        select(Post).where(Post.id == post.id)
        .options(
            selectinload(Post.outlines).selectinload(Outline.sections),
            selectinload(Post.seo_analyses),
            selectinload(Post.meta_tags),
            selectinload(Post.user),
        )
    )
    post_full = result.scalar_one()
    active_outline = next((o for o in post_full.outlines if o.is_active), None)

    return FullPostOut(
        post=PostOut.model_validate(post_full),
        outline=OutlineOut.model_validate(active_outline) if active_outline else None,
        seo=None, meta=None,
    )


# ─── LIST ────────────────────────────────────────────────────────────────────
# 🌐 GUEST  → published posts only
# 👤 USER   → their own posts only (all statuses)
# 🛡️ ADMIN  → all posts from all users

@router.get("/", response_model=list[PostSummary])
async def list_posts(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),  # None = Guest
):
    query = select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit)

    if current_user is None:
        # 🌐 GUEST: published posts only
        query = query.where(Post.status == PostStatus.published)
    elif current_user.role == UserRole.admin:
        # 🛡️ ADMIN: all posts, no filter
        pass
    else:
        # 👤 USER: only their own posts
        query = query.where(Post.user_id == current_user.id)

    result = await db.execute(query.options(selectinload(Post.user)))
    posts = result.scalars().all()

    summaries = []
    for p in posts:
        seo_result = await db.execute(
            select(SEOAnalysis.overall_seo_score)
            .where(SEOAnalysis.post_id == p.id)
            .order_by(SEOAnalysis.created_at.desc()).limit(1)
        )
        seo_score = seo_result.scalar_one_or_none()
        summaries.append(PostSummary(
            id=p.id, title=p.title, topic=p.topic, status=p.status,
            word_count=p.word_count, overall_seo_score=seo_score,
            created_at=p.created_at, updated_at=p.updated_at,
            author=p.user.username if p.user else "Unknown",
        ))
    return summaries


# ─── GET SINGLE ──────────────────────────────────────────────────────────────
# 🌐 GUEST  → published posts only
# 👤 USER   → their own posts only
# 🛡️ ADMIN  → any post

@router.get("/{post_id}", response_model=FullPostOut)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),  # None = Guest
):
    result = await db.execute(
        select(Post).where(Post.id == post_id)
        .options(
            selectinload(Post.outlines).selectinload(Outline.sections),
            selectinload(Post.seo_analyses),
            selectinload(Post.meta_tags),
            selectinload(Post.user),
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    if current_user is None:
        # 🌐 GUEST: only published
        if post.status != PostStatus.published:
            raise HTTPException(404, "Post not found")
    elif current_user.role != UserRole.admin:
        # 👤 USER: only their own
        if post.user_id != current_user.id:
            raise HTTPException(403, "You can only view your own posts")
    # 🛡️ ADMIN: no restriction

    active_outline = next((o for o in post.outlines if o.is_active), None)
    latest_seo = sorted(post.seo_analyses, key=lambda s: s.created_at, reverse=True)[0] if post.seo_analyses else None
    active_meta = next((m for m in post.meta_tags if m.is_active), None)

    return FullPostOut(
        post=PostOut.model_validate(post),
        outline=OutlineOut.model_validate(active_outline) if active_outline else None,
        seo=latest_seo, meta=active_meta,
    )


# ─── UPDATE ──────────────────────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any post.

@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: int,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    _check_post_access(post, current_user)  # 🔒 ownership check
    for field in ("title", "target_keywords", "status"):
        if field in body:
            setattr(post, field, body[field])
    return PostOut.model_validate(post)


# ─── DELETE ──────────────────────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any post.

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    _check_post_access(post, current_user)  # 🔒 ownership check
    await db.delete(post)


# ─── REGENERATE OUTLINE ───────────────────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any post.

@router.post("/{post_id}/regenerate-outline", response_model=OutlineOut)
async def regenerate_outline(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Post).where(Post.id == post_id)
        .options(selectinload(Post.outlines).selectinload(Outline.sections))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    _check_post_access(post, current_user)  # 🔒 ownership check

    for o in post.outlines:
        o.is_active = False
    await db.flush()

    try:
        outline_data = await generate_outline(post.topic, post.target_keywords or [])
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    outline = Outline(post_id=post.id, version=len(post.outlines) + 1, is_active=True)
    db.add(outline)
    await db.flush()

    for i, s in enumerate(outline_data.get("sections", [])):
        db.add(Section(
            outline_id=outline.id,
            heading=s["heading"],
            heading_level=s.get("heading_level", 2),
            order_index=s.get("order_index", i),
        ))

    await db.flush()
    result2 = await db.execute(
        select(Outline).where(Outline.id == outline.id).options(selectinload(Outline.sections))
    )
    return result2.scalar_one()

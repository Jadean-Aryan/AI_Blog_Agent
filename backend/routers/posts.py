from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Post, Outline, Section, SEOAnalysis, MetaTag, User
from schemas import PostCreate, PostOut, PostSummary, FullPostOut, OutlineOut
from services import generate_outline
from routers.auth import get_optional_user

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("/", response_model=FullPostOut, status_code=status.HTTP_201_CREATED)
async def create_post(body: PostCreate, db: AsyncSession = Depends(get_db), request: Request = None):
    current_user = await get_optional_user(request, db) if request else None
    try:
        outline_data = await generate_outline(body.topic, body.target_keywords)
    except Exception as e:
        raise HTTPException(502, f"LLM outline generation failed: {e}")

    post = Post(
        title=outline_data.get("title", body.topic),
        topic=body.topic,
        target_keywords=body.target_keywords or outline_data.get("suggested_keywords", []),
        user_id=current_user.id if current_user else None,
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


@router.get("/", response_model=list[PostSummary])
async def list_posts(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    current_user = await get_optional_user(request, db) if request else None

    query = select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit)

    # Non-admin users only see their own posts
    if current_user and current_user.role != "admin":
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


@router.get("/{post_id}", response_model=FullPostOut)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
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

    active_outline = next((o for o in post.outlines if o.is_active), None)
    latest_seo = sorted(post.seo_analyses, key=lambda s: s.created_at, reverse=True)[0] if post.seo_analyses else None
    active_meta = next((m for m in post.meta_tags if m.is_active), None)

    return FullPostOut(
        post=PostOut.model_validate(post),
        outline=OutlineOut.model_validate(active_outline) if active_outline else None,
        seo=latest_seo, meta=active_meta,
    )


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(post_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    for field in ("title", "target_keywords", "status"):
        if field in body:
            setattr(post, field, body[field])
    return PostOut.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    await db.delete(post)


@router.post("/{post_id}/regenerate-outline", response_model=OutlineOut)
async def regenerate_outline(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post).where(Post.id == post_id)
        .options(selectinload(Post.outlines).selectinload(Outline.sections))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

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

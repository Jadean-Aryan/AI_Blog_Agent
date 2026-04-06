from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Post, Outline, SEOAnalysis, MetaTag, UserRole
from services import to_markdown, to_html
from routers.auth import require_user

router = APIRouter(prefix="/export", tags=["Export"])


def _check_post_access(post: Post, current_user) -> None:
    """USER can only export their own posts. ADMIN can export any."""
    if current_user.role != UserRole.admin and post.user_id != current_user.id:
        raise HTTPException(403, "You can only export your own posts")


# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.get("/{post_id}/markdown", response_class=PlainTextResponse)
async def export_markdown(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    post, active_outline, latest_seo, active_meta = await _load_post_data(post_id, db)
    _check_post_access(post, current_user)  # 🔒 ownership check

    sections_data = [
        {
            "heading": s.heading,
            "heading_level": s.heading_level,
            "order_index": s.order_index,
            "content": s.content,
        }
        for s in (active_outline.sections if active_outline else [])
    ]

    md = to_markdown(
        post_title=post.title,
        sections=sections_data,
        meta=_meta_to_dict(active_meta),
        seo=_seo_to_dict(latest_seo),
    )
    return PlainTextResponse(
        content=md,
        headers={"Content-Disposition": f'attachment; filename="{_slugify(post.title)}.md"'},
    )


@router.get("/{post_id}/html", response_class=HTMLResponse)
async def export_html(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    post, active_outline, latest_seo, active_meta = await _load_post_data(post_id, db)
    _check_post_access(post, current_user)  # 🔒 ownership check

    sections_data = [
        {
            "heading": s.heading,
            "heading_level": s.heading_level,
            "order_index": s.order_index,
            "content": s.content,
        }
        for s in (active_outline.sections if active_outline else [])
    ]

    html = to_html(
        post_title=post.title,
        sections=sections_data,
        meta=_meta_to_dict(active_meta),
        seo=_seo_to_dict(latest_seo),
    )
    return HTMLResponse(
        content=html,
        headers={"Content-Disposition": f'attachment; filename="{_slugify(post.title)}.html"'},
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _load_post_data(post_id: int, db: AsyncSession):
    result = await db.execute(
        select(Post)
        .where(Post.id == post_id)
        .options(
            selectinload(Post.outlines).selectinload(Outline.sections),
            selectinload(Post.seo_analyses),
            selectinload(Post.meta_tags),
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    active_outline = next((o for o in post.outlines if o.is_active), None)
    latest_seo = (
        sorted(post.seo_analyses, key=lambda s: s.created_at, reverse=True)[0]
        if post.seo_analyses else None
    )
    active_meta = next((m for m in post.meta_tags if m.is_active), None)
    return post, active_outline, latest_seo, active_meta


def _meta_to_dict(meta) -> dict | None:
    if not meta:
        return None
    return {
        "meta_title": meta.meta_title,
        "meta_description": meta.meta_description,
        "og_title": meta.og_title,
        "og_description": meta.og_description,
        "focus_keyword": meta.focus_keyword,
    }


def _seo_to_dict(seo) -> dict | None:
    if not seo:
        return None
    return {
        "overall_seo_score": seo.overall_seo_score,
        "flesch_reading_ease": seo.flesch_reading_ease,
    }


def _slugify(title: str) -> str:
    import re
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    return re.sub(r"[\s_]+", "-", slug)[:60]

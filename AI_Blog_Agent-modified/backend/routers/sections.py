from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Section, Outline, Post, UserRole
from schemas import SectionOut, SectionUpdate, GenerateSectionRequest, ReorderSectionsRequest
from services import generate_section_content
from routers.auth import require_user, get_optional_user

router = APIRouter(prefix="/sections", tags=["Sections"])


def _check_section_access(post: Post, current_user) -> None:
    """USER can only touch sections of their own posts. ADMIN can touch any."""
    if current_user.role != UserRole.admin and post.user_id != current_user.id:
        raise HTTPException(403, "You can only modify sections of your own posts")


# ─── Generate content for a single section ───────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.post("/generate", response_model=SectionOut)
async def generate_section(
    body: GenerateSectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Section)
        .where(Section.id == body.section_id)
        .options(
            selectinload(Section.outline).selectinload(Outline.sections),
            selectinload(Section.outline).selectinload(Outline.post),
        )
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(404, "Section not found")

    post = section.outline.post
    _check_section_access(post, current_user)  # 🔒 ownership check
    keywords = post.target_keywords or []

    try:
        content = await generate_section_content(
            topic=post.topic,
            heading=section.heading,
            keywords=keywords,
            extra_instructions=body.extra_instructions or "",
        )
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    section.content = content
    section.word_count = len(content.split())
    section.is_generated = True

    all_sections = section.outline.sections
    total_words = sum(len((s.content or "").split()) for s in all_sections)
    post.word_count = total_words

    await db.flush()
    return SectionOut.model_validate(section)


# ─── Update section heading / content ────────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.patch("/{section_id}", response_model=SectionOut)
async def update_section(
    section_id: int,
    body: SectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Section)
        .where(Section.id == section_id)
        .options(
            selectinload(Section.outline).selectinload(Outline.post),
            selectinload(Section.outline).selectinload(Outline.sections),
        )
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(404, "Section not found")

    _check_section_access(section.outline.post, current_user)  # 🔒 ownership check

    update_data = body.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(section, field, val)

    if "content" in update_data:
        section.word_count = len((section.content or "").split())
        post = section.outline.post
        post.word_count = sum(len((s.content or "").split()) for s in section.outline.sections)

    await db.flush()
    return SectionOut.model_validate(section)


# ─── Reorder sections ────────────────────────────────────────────────────────
# 🔒 Must be logged in.

@router.post("/reorder", response_model=list[SectionOut])
async def reorder_sections(
    body: ReorderSectionsRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    updated = []
    for item in body.section_orders:
        result = await db.execute(
            select(Section)
            .where(Section.id == item["id"])
            .options(selectinload(Section.outline).selectinload(Outline.post))
        )
        section = result.scalar_one_or_none()
        if section:
            _check_section_access(section.outline.post, current_user)  # 🔒 ownership check
            section.order_index = item["order_index"]
            updated.append(section)
    await db.flush()
    return [SectionOut.model_validate(s) for s in updated]


# ─── Generate ALL sections for an outline ────────────────────────────────────
# 🔒 Must be logged in. USER: own posts only. ADMIN: any.

@router.post("/generate-all/{outline_id}", response_model=list[SectionOut])
async def generate_all_sections(
    outline_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_user),  # 🔒 must be logged in
):
    result = await db.execute(
        select(Outline)
        .where(Outline.id == outline_id)
        .options(
            selectinload(Outline.sections),
            selectinload(Outline.post),
        )
    )
    outline = result.scalar_one_or_none()
    if not outline:
        raise HTTPException(404, "Outline not found")

    _check_section_access(outline.post, current_user)  # 🔒 ownership check

    post = outline.post
    keywords = post.target_keywords or []
    generated = []

    for section in sorted(outline.sections, key=lambda s: s.order_index):
        try:
            content = await generate_section_content(
                topic=post.topic,
                heading=section.heading,
                keywords=keywords,
            )
            section.content = content
            section.word_count = len(content.split())
            section.is_generated = True
            generated.append(section)
        except Exception:
            continue

    total_words = sum(len((s.content or "").split()) for s in outline.sections)
    post.word_count = total_words

    await db.flush()
    return [SectionOut.model_validate(s) for s in generated]

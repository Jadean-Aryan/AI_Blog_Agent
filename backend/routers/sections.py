from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Section, Outline, Post
from schemas import SectionOut, SectionUpdate, GenerateSectionRequest, ReorderSectionsRequest
from services import generate_section_content

router = APIRouter(prefix="/sections", tags=["Sections"])


# ─── Generate content for a single section ───────────────────────────────────

@router.post("/generate", response_model=SectionOut)
async def generate_section(
    body: GenerateSectionRequest, db: AsyncSession = Depends(get_db)
):
    # Load section with its outline and post
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

    # Update post total word count
    all_sections = section.outline.sections
    total_words = sum(
        len((s.content or "").split()) for s in all_sections
    )
    post.word_count = total_words

    await db.flush()
    return SectionOut.model_validate(section)


# ─── Update section heading / content ────────────────────────────────────────

@router.patch("/{section_id}", response_model=SectionOut)
async def update_section(
    section_id: int, body: SectionUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(404, "Section not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(section, field, val)

    if "content" in update_data:
        section.word_count = len((section.content or "").split())

    await db.flush()
    return SectionOut.model_validate(section)


# ─── Reorder sections ────────────────────────────────────────────────────────

@router.post("/reorder", response_model=list[SectionOut])
async def reorder_sections(
    body: ReorderSectionsRequest, db: AsyncSession = Depends(get_db)
):
    updated = []
    for item in body.section_orders:
        result = await db.execute(
            select(Section).where(Section.id == item["id"])
        )
        section = result.scalar_one_or_none()
        if section:
            section.order_index = item["order_index"]
            updated.append(section)
    await db.flush()
    return [SectionOut.model_validate(s) for s in updated]


# ─── Generate ALL sections for an outline ────────────────────────────────────

@router.post("/generate-all/{outline_id}", response_model=list[SectionOut])
async def generate_all_sections(outline_id: int, db: AsyncSession = Depends(get_db)):
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
            # Skip failed sections, continue with others
            continue

    total_words = sum(len((s.content or "").split()) for s in outline.sections)
    post.word_count = total_words

    await db.flush()
    return [SectionOut.model_validate(s) for s in generated]

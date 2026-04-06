from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SectionBase(BaseModel):
    heading: str
    heading_level: int = Field(2, ge=1, le=6)
    order_index: int = 0
    content: Optional[str] = None
    word_count: int = 0
    is_generated: bool = False

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    heading: Optional[str] = None
    heading_level: Optional[int] = None
    order_index: Optional[int] = None
    content: Optional[str] = None

class SectionOut(SectionBase):
    id: int
    outline_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500)
    target_keywords: list[str] = Field(default_factory=list)

class PostOut(BaseModel):
    id: int
    title: str
    topic: str
    target_keywords: list[str]
    status: str
    word_count: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class PostSummary(BaseModel):
    id: int
    title: str
    topic: str
    status: str
    word_count: int
    overall_seo_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    author: Optional[str] = "Unknown"
    class Config:
        from_attributes = True


class OutlineOut(BaseModel):
    id: int
    post_id: int
    version: int
    is_active: bool
    sections: list[SectionOut]
    created_at: datetime
    class Config:
        from_attributes = True


class SEOAnalysisOut(BaseModel):
    id: int
    post_id: int
    outline_id: Optional[int]
    flesch_reading_ease: Optional[float] = None
    flesch_kincaid_grade: Optional[float] = None
    gunning_fog: Optional[float] = None
    reading_time_minutes: Optional[float] = None
    keyword_density_score: float
    heading_hierarchy_score: float
    overall_seo_score: float
    keyword_densities: dict
    heading_issues: list
    suggested_links: list
    title_variations: list
    created_at: datetime
    class Config:
        from_attributes = True


class MetaTagOut(BaseModel):
    id: int
    post_id: int
    meta_title: Optional[str]
    meta_description: Optional[str]
    og_title: Optional[str]
    og_description: Optional[str]
    focus_keyword: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


class FullPostOut(BaseModel):
    post: PostOut
    outline: Optional[OutlineOut]
    seo: Optional[SEOAnalysisOut]
    meta: Optional[MetaTagOut]
    class Config:
        from_attributes = True


class GenerateSectionRequest(BaseModel):
    section_id: int
    extra_instructions: Optional[str] = None

class ReorderSectionsRequest(BaseModel):
    section_orders: list[dict]

class ExportRequest(BaseModel):
    post_id: int
    format: str = Field("markdown", pattern="^(markdown|html)$")

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime,
    ForeignKey, JSON, Boolean, Enum as SAEnum
)
from sqlalchemy.orm import relationship, DeclarativeBase
import enum


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False)
    topic = Column(String(500), nullable=False)
    target_keywords = Column(JSON, default=list)
    status = Column(SAEnum(PostStatus), default=PostStatus.draft)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="posts")
    outlines = relationship("Outline", back_populates="post", cascade="all, delete-orphan")
    seo_analyses = relationship("SEOAnalysis", back_populates="post", cascade="all, delete-orphan")
    meta_tags = relationship("MetaTag", back_populates="post", cascade="all, delete-orphan")


class Outline(Base):
    __tablename__ = "outlines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="outlines")
    sections = relationship(
        "Section", back_populates="outline",
        cascade="all, delete-orphan", order_by="Section.order_index"
    )


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    outline_id = Column(Integer, ForeignKey("outlines.id", ondelete="CASCADE"), nullable=False)
    heading = Column(String(500), nullable=False)
    heading_level = Column(Integer, default=2)
    order_index = Column(Integer, default=0)
    content = Column(Text, nullable=True)
    word_count = Column(Integer, default=0)
    is_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    outline = relationship("Outline", back_populates="sections")


class SEOAnalysis(Base):
    __tablename__ = "seo_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    outline_id = Column(Integer, ForeignKey("outlines.id", ondelete="CASCADE"), nullable=True)

    flesch_reading_ease = Column(Float, default=0.0)
    flesch_kincaid_grade = Column(Float, default=0.0)
    gunning_fog = Column(Float, default=0.0)
    reading_time_minutes = Column(Float, default=0.0)

    keyword_density_score = Column(Float, default=0.0)
    heading_hierarchy_score = Column(Float, default=0.0)
    overall_seo_score = Column(Float, default=0.0)

    keyword_densities = Column(JSON, default=dict)
    heading_issues = Column(JSON, default=list)
    suggested_links = Column(JSON, default=list)
    title_variations = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="seo_analyses")


class MetaTag(Base):
    __tablename__ = "meta_tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    outline_id = Column(Integer, ForeignKey("outlines.id", ondelete="CASCADE"), nullable=True)

    meta_title = Column(String(60), nullable=True)
    meta_description = Column(String(160), nullable=True)
    og_title = Column(String(100), nullable=True)
    og_description = Column(String(200), nullable=True)
    canonical_url = Column(String(500), nullable=True)
    focus_keyword = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="meta_tags")

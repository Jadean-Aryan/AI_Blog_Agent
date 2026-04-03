-- ============================================================
-- AI Blog Writer & SEO Agent — MySQL 8 Schema
-- Run this ONCE to create the database and tables.
-- Change `ai_blog_agent` to your preferred DB name (match .env)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_blog_agent
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_blog_agent;

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id               INT          NOT NULL AUTO_INCREMENT,
  title            VARCHAR(500) NOT NULL,
  topic            VARCHAR(500) NOT NULL,
  target_keywords  JSON         DEFAULT (JSON_ARRAY()),
  status           ENUM('draft','published','archived') DEFAULT 'draft',
  word_count       INT          DEFAULT 0,
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_status    (status),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Outlines (versioned per post)
CREATE TABLE IF NOT EXISTS outlines (
  id          INT      NOT NULL AUTO_INCREMENT,
  post_id     INT      NOT NULL,
  version     INT      DEFAULT 1,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_post_id (post_id),
  CONSTRAINT fk_outline_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sections (belong to an outline)
CREATE TABLE IF NOT EXISTS sections (
  id              INT          NOT NULL AUTO_INCREMENT,
  outline_id      INT          NOT NULL,
  heading         VARCHAR(500) NOT NULL,
  heading_level   TINYINT      DEFAULT 2,
  order_index     INT          DEFAULT 0,
  content         LONGTEXT,
  word_count      INT          DEFAULT 0,
  is_generated    TINYINT(1)   DEFAULT 0,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_outline_order (outline_id, order_index),
  CONSTRAINT fk_section_outline FOREIGN KEY (outline_id)
    REFERENCES outlines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEO Analyses
CREATE TABLE IF NOT EXISTS seo_analyses (
  id                      INT        NOT NULL AUTO_INCREMENT,
  post_id                 INT        NOT NULL,
  outline_id              INT,
  flesch_reading_ease     FLOAT      DEFAULT 0,
  flesch_kincaid_grade    FLOAT      DEFAULT 0,
  gunning_fog             FLOAT      DEFAULT 0,
  reading_time_minutes    FLOAT      DEFAULT 0,
  keyword_density_score   FLOAT      DEFAULT 0,
  heading_hierarchy_score FLOAT      DEFAULT 0,
  overall_seo_score       FLOAT      DEFAULT 0,
  keyword_densities       JSON       DEFAULT (JSON_OBJECT()),
  heading_issues          JSON       DEFAULT (JSON_ARRAY()),
  suggested_links         JSON       DEFAULT (JSON_ARRAY()),
  title_variations        JSON       DEFAULT (JSON_ARRAY()),
  created_at              DATETIME   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_seo_post (post_id),
  CONSTRAINT fk_seo_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Meta Tags
CREATE TABLE IF NOT EXISTS meta_tags (
  id               INT          NOT NULL AUTO_INCREMENT,
  post_id          INT          NOT NULL,
  outline_id       INT,
  meta_title       VARCHAR(60),
  meta_description VARCHAR(160),
  og_title         VARCHAR(100),
  og_description   VARCHAR(200),
  canonical_url    VARCHAR(500),
  focus_keyword    VARCHAR(200),
  is_active        TINYINT(1)   DEFAULT 1,
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_meta_post (post_id),
  CONSTRAINT fk_meta_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Add users table (run if upgrading existing install) ─────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id INT NULL,
  ADD CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

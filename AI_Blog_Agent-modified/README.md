# BlogForge — AI Blog Writer & SEO Agent

> Generate SEO-optimized blog posts from a topic — outline → write → analyze → export.

**Team:** Aryan · Jaipal Banoth · Mayank Patel · Sanchita Singh · Umakhant Sonber

---

## Architecture

```
ai-blog-agent/
├── backend/               # FastAPI + async SQLAlchemy
│   ├── main.py            # App entry point + CORS
│   ├── config.py          # Pydantic settings (reads .env)
│   ├── database.py        # Async engine + session + init_db
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── services/
│   │   ├── llm_service.py   # All LLM calls (outline, section, meta, links)
│   │   ├── seo_service.py   # Keyword density, heading hierarchy, Flesch score
│   │   └── export_service.py # Markdown + HTML export
│   └── routers/
│       ├── posts.py         # POST /posts, GET /posts, regen outline
│       ├── sections.py      # Generate section, update, reorder, generate-all
│       ├── seo.py           # SEO analysis, meta tag generation
│       └── export.py        # /export/{id}/markdown|html
│
├── frontend/              # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx   # Topic wizard
│       │   ├── EditorPage.jsx # Section editor + SEO sidebar
│       │   └── HistoryPage.jsx # Post history + score trends
│       ├── components/
│       │   ├── editor/
│       │   │   ├── SectionEditor.jsx  # Drag, edit, regenerate per section
│       │   │   └── OutlinePanel.jsx   # DnD sortable sections list
│       │   └── seo/
│       │       ├── SEOSidebar.jsx     # Full SEO analysis panel
│       │       └── ScoreRing.jsx      # Animated SVG score ring
│       └── utils/
│           ├── api.js      # All axios API calls
│           └── helpers.js  # Score colours, export, formatting
│
└── schema.sql             # MySQL 8 DDL — run once to create tables
```

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8

### 1 — Database

```bash
mysql -u root -p < schema.sql
```

### 2 — Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local       # already created, just fill in values
# Edit .env:
#   LLM_API_KEY   → your Groq API key (https://console.groq.com/keys)
#   DB_PASSWORD   → your MySQL password
#   DB_NAME       → ai_blog_agent (or whatever you set in schema.sql)

# Start server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Workflow (Day-by-Day)

| Day | What's built |
|-----|-------------|
| D1 | MySQL schema (5 tables) + `/posts/` endpoint with LLM outline generation |
| D2 | Section-by-section writer, SEO analyzer (keyword density, Flesch, heading hierarchy), meta tag generator |
| D3 | React UI — topic wizard, drag-to-reorder outline, per-section regenerate, SEO score sidebar |
| D4 | History page, export MD/HTML, SEO score trend chart, polish |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/` | Create post + generate outline |
| GET  | `/api/posts/` | List all posts |
| GET  | `/api/posts/{id}` | Get full post (outline + SEO + meta) |
| PATCH | `/api/posts/{id}` | Update title/keywords/status |
| DELETE | `/api/posts/{id}` | Delete post |
| POST | `/api/posts/{id}/regenerate-outline` | New outline version |
| POST | `/api/sections/generate` | Generate one section |
| POST | `/api/sections/generate-all/{outline_id}` | Generate all sections |
| PATCH | `/api/sections/{id}` | Edit heading/content |
| POST | `/api/sections/reorder` | Reorder sections |
| POST | `/api/seo/analyze/{post_id}` | Run full SEO analysis |
| GET  | `/api/seo/analysis/{post_id}` | Get all analyses |
| POST | `/api/seo/meta/{post_id}` | Generate meta tags |
| GET  | `/api/export/{post_id}/markdown` | Download .md |
| GET  | `/api/export/{post_id}/html` | Download .html |

---

## SEO Scoring Breakdown

| Metric | Weight | Ideal Range |
|--------|--------|-------------|
| Keyword Density | 25% | 0.5% – 2.5% per keyword |
| Heading Hierarchy | 20% | H1 → H2 → H3, no skips |
| Flesch Readability | 20% | 60–70 (conversational) |
| Word Count | 15% | 800–2000 words |
| Meta Tags | 20% | Title ≤60 chars, Desc ≤160 chars |

Score interpretation: **≥70 = Good**, **45–69 = Needs Work**, **<45 = Poor**

---

## LLM Configuration

The app uses any OpenAI-compatible API endpoint. Change in `.env`:

```env
# Groq (LLaMA) — default
LLM_API_KEY=gsk_...
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile

# Together AI
LLM_BASE_URL=https://api.together.xyz/v1
LLM_MODEL=meta-llama/Llama-3-70b-chat-hf

# OpenAI
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

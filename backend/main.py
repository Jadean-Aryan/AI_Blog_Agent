from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import get_settings
from database import init_db
from routers import posts_router, sections_router, seo_router, export_router, auth_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="AI Blog Writer & SEO Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(sections_router, prefix="/api")
app.include_router(seo_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}

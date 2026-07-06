from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.database import connect_db, close_db
from app.api import auth_router, projects_router, analysis_router, reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME}...")
    await connect_db()
    logger.info("MongoDB connected")
    yield
    await close_db()
    logger.info("Shutting down...")


app = FastAPI(
    title="PatentIQ API",
    description="Multi-Agent AI System for Patent Novelty Assessment",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(projects_router, prefix=API_PREFIX)
app.include_router(analysis_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

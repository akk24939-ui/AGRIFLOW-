from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.db import engine, Base
from app.models.models import User, Land, LoginLog, AuditLog, Task, TaskMedia  # noqa: register all

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

# Import routers
from app.api import auth, users, lands, tasks, logs

app = FastAPI(
    title="AgriFlow Enterprise API",
    description="Smart Farm Task Monitoring Platform — Admin API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, users, lands, tasks, logs, complaints

# Register all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(lands.router)
app.include_router(tasks.router)
app.include_router(logs.router)
app.include_router(complaints.router)

import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "AgriFlow Enterprise",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "database": "postgresql+pg8000"}

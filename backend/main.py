"""
Entry point del backend FastAPI para Dry Beans.

Despliegue en Render:
  Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

Endpoints:
  GET  /            → info básica
  GET  /health      → health check (úsalo con cron-job.org)
  POST /process     → procesa CSV crudo y guarda en Supabase
  POST /train       → entrena SVM y devuelve métricas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import process, train, health

app = FastAPI(
    title="Dry Beans Backend",
    description="Pipeline + SVM sobre el dataset Dry Beans",
    version="1.0.0",
)

# CORS: permite que el frontend en Netlify llame a este backend
allow_origins = (
    ["*"]
    if settings.FRONTEND_ORIGIN == "*"
    else [settings.FRONTEND_ORIGIN, "http://localhost:5173"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(health.router)
app.include_router(process.router)
app.include_router(train.router)


@app.get("/")
def root():
    return {
        "service": "Dry Beans Backend",
        "docs": "/docs",
        "endpoints": ["/health", "POST /process", "POST /train"],
    }

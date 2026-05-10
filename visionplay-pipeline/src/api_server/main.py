"""
VisionPlay Graph Analysis API Server
=====================================
A lightweight FastAPI microservice that exposes graph-theoretic football
analytics over HTTP. Runs separately from the main WebSocket telemetry server.

Endpoints:
  POST /analyze  - Full tactical graph analysis from player positions

Usage:
  cd visionplay-pipeline
  source .venv/bin/activate
  python -m uvicorn src.api_server.main:app --host 0.0.0.0 --port 8001 --reload

The Next.js frontend can call this at http://localhost:8001/analyze
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_server.api.routes import router

app = FastAPI(
    title="VisionPlay Graph Analysis API",
    description="Graph-theoretic tactical analysis for football analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for hackathon — restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "graph-analysis-api"}

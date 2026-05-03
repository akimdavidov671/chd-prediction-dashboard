"""
FastAPI application entrypoint for the CHD Prediction API.

This app exposes two model families:

1. Framingham 10-year CHD risk prediction
   - endpoint: /api/v1/framingham/predict

2. UCI current heart disease screening
   - endpoint: /api/v1/current-heart-disease-screening/predict

Run from the project root with:

    uvicorn main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from framingham_api.predictor import load_artifact as load_framingham_artifact
from framingham_api.router import router as framingham_router
from uci_api.predictor import load_all_artifacts as load_uci_artifacts
from uci_api.router import router as uci_router


API_TITLE = "CHD Prediction API"
API_VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load model artifacts at application startup.

    This makes deployment failures obvious immediately if an artifact is missing,
    corrupted, or incompatible with the runtime environment.
    """

    load_framingham_artifact()
    load_uci_artifacts()

    yield


app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=(
        "API for coronary heart disease prediction and screening. "
        "The API includes a Framingham-style 10-year CHD risk model and "
        "a tiered UCI current heart disease screening model. "
        "Outputs are intended for screening and decision-support workflows, "
        "not standalone diagnosis."
    ),
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def root() -> dict[str, object]:
    """
    Basic root endpoint.
    """

    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "status": "running",
        "docs_url": "/docs",
        "health_url": "/health",
        "endpoints": {
            "framingham_10yr_chd_risk": "/api/v1/framingham/predict",
            "current_heart_disease_screening": (
                "/api/v1/current-heart-disease-screening/predict"
            ),
        },
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """
    Lightweight health check endpoint.

    If the application started successfully, model artifacts were already loaded
    by the lifespan startup hook.
    """

    return {
        "status": "ok",
    }


@app.get("/model-families", tags=["Model Info"])
def model_families() -> dict[str, object]:
    """
    Return a short overview of the available model families.
    """

    return {
        "model_families": [
            {
                "id": "framingham_10yr_chd_risk",
                "name": "Framingham 10-year CHD Risk Model",
                "endpoint": "/api/v1/framingham/predict",
                "description": (
                    "Predicts a model-estimated 10-year coronary heart disease "
                    "risk score from Framingham-style patient features."
                ),
            },
            {
                "id": "uci_current_heart_disease_screening",
                "name": "UCI Current Heart Disease Screening Model",
                "endpoint": "/api/v1/current-heart-disease-screening/predict",
                "description": (
                    "Automatically selects the richest eligible UCI screening "
                    "model based on supplied features: full clinical, reduced "
                    "clinical, or minimal screening."
                ),
            },
        ]
    }


app.include_router(
    framingham_router,
    prefix="/api/v1/framingham",
)

app.include_router(
    uci_router,
    prefix="/api/v1",
)
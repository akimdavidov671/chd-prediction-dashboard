"""
FastAPI router for the UCI current heart disease screening API.

This router exposes a single prediction endpoint. The prediction service
automatically selects the richest eligible model based on the supplied fields:

- Model 1: full clinical model
- Model 2: reduced clinical model
- Model 3: minimal screening model
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from .predictor import predict_current_heart_disease
from .schemas import (
    CurrentHeartDiseasePredictionResponse,
    CurrentHeartDiseaseRequest,
)


router = APIRouter(
    prefix="/current-heart-disease-screening",
    tags=["Current Heart Disease Screening"],
)


@router.post(
    "/predict",
    response_model=CurrentHeartDiseasePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Screen for current heart disease pattern",
    description=(
        "Returns a screening-oriented current heart disease score and "
        "threshold-based result. The API automatically selects the richest "
        "eligible model based on the supplied input features. This endpoint "
        "does not provide a standalone diagnosis and does not estimate "
        "10-year CHD risk."
    ),
)
def predict_current_heart_disease_screening(
    payload: CurrentHeartDiseaseRequest,
) -> CurrentHeartDiseasePredictionResponse:
    """
    Predict current heart disease screening result from UCI-style patient inputs.

    Model-selection policy:
    - use Model 1 if all full clinical features are supplied
    - otherwise use Model 2 if all reduced clinical features are supplied
    - otherwise use Model 3 using the required minimal screening features
    """

    try:
        return predict_current_heart_disease(payload)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid model artifact configuration: {exc}",
        ) from exc

    except TypeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid model artifact type: {exc}",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
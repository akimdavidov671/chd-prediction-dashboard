from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from .predictor import predict_chd_10yr
from .schemas import FraminghamPredictionResponse, FraminghamRequest


router = APIRouter(
    tags=["Framingham 10-year CHD Risk"],
)


@router.post(
    "/predict",
    response_model=FraminghamPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict 10-year CHD risk",
    description=(
        "Returns a screening-oriented 10-year CHD risk score and "
        "threshold-based classification."
    ),
)
def predict_framingham_chd(
    payload: FraminghamRequest,
) -> FraminghamPredictionResponse:
    """
    Predict elevated 10-year coronary heart disease risk from Framingham-style
    patient inputs.
    """

    try:
        return predict_chd_10yr(payload)

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
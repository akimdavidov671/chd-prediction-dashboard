"""
Prediction service for the Framingham 10-year CHD risk model.
"""
from __future__ import annotations

import __main__
from functools import lru_cache
from pathlib import Path
from typing import Any
import numpy as np

import joblib
import pandas as pd

from .preprocessing import MissingFlagger, QuantileClipper, validate_raw_features
from .schemas import FraminghamPredictionResponse, FraminghamRequest


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "artifacts"
    / "framingham_chd_pipeline.joblib"
)

DISPLAY_MODEL_NAME = "Framingham 10-year CHD Logistic Regression"
DEFAULT_THRESHOLD = 0.5


@lru_cache(maxsize=1)
def load_artifact() -> dict[str, Any]:
    """
    Load the saved model artifact once per process.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at: {MODEL_PATH}")

    __main__.QuantileClipper = QuantileClipper
    __main__.MissingFlagger = MissingFlagger

    artifact = joblib.load(MODEL_PATH)

    if not isinstance(artifact, dict):
        raise TypeError("Expected model artifact to be a dictionary.")

    if "pipeline" not in artifact:
        raise KeyError("Model artifact is missing required key: 'pipeline'")

    return artifact


def request_to_dataframe(payload: FraminghamRequest) -> pd.DataFrame:
    """
    Convert a validated API request into a one-row DataFrame.

    Nullable fields must remain present, but Python None values should be
    converted to np.nan so sklearn imputers can handle them.
    """
    raw_features = payload.model_dump()
    X = pd.DataFrame([raw_features])

    X = X.replace({None: np.nan})

    return validate_raw_features(X)

def predict_chd_10yr(
    payload: FraminghamRequest,
    threshold: float | None = None,
) -> FraminghamPredictionResponse:
    """
    Run end-to-end 10-year CHD risk prediction.
    """
    artifact = load_artifact()
    pipeline = artifact["pipeline"]

    if threshold is None:
        threshold = float(artifact.get("threshold", DEFAULT_THRESHOLD))

    if not 0 <= threshold <= 1:
        raise ValueError("threshold must be between 0 and 1")

    X = request_to_dataframe(payload)

    chd_10yr_score = float(pipeline.predict_proba(X)[0, 1])
    predicted_class = int(chd_10yr_score >= threshold)

    return FraminghamPredictionResponse(
        model_name=DISPLAY_MODEL_NAME,
        chd_10yr_score=chd_10yr_score,
        threshold=threshold,
        predicted_class=predicted_class,
        screening_result=(
            "elevated_risk" if predicted_class == 1 else "below_threshold"
        ),
    )
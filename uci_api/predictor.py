"""
Prediction service for the tiered UCI current heart disease screening API.

The service:
- accepts one broad API request schema
- determines which input fields are present
- selects the richest eligible model artifact
- builds a one-row DataFrame in the selected artifact's feature order
- runs predict_proba
- applies the artifact-specific threshold
- returns a structured screening response

Model-selection policy:
1. Model 1 if all full clinical features are available.
2. Model 2 if all reduced clinical features are available but Model 1 is not.
3. Model 3 otherwise, assuming minimal screening fields passed schema validation.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib
import numpy as np
import pandas as pd

from .model_registry import (
    ALL_MODEL_FEATURES,
    MODEL_SPECS,
    ModelSpec,
    build_selection_reason,
    get_model_spec,
    missing_required_features,
    select_highest_eligible_model,
)
from .schemas import (
    CurrentHeartDiseasePredictionResponse,
    CurrentHeartDiseaseRequest,
)


# ---------------------------------------------------------------------------
# Artifact loading
# ---------------------------------------------------------------------------

REQUIRED_ARTIFACT_KEYS = {
    "pipeline",
    "threshold",
    "feature_order",
}


@lru_cache(maxsize=3)
def load_artifact(model_id: str) -> dict[str, Any]:
    """
    Load a model artifact by model_id.

    Artifacts are cached once loaded so repeated API requests do not reload
    joblib files from disk.

    Parameters
    ----------
    model_id:
        Registered model identifier.

    Returns
    -------
    dict[str, Any]
        Loaded model artifact.

    Raises
    ------
    FileNotFoundError
        If the artifact file does not exist.

    TypeError
        If the artifact is not a dictionary or the pipeline does not support
        predict_proba.

    KeyError
        If required artifact keys are missing.
    """

    spec = get_model_spec(model_id)

    if not spec.artifact_path.exists():
        raise FileNotFoundError(
            f"Model artifact not found for {model_id!r}: {spec.artifact_path}"
        )

    artifact = joblib.load(spec.artifact_path)

    if not isinstance(artifact, dict):
        raise TypeError(
            f"Expected artifact {model_id!r} to be a dictionary, "
            f"got {type(artifact).__name__}."
        )

    missing_keys = sorted(REQUIRED_ARTIFACT_KEYS - artifact.keys())
    if missing_keys:
        raise KeyError(
            f"Artifact {model_id!r} is missing required keys: {missing_keys}"
        )

    pipeline = artifact["pipeline"]
    if not hasattr(pipeline, "predict_proba"):
        raise TypeError(
            f"Artifact {model_id!r} pipeline does not support predict_proba."
        )

    feature_order = artifact["feature_order"]
    if not isinstance(feature_order, list) or not all(
        isinstance(feature, str) for feature in feature_order
    ):
        raise TypeError(
            f"Artifact {model_id!r} has invalid feature_order. "
            "Expected list[str]."
        )

    threshold = float(artifact["threshold"])
    if not 0 <= threshold <= 1:
        raise ValueError(
            f"Artifact {model_id!r} has invalid threshold: {threshold}. "
            "Threshold must be between 0 and 1."
        )

    return artifact


def load_all_artifacts() -> dict[str, dict[str, Any]]:
    """
    Load all registered artifacts.

    This is useful for startup checks or health checks. Normal prediction only
    loads the selected model artifact.
    """

    return {spec.model_id: load_artifact(spec.model_id) for spec in MODEL_SPECS}


# ---------------------------------------------------------------------------
# Request handling and model selection
# ---------------------------------------------------------------------------

def request_to_dict(payload: CurrentHeartDiseaseRequest) -> dict[str, Any]:
    """
    Convert a validated Pydantic request into a plain dictionary.

    Only fields defined in the API request schema are included.
    """

    return payload.model_dump()


def get_available_features(payload: CurrentHeartDiseaseRequest) -> set[str]:
    """
    Return the set of API fields that were supplied with non-null values.

    Optional fields set to null are treated as unavailable for model-selection
    purposes. This prevents the full or reduced model from being selected when
    structurally required features were not actually provided.
    """

    data = request_to_dict(payload)

    return {
        feature
        for feature, value in data.items()
        if feature in ALL_MODEL_FEATURES and value is not None
    }


def select_model_for_request(payload: CurrentHeartDiseaseRequest) -> ModelSpec:
    """
    Select the richest eligible model for a validated request.
    """

    available_features = get_available_features(payload)
    return select_highest_eligible_model(available_features)


def get_model_selection_diagnostics(
    payload: CurrentHeartDiseaseRequest,
) -> dict[str, list[str]]:
    """
    Return missing required features for each model tier.

    This is useful for debugging and can be logged by the API layer if desired.
    """

    available_features = get_available_features(payload)

    return {
        spec.model_id: missing_required_features(
            available_features=available_features,
            spec=spec,
        )
        for spec in MODEL_SPECS
    }


# ---------------------------------------------------------------------------
# DataFrame construction
# ---------------------------------------------------------------------------

def request_to_dataframe(
    payload: CurrentHeartDiseaseRequest,
    feature_order: list[str],
) -> pd.DataFrame:
    """
    Convert a request into a one-row DataFrame in artifact feature order.

    The selected model should only require fields known to be available.
    This function still converts missing values to np.nan so sklearn imputers
    can handle them if an artifact's feature_order contains nullable values.

    Parameters
    ----------
    payload:
        Validated API request.

    feature_order:
        Raw feature order expected by the selected model artifact.

    Returns
    -------
    pd.DataFrame
        One-row dataframe with columns in exact model feature order.
    """

    data = request_to_dict(payload)

    row = {
        feature: data.get(feature, np.nan)
        for feature in feature_order
    }

    X = pd.DataFrame([row], columns=feature_order)
    X = X.replace({None: np.nan})

    return X


def get_missing_optional_features(payload: CurrentHeartDiseaseRequest) -> list[str]:
    """
    Return optional model features that were not supplied.

    These are fields from the union of all model features, excluding required
    Model 3 fields if they are present. The result is mostly useful for response
    transparency and debugging model-tier selection.
    """

    data = request_to_dict(payload)

    return [
        feature
        for feature in ALL_MODEL_FEATURES
        if data.get(feature) is None
    ]


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict_current_heart_disease(
    payload: CurrentHeartDiseaseRequest,
) -> CurrentHeartDiseasePredictionResponse:
    """
    Run end-to-end current heart disease screening prediction.

    Parameters
    ----------
    payload:
        Validated API request.

    Returns
    -------
    CurrentHeartDiseasePredictionResponse
        Screening score, thresholded result, selected model metadata, and
        model-selection explanation.
    """

    spec = select_model_for_request(payload)
    artifact = load_artifact(spec.model_id)

    pipeline = artifact["pipeline"]
    feature_order = artifact["feature_order"]
    threshold = float(artifact["threshold"])

    X = request_to_dataframe(
        payload=payload,
        feature_order=feature_order,
    )

    score = float(pipeline.predict_proba(X)[0, 1])
    predicted_class = int(score >= threshold)

    return CurrentHeartDiseasePredictionResponse(
        model_id=str(artifact.get("model_id", spec.model_id)),
        model_name=str(artifact.get("model_display_name", spec.display_name)),
        model_tier=spec.tier,
        model_role=str(artifact.get("model_role", spec.model_role)),
        current_hd_score=score,
        threshold=threshold,
        predicted_class=predicted_class,
        screening_result=(
            "elevated_likelihood"
            if predicted_class == 1
            else "below_threshold"
        ),
        features_used=list(feature_order),
        missing_optional_features=get_missing_optional_features(payload),
        selection_reason=build_selection_reason(spec),
    )
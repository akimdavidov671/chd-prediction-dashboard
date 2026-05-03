"""
Model registry for the UCI current heart disease screening API.

This module defines:
- the feature requirements for each model tier
- artifact locations
- model metadata used by the prediction service
- helper functions for retrieving model specifications

Model-selection policy:
1. Use Model 1 when all full clinical features are available.
2. Otherwise use Model 2 when all reduced clinical features are available.
3. Otherwise use Model 3, whose minimal screening features are required by
   the request schema.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"


# ---------------------------------------------------------------------------
# Feature definitions
# ---------------------------------------------------------------------------

MODEL1_FULL_CLINICAL_FEATURES: list[str] = [
    "age",
    "trestbps",
    "chol",
    "thalach",
    "oldpeak",
    "sex",
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal",
]

MODEL2_REDUCED_CLINICAL_FEATURES: list[str] = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
]

MODEL3_MINIMAL_SCREENING_FEATURES: list[str] = [
    "age",
    "sex",
    "cp",
    "exang",
    "trestbps",
    "thalach",
]


ALL_MODEL_FEATURES: list[str] = sorted(
    set(
        MODEL1_FULL_CLINICAL_FEATURES
        + MODEL2_REDUCED_CLINICAL_FEATURES
        + MODEL3_MINIMAL_SCREENING_FEATURES
    )
)


# ---------------------------------------------------------------------------
# Model registry
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ModelSpec:
    """
    Static registry entry for one deployed model artifact.

    Attributes
    ----------
    model_id:
        Stable internal identifier for the model artifact.

    display_name:
        Human-readable model name for API responses and documentation.

    model_role:
        Short description of when this model should be used.

    artifact_path:
        Filesystem path to the serialized joblib artifact.

    required_features:
        Raw input features required before this model can be selected.

    tier:
        Model tier. Lower number means richer model.
        Tier 1 = full clinical model.
        Tier 2 = reduced clinical model.
        Tier 3 = minimal screening model.
    """

    model_id: str
    display_name: str
    model_role: str
    artifact_path: Path
    required_features: list[str]
    tier: int


MODEL1_FULL_CLINICAL = ModelSpec(
    model_id="model1_full_clinical_v1",
    display_name="UCI Heart Disease Full Clinical Model",
    model_role="Full clinical screening model used when all clinical, ECG, exercise, and diagnostic fields are available.",
    artifact_path=ARTIFACT_DIR / "model1_full_clinical_v1.joblib",
    required_features=MODEL1_FULL_CLINICAL_FEATURES,
    tier=1,
)

MODEL2_REDUCED_CLINICAL = ModelSpec(
    model_id="model2_reduced_clinical_v1",
    display_name="UCI Heart Disease Reduced Clinical Model",
    model_role="Reduced clinical screening model used when core clinical and exercise fields are available but full diagnostic fields are incomplete.",
    artifact_path=ARTIFACT_DIR / "model2_reduced_clinical_v1.joblib",
    required_features=MODEL2_REDUCED_CLINICAL_FEATURES,
    tier=2,
)

MODEL3_MINIMAL_SCREENING = ModelSpec(
    model_id="model3_minimal_screening_v1",
    display_name="UCI Heart Disease Minimal Screening Model",
    model_role="Minimal screening model used when only the required lightweight screening fields are available.",
    artifact_path=ARTIFACT_DIR / "model3_minimal_screening_v1.joblib",
    required_features=MODEL3_MINIMAL_SCREENING_FEATURES,
    tier=3,
)


# Ordered from richest to most minimal.
# The prediction service should iterate through this list in order.
MODEL_SPECS: tuple[ModelSpec, ...] = (
    MODEL1_FULL_CLINICAL,
    MODEL2_REDUCED_CLINICAL,
    MODEL3_MINIMAL_SCREENING,
)


MODEL_SPECS_BY_ID: dict[str, ModelSpec] = {
    spec.model_id: spec for spec in MODEL_SPECS
}


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_model_spec(model_id: str) -> ModelSpec:
    """
    Return a model specification by model_id.

    Raises
    ------
    KeyError
        If the model_id is not registered.
    """

    try:
        return MODEL_SPECS_BY_ID[model_id]
    except KeyError as exc:
        registered = ", ".join(MODEL_SPECS_BY_ID)
        raise KeyError(
            f"Unknown model_id: {model_id!r}. "
            f"Registered model_ids: {registered}"
        ) from exc


def missing_required_features(
    available_features: set[str],
    spec: ModelSpec,
) -> list[str]:
    """
    Return the required features missing for a given model specification.
    """

    return [
        feature
        for feature in spec.required_features
        if feature not in available_features
    ]


def is_model_eligible(
    available_features: set[str],
    spec: ModelSpec,
) -> bool:
    """
    Check whether all required features for a model are available.
    """

    return not missing_required_features(
        available_features=available_features,
        spec=spec,
    )


def select_highest_eligible_model(
    available_features: set[str],
) -> ModelSpec:
    """
    Select the richest eligible model based on available input features.

    The registry is ordered from richest to most minimal model. The first model
    whose required features are all available is selected.

    Raises
    ------
    ValueError
        If no registered model is eligible. This should not happen if the API
        request schema requires all Model 3 minimal screening features.
    """

    for spec in MODEL_SPECS:
        if is_model_eligible(available_features=available_features, spec=spec):
            return spec

    raise ValueError(
        "Insufficient features for all registered current heart disease "
        "screening models. Minimal screening features are required: "
        f"{MODEL3_MINIMAL_SCREENING_FEATURES}"
    )


def build_selection_reason(spec: ModelSpec) -> str:
    """
    Build a human-readable explanation of why a model tier was selected.
    """

    if spec.tier == 1:
        return "All full clinical model features were provided."

    if spec.tier == 2:
        return (
            "Reduced clinical model features were provided, but not all full "
            "clinical model features were available."
        )

    if spec.tier == 3:
        return (
            "Only the minimal screening feature requirements were fully "
            "satisfied."
        )

    return "Selected the highest eligible model based on available features."
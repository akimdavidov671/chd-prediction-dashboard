"""
Pydantic schemas for the UCI current heart disease screening API.

The API accepts a broad patient-level input schema:
- Model 3 minimal screening features are required.
- Model 2 and Model 1 features are optional.
- The prediction service automatically selects the richest eligible model.

This API predicts a screening-oriented current heart disease likelihood score.
It is not a diagnostic endpoint and does not estimate 10-year CHD risk.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class CurrentHeartDiseaseRequest(BaseModel):
    """
    Patient-level input for the tiered UCI current heart disease screening API.

    Required fields are the minimal screening features used by Model 3.

    Optional fields allow the API to automatically select a richer model:
    - if all Model 1 fields are present, Model 1 is used
    - otherwise, if all Model 2 fields are present, Model 2 is used
    - otherwise, Model 3 is used
    """

    # ------------------------------------------------------------------
    # Model 3 minimal screening features - required
    # ------------------------------------------------------------------

    age: int = Field(
        ...,
        ge=18,
        le=100,
        description="Age in years.",
        examples=[55],
    )

    sex: Literal[0, 1] = Field(
        ...,
        description="Biological sex encoded as 0 for female, 1 for male.",
        examples=[1],
    )

    cp: Literal[1, 2, 3, 4] = Field(
        ...,
        description=(
            "Chest pain type: "
            "1 typical angina, "
            "2 atypical angina, "
            "3 non-anginal pain, "
            "4 asymptomatic."
        ),
        examples=[4],
    )

    exang: Literal[0, 1] = Field(
        ...,
        description="Exercise-induced angina: 1 yes, 0 no.",
        examples=[1],
    )

    trestbps: float = Field(
        ...,
        ge=70,
        le=250,
        description="Resting blood pressure in mm Hg.",
        examples=[140],
    )

    thalach: float = Field(
        ...,
        ge=60,
        le=230,
        description="Maximum heart rate achieved.",
        examples=[130],
    )

    # ------------------------------------------------------------------
    # Model 2 reduced clinical features - optional extras
    # ------------------------------------------------------------------

    chol: float | None = Field(
        None,
        ge=80,
        le=700,
        description=(
            "Serum cholesterol in mg/dl. Optional. "
            "Required for reduced and full clinical model selection."
        ),
        examples=[245],
    )

    restecg: Literal[0, 1, 2] | None = Field(
        None,
        description=(
            "Resting electrocardiographic results. Optional. "
            "0 normal, "
            "1 ST-T wave abnormality, "
            "2 probable or definite left ventricular hypertrophy."
        ),
        examples=[0],
    )

    oldpeak: float | None = Field(
        None,
        ge=0,
        le=10,
        description=(
            "ST depression induced by exercise relative to rest. Optional. "
            "Required for reduced and full clinical model selection."
        ),
        examples=[1.5],
    )

    # ------------------------------------------------------------------
    # Model 1 full clinical features - optional extras
    # ------------------------------------------------------------------

    fbs: Literal[0, 1] | None = Field(
        None,
        description=(
            "Fasting blood sugar greater than 120 mg/dl: 1 true, 0 false. "
            "Optional. Required for full clinical model selection."
        ),
        examples=[0],
    )

    slope: Literal[1, 2, 3] | None = Field(
        None,
        description=(
            "Slope of the peak exercise ST segment. Optional. "
            "1 upsloping, 2 flat, 3 downsloping. "
            "Required for full clinical model selection."
        ),
        examples=[2],
    )

    ca: Literal[0, 1, 2, 3] | None = Field(
        None,
        description=(
            "Number of major vessels colored by fluoroscopy. Optional. "
            "Allowed values: 0, 1, 2, or 3. "
            "Required for full clinical model selection."
        ),
        examples=[0],
    )

    thal: Literal[3, 6, 7] | None = Field(
        None,
        description=(
            "Thalassemia result. Optional. "
            "3 normal, 6 fixed defect, 7 reversible defect. "
            "Required for full clinical model selection."
        ),
        examples=[3],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "summary": "Minimal screening input - selects Model 3",
                    "value": {
                        "age": 55,
                        "sex": 1,
                        "cp": 4,
                        "exang": 1,
                        "trestbps": 140,
                        "thalach": 130,
                    },
                },
                {
                    "summary": "Reduced clinical input - selects Model 2",
                    "value": {
                        "age": 55,
                        "sex": 1,
                        "cp": 4,
                        "exang": 1,
                        "trestbps": 140,
                        "thalach": 130,
                        "chol": 245,
                        "restecg": 0,
                        "oldpeak": 1.5,
                    },
                },
                {
                    "summary": "Full clinical input - selects Model 1",
                    "value": {
                        "age": 55,
                        "sex": 1,
                        "cp": 4,
                        "exang": 1,
                        "trestbps": 140,
                        "thalach": 130,
                        "chol": 245,
                        "restecg": 0,
                        "oldpeak": 1.5,
                        "fbs": 0,
                        "slope": 2,
                        "ca": 0,
                        "thal": 3,
                    },
                },
            ]
        }
    }


class CurrentHeartDiseasePredictionResponse(BaseModel):
    """
    Prediction response returned by the current heart disease screening API.

    The score is a model-estimated screening score for current heart disease
    pattern recognition. It should not be interpreted as a standalone diagnosis
    or as a 10-year CHD risk estimate.
    """

    model_id: str = Field(
        ...,
        description="Stable identifier of the model artifact used for prediction.",
        examples=["model3_minimal_screening_v1"],
    )

    model_name: str = Field(
        ...,
        description="Human-readable model name.",
        examples=["UCI Heart Disease Minimal Screening Model"],
    )

    model_tier: Literal[1, 2, 3] = Field(
        ...,
        description=(
            "Selected model tier. "
            "1 full clinical, 2 reduced clinical, 3 minimal screening."
        ),
        examples=[3],
    )

    model_role: str = Field(
        ...,
        description="Short description of when the selected model is used.",
        examples=[
            "Minimal screening model used when only the required lightweight screening fields are available."
        ],
    )

    current_hd_score: float = Field(
        ...,
        ge=0,
        le=1,
        description=(
            "Model positive-class score for current heart disease screening. "
            "This is a screening score, not a definitive diagnosis."
        ),
        examples=[0.64],
    )

    threshold: float = Field(
        ...,
        ge=0,
        le=1,
        description="Decision threshold used to convert score into screening result.",
        examples=[0.3723476801777547],
    )

    predicted_class: Literal[0, 1] = Field(
        ...,
        description=(
            "Binary prediction after applying the model threshold: "
            "1 elevated likelihood, 0 below threshold."
        ),
        examples=[1],
    )

    screening_result: Literal["below_threshold", "elevated_likelihood"] = Field(
        ...,
        description="Human-readable threshold-based screening result.",
        examples=["elevated_likelihood"],
    )

    features_used: list[str] = Field(
        ...,
        description="Raw input features used by the selected model.",
        examples=[["age", "sex", "cp", "exang", "trestbps", "thalach"]],
    )

    missing_optional_features: list[str] = Field(
        ...,
        description=(
            "Optional API fields that were not supplied. These help explain "
            "why a richer model tier may not have been selected."
        ),
        examples=[["chol", "restecg", "oldpeak", "fbs", "slope", "ca", "thal"]],
    )

    selection_reason: str = Field(
        ...,
        description="Explanation of why the selected model tier was used.",
        examples=["Only the minimal screening feature requirements were fully satisfied."],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "model_id": "model3_minimal_screening_v1",
                "model_name": "UCI Heart Disease Minimal Screening Model",
                "model_tier": 3,
                "model_role": (
                    "Minimal screening model used when only the required "
                    "lightweight screening fields are available."
                ),
                "current_hd_score": 0.64,
                "threshold": 0.3723476801777547,
                "predicted_class": 1,
                "screening_result": "elevated_likelihood",
                "features_used": [
                    "age",
                    "sex",
                    "cp",
                    "exang",
                    "trestbps",
                    "thalach",
                ],
                "missing_optional_features": [
                    "chol",
                    "restecg",
                    "oldpeak",
                    "fbs",
                    "slope",
                    "ca",
                    "thal",
                ],
                "selection_reason": (
                    "Only the minimal screening feature requirements were "
                    "fully satisfied."
                ),
            }
        }
    }
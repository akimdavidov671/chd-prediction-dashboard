"""
Pydantic schemas for the Framingham 10-year CHD risk API.

This module defines the external API contract:
- which fields the client must send
- which values are accepted
- what the prediction response looks like
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class FraminghamRequest(BaseModel):
    """
    Raw patient-level input for the Framingham 10-year CHD model.

    Missing values are allowed only for fields that were explicitly handled
    during model development: education, BPMeds, and glucose.
    """

    male: Literal[0, 1] = Field(
        ...,
        description="Biological sex encoded as 1 for male, 0 for female.",
        examples=[1],
    )

    age: int = Field(
        ...,
        ge=20,
        le=100,
        description="Age in years.",
        examples=[52],
    )

    education: int | None = Field(
        None,
        ge=1,
        le=4,
        description="Education level encoded from 1 to 4. May be null.",
        examples=[2],
    )

    currentSmoker: Literal[0, 1] = Field(
        ...,
        description="Current smoking status: 1 if current smoker, 0 otherwise.",
        examples=[1],
    )

    cigsPerDay: float = Field(
        ...,
        ge=0,
        le=100,
        description="Average number of cigarettes smoked per day.",
        examples=[10],
    )

    BPMeds: Literal[0, 1] | None = Field(
        None,
        description="Use of blood pressure medication: 1 yes, 0 no. May be null.",
        examples=[0],
    )

    prevalentStroke: Literal[0, 1] = Field(
        ...,
        description="History of prevalent stroke: 1 yes, 0 no.",
        examples=[0],
    )

    prevalentHyp: Literal[0, 1] = Field(
        ...,
        description="Prevalent hypertension: 1 yes, 0 no.",
        examples=[1],
    )

    diabetes: Literal[0, 1] = Field(
        ...,
        description="Diabetes status: 1 yes, 0 no.",
        examples=[0],
    )

    totChol: float = Field(
        ...,
        ge=80,
        le=700,
        description="Total cholesterol.",
        examples=[240],
    )

    sysBP: float = Field(
        ...,
        ge=70,
        le=300,
        description="Systolic blood pressure.",
        examples=[140],
    )

    diaBP: float = Field(
        ...,
        ge=40,
        le=180,
        description="Diastolic blood pressure.",
        examples=[85],
    )

    BMI: float = Field(
        ...,
        ge=10,
        le=80,
        description="Body mass index.",
        examples=[27.5],
    )

    heartRate: float = Field(
        ...,
        ge=30,
        le=220,
        description="Resting heart rate.",
        examples=[75],
    )

    glucose: float | None = Field(
        None,
        ge=40,
        le=500,
        description="Blood glucose. May be null.",
        examples=[85],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "male": 1,
                "age": 52,
                "education": 2,
                "currentSmoker": 1,
                "cigsPerDay": 10,
                "BPMeds": 0,
                "prevalentStroke": 0,
                "prevalentHyp": 1,
                "diabetes": 0,
                "totChol": 240,
                "sysBP": 140,
                "diaBP": 85,
                "BMI": 27.5,
                "heartRate": 75,
                "glucose": 85,
            }
        }
    }


class FraminghamPredictionResponse(BaseModel):
    """
    Prediction response returned by the Framingham API endpoint.

    chd_10yr_score is the model's positive-class score. Since the selected
    production model is not calibrated, this should be interpreted primarily
    as a screening/ranking score rather than a clinically calibrated absolute
    10-year risk estimate.
    """

    model_name: str = Field(
        ...,
        description="Name of the model artifact used for prediction.",
        examples=["Framingham 10-year CHD Logistic Regression"],
    )

    chd_10yr_score: float = Field(
        ...,
        ge=0,
        le=1,
        description="Model score for 10-year CHD risk.",
        examples=[0.42],
    )

    threshold: float = Field(
        ...,
        ge=0,
        le=1,
        description="Decision threshold used to convert score into screening result.",
        examples=[0.5],
    )

    predicted_class: Literal[0, 1] = Field(
        ...,
        description="Binary prediction after applying the threshold: 1 elevated risk, 0 below threshold.",
        examples=[0],
    )

    screening_result: Literal["below_threshold", "elevated_risk"] = Field(
        ...,
        description="Human-readable screening result derived from predicted_class.",
        examples=["below_threshold"],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "model_name": "Framingham 10-year CHD Logistic Regression",
                "chd_10yr_score": 0.42,
                "threshold": 0.5,
                "predicted_class": 0,
                "screening_result": "below_threshold",
            }
        }
    }

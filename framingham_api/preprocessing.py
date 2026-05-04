"""
Preprocessing utilities for the Framingham 10-year CHD risk model.

This module contains the reusable preprocessing logic used by the training
notebook and by the API inference path.
"""

from __future__ import annotations

from typing import Iterable

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


TARGET_COLUMN = "TenYearCHD"

RAW_FEATURE_COLUMNS = [
    "male",
    "age",
    "education",
    "currentSmoker",
    "cigsPerDay",
    "BPMeds",
    "prevalentStroke",
    "prevalentHyp",
    "diabetes",
    "totChol",
    "sysBP",
    "diaBP",
    "BMI",
    "heartRate",
    "glucose",
]

MISSING_INDICATOR_COLUMNS = ["glucose", "education", "BPMeds"]

CONTINUOUS_COLUMNS = [
    "age",
    "glucose",
    "totChol",
    "cigsPerDay",
    "BMI",
    "heartRate",
    "sysBP",
    "diaBP",
]

BINARY_OR_CATEGORICAL_COLUMNS = ["education", "BPMeds"]

PASSTHROUGH_COLUMNS = [
    col
    for col in RAW_FEATURE_COLUMNS
    if col not in CONTINUOUS_COLUMNS + BINARY_OR_CATEGORICAL_COLUMNS
]


class QuantileClipper(BaseEstimator, TransformerMixin):
    """
    Clip numeric columns using quantile bounds learned from the training data.

    This transformer is intended to be used inside a scikit-learn pipeline.
    """

    def __init__(self, lower_quantile: float = 0.01, upper_quantile: float = 0.99):
        self.lower_quantile = lower_quantile
        self.upper_quantile = upper_quantile

    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()
        self.feature_names_in_ = X_df.columns.to_list()

        for col in self.feature_names_in_:
            X_df[col] = pd.to_numeric(X_df[col], errors="coerce")

        self.lower_bounds_ = X_df.quantile(self.lower_quantile)
        self.upper_bounds_ = X_df.quantile(self.upper_quantile)
        return self

    def transform(self, X):
        X_df = pd.DataFrame(X, columns=self.feature_names_in_).copy()
        X_df = X_df[self.feature_names_in_]

        for col in self.feature_names_in_:
            X_df[col] = pd.to_numeric(X_df[col], errors="coerce").clip(
                lower=self.lower_bounds_[col],
                upper=self.upper_bounds_[col],
            )

        return X_df

    def get_feature_names_out(self, input_features=None):
        if input_features is None:
            input_features = self.feature_names_in_
        return np.asarray(input_features, dtype=object)


class MissingFlagger(BaseEstimator, TransformerMixin):
    """
    Create explicit missingness indicator columns for selected variables.

    The indicators are created before imputation in the full preprocessing
    pipeline.
    """

    def fit(self, X, y=None):
        X_df = pd.DataFrame(X).copy()
        self.feature_names_in_ = X_df.columns.to_list()
        return self

    def transform(self, X):
        X_df = pd.DataFrame(X, columns=self.feature_names_in_).copy()
        X_df = X_df[self.feature_names_in_]

        return pd.DataFrame(
            {
                f"{col}_missing": X_df[col].isna().astype(int)
                for col in self.feature_names_in_
            },
            index=X_df.index,
        )

    def get_feature_names_out(self, input_features=None):
        if input_features is None:
            input_features = self.feature_names_in_
        return np.asarray([f"{col}_missing" for col in input_features], dtype=object)


def build_preprocessor() -> ColumnTransformer:
    """
    Build the complete preprocessing pipeline for the Framingham model.

    Processing steps:
    - continuous columns: quantile clipping -> median imputation -> scaling
    - education/BPMeds: most-frequent imputation
    - selected columns: missingness indicators before imputation
    - remaining binary columns: passthrough
    """

    continuous_pipeline = Pipeline(
        steps=[
            ("clip", QuantileClipper(lower_quantile=0.01, upper_quantile=0.99)),
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    binary_or_cat_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
        ]
    )

    missing_indicator_pipeline = Pipeline(
        steps=[
            ("flagger", MissingFlagger()),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("continuous", continuous_pipeline, CONTINUOUS_COLUMNS),
            ("binary_cat", binary_or_cat_pipeline, BINARY_OR_CATEGORICAL_COLUMNS),
            ("missing_flags", missing_indicator_pipeline, MISSING_INDICATOR_COLUMNS),
            ("passthrough", "passthrough", PASSTHROUGH_COLUMNS),
        ],
        remainder="drop",
        verbose_feature_names_out=True,
    )


def validate_raw_features(X: pd.DataFrame, required_columns: Iterable[str] = RAW_FEATURE_COLUMNS) -> pd.DataFrame:
    """
    Validate and order raw model features before preprocessing.

    This is useful for API inference, where payload field order is not reliable.
    Extra columns are ignored. Missing required columns raise a ValueError.
    """

    if not isinstance(X, pd.DataFrame):
        X = pd.DataFrame(X)

    required_columns = list(required_columns)
    missing_columns = [col for col in required_columns if col not in X.columns]

    if missing_columns:
        raise ValueError(f"Missing required feature columns: {missing_columns}")

    return X.loc[:, required_columns].copy()

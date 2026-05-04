# chd-prediction-dashboard

## Project Overview

This repository contains an end-to-end machine learning system for coronary heart disease screening and risk prediction. The project combines two related but distinct prediction tasks:

1. **10-year CHD risk prediction**
2. **Current heart disease screening**

The modeling work is developed in Jupyter notebooks, exported as reusable machine learning artifacts, and later served through a backend API with a simple frontend interface.

### Datasets

This project uses two public clinical datasets:

- **Framingham Cohort Study** — used for 10-year coronary heart disease risk prediction.  
  Data source: https://biolincc.nhlbi.nih.gov/studies/framcohort/

- **UCI Heart Disease Dataset** — used for current heart disease screening and classification.  
  Data source: https://archive.ics.uci.edu/dataset/45/heart+disease

The datasets are not redistributed in this repository. To reproduce the notebook workflows, download the datasets from the original sources and place them in the expected local data directory.

## Notebook Workflows

#### Exploratory Data Analysis

The Framingham dataset presents an imbalanced binary classification problem: only about **15.2%** of patients develop CHD within 10 years, while approximately **84.8%** do not. This makes accuracy alone a weak evaluation metric and motivates the later use of ROC-AUC, PR-AUC, recall, precision, and class-weighted modeling.

<img src="plots/framingham_plots/eda_target_distribution.png" width="500">

The EDA shows that CHD risk is **multifactorial**. Age and blood-pressure-related variables show the clearest risk gradients, while features such as cholesterol, glucose, diabetes, smoking intensity, and prevalent hypertension provide additional but less individually decisive signal. The feature distributions also show substantial overlap between CHD-positive and CHD-negative patients, suggesting that no single variable cleanly separates the two classes.

<img src="plots/framingham_plots/eda_risk_by_feature.png" width="900">

Key EDA findings:

- The target variable is strongly imbalanced, with a minority positive class.
- CHD risk increases most consistently with **age** and **systolic blood pressure**.
- Several clinically relevant variables show useful but weaker individual associations with the target.
- Missing values, skewed distributions, and high-value outliers motivate the preprocessing pipeline used before modeling.


#### Preprocessing
#### Experimentation
#### Cross-Validation and Model Selection
#### Understanding Model Behaviour

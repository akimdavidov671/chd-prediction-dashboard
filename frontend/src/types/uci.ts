export type BinaryValue = 0 | 1;

export type CurrentHeartDiseaseRequest = {
  age: number;
  sex: BinaryValue;
  cp: 1 | 2 | 3 | 4;
  exang: BinaryValue;
  trestbps: number;
  thalach: number;

  chol?: number | null;
  restecg?: 0 | 1 | 2 | null;
  oldpeak?: number | null;

  fbs?: BinaryValue | null;
  slope?: 1 | 2 | 3 | null;
  ca?: 0 | 1 | 2 | 3 | null;
  thal?: 3 | 6 | 7 | null;
};

export type CurrentHeartDiseasePredictionResponse = {
  model_id: string;
  model_name: string;
  model_tier: 1 | 2 | 3;
  model_role: string;
  current_hd_score: number;
  threshold: number;
  predicted_class: BinaryValue;
  screening_result: "below_threshold" | "elevated_likelihood";
  features_used: string[];
  missing_optional_features: string[];
  selection_reason: string;
};

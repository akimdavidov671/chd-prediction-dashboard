export type BinaryValue = 0 | 1;

export type FraminghamRequest = {
  male: BinaryValue;
  age: number;
  education: 1 | 2 | 3 | 4 | null;
  currentSmoker: BinaryValue;
  cigsPerDay: number;
  BPMeds: BinaryValue | null;
  prevalentStroke: BinaryValue;
  prevalentHyp: BinaryValue;
  diabetes: BinaryValue;
  totChol: number;
  sysBP: number;
  diaBP: number;
  BMI: number;
  heartRate: number;
  glucose: number | null;
};

export type FraminghamPredictionResponse = {
  model_name: string;
  chd_10yr_score: number;
  threshold: number;
  predicted_class: BinaryValue;
  screening_result: "below_threshold" | "elevated_risk";
};

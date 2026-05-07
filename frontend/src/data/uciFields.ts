export const sexOptions = [
  { label: "Female", value: 0 },
  { label: "Male", value: 1 },
] as const;

export const yesNoOptions = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
] as const;

export const optionalYesNoOptions = [
  { label: "Not provided", value: null },
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
] as const;

export const chestPainOptions = [
  { label: "Typical angina", value: 1 },
  { label: "Atypical angina", value: 2 },
  { label: "Non-anginal pain", value: 3 },
  { label: "Asymptomatic", value: 4 },
] as const;

export const restingEcgOptions = [
  { label: "Not provided", value: null },
  { label: "Normal", value: 0 },
  { label: "ST-T wave abnormality", value: 1 },
  { label: "Probable or definite left ventricular hypertrophy", value: 2 },
] as const;

export const slopeOptions = [
  { label: "Not provided", value: null },
  { label: "Upsloping ST segment", value: 1 },
  { label: "Flat ST segment", value: 2 },
  { label: "Downsloping ST segment", value: 3 },
] as const;

export const majorVesselsOptions = [
  { label: "Not provided", value: null },
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
] as const;

export const thalassemiaOptions = [
  { label: "Not provided", value: null },
  { label: "Normal", value: 3 },
  { label: "Fixed defect", value: 6 },
  { label: "Reversible defect", value: 7 },
] as const;

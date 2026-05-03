export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function humanizeFieldName(fieldName: string): string {
  const labels: Record<string, string> = {
    BPMeds: "Blood pressure medication",
    BMI: "Body mass index",
    sysBP: "Systolic blood pressure",
    diaBP: "Diastolic blood pressure",
    totChol: "Total cholesterol",
    cigsPerDay: "Cigarettes per day",
    currentSmoker: "Current smoker",
    prevalentStroke: "History of stroke",
    prevalentHyp: "Prevalent hypertension",
    heartRate: "Resting heart rate",
    thalach: "Maximum heart rate achieved",
    trestbps: "Resting blood pressure",
    oldpeak: "ST depression",
    restecg: "Resting ECG",
    exang: "Exercise-induced angina",
    fbs: "Fasting blood sugar",
    cp: "Chest pain type",
    ca: "Major vessels",
    thal: "Thalassemia",
  };

  return (
    labels[fieldName] ??
    fieldName
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (char) => char.toUpperCase())
  );
}

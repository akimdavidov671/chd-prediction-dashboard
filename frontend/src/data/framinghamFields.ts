export const sexOptions = [
  { label: "Female", value: 0 },
  { label: "Male", value: 1 },
] as const;

export const yesNoOptions = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
] as const;

export const yesNoUnknownOptions = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
  { label: "Unknown", value: null },
] as const;

export const educationOptions = [
  { label: "Some high school", value: 1 },
  { label: "High school or GED", value: 2 },
  { label: "Some college or vocational school", value: 3 },
  { label: "College degree or higher", value: 4 },
  { label: "Unknown", value: null },
] as const;

import { type FormEvent, useState } from "react";
import { predictFramingham } from "../api/framingham";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { FormSection } from "../components/common/FormSection";
import { NumberInput } from "../components/common/NumberInput";
import { RadioGroup } from "../components/common/RadioGroup";
import { SelectInput } from "../components/common/SelectInput";
import { MedicalDisclaimer } from "../components/medical/MedicalDisclaimer";
import { ResultBadge } from "../components/medical/ResultBadge";
import { ScoreBar } from "../components/medical/ScoreBar";
import {
  educationOptions,
  sexOptions,
  yesNoOptions,
  yesNoUnknownOptions,
} from "../data/framinghamFields";
import type {
  FraminghamPredictionResponse,
  FraminghamRequest,
} from "../types/framingham";
import { formatPercent } from "../utils/format";

const initialForm: FraminghamRequest = {
  male: 1,
  age: 52,
  education: 2,
  currentSmoker: 1,
  cigsPerDay: 10,
  BPMeds: 0,
  prevalentStroke: 0,
  prevalentHyp: 1,
  diabetes: 0,
  totChol: 240,
  sysBP: 140,
  diaBP: 85,
  BMI: 27.5,
  heartRate: 75,
  glucose: 85,
};

export function FraminghamRiskPage() {
  const [form, setForm] = useState<FraminghamRequest>(initialForm);
  const [result, setResult] = useState<FraminghamPredictionResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<TKey extends keyof FraminghamRequest>(
    key: TKey,
    value: FraminghamRequest[TKey],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const prediction = await predictFramingham(form);
      setResult(prediction);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Prediction request failed. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setResult(null);
    setErrorMessage(null);
  }

  const smokingConsistencyWarning =
    form.currentSmoker === 1 && form.cigsPerDay === 0
      ? "Current smoker is set to Yes, but cigarettes per day is 0. The backend will accept this, but you may want to verify the input."
      : form.currentSmoker === 0 && form.cigsPerDay > 0
        ? "Current smoker is set to No, but cigarettes per day is greater than 0. The backend will accept this, but you may want to verify the input."
        : null;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Framingham model
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            10-Year CHD Risk Prediction
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Enter Framingham-style patient risk factors to estimate a
            model-derived 10-year coronary heart disease risk score.
          </p>
        </div>

        <MedicalDisclaimer variant="risk" />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Demographic and lifestyle information"
          description="Basic patient characteristics and smoking-related inputs."
        >
          <NumberInput
            label="Age"
            value={form.age}
            min={20}
            max={100}
            required
            helperText="Allowed range: 20 to 100 years."
            onChange={(value) => {
              if (value !== "") updateField("age", value);
            }}
          />

          <RadioGroup
            label="Biological sex"
            value={form.male}
            options={sexOptions}
            required
            onChange={(value) => updateField("male", value)}
          />

          <SelectInput
            label="Education level"
            value={form.education}
            options={educationOptions}
            helperText="This field may be left as unknown."
            onChange={(value) => updateField("education", value)}
          />

          <RadioGroup
            label="Current smoker"
            value={form.currentSmoker}
            options={yesNoOptions}
            required
            onChange={(value) => updateField("currentSmoker", value)}
          />

          <NumberInput
            label="Cigarettes per day"
            value={form.cigsPerDay}
            min={0}
            max={100}
            step={1}
            required
            helperText="Use 0 for non-smokers."
            onChange={(value) => {
              if (value !== "") updateField("cigsPerDay", value);
            }}
          />
        </FormSection>

        <FormSection
          title="Medical history"
          description="Prior diagnoses and medication indicators used by the risk model."
        >
          <RadioGroup
            label="Blood pressure medication"
            value={form.BPMeds}
            options={yesNoUnknownOptions}
            helperText="This field may be left as unknown."
            onChange={(value) => updateField("BPMeds", value)}
          />

          <RadioGroup
            label="History of stroke"
            value={form.prevalentStroke}
            options={yesNoOptions}
            required
            onChange={(value) => updateField("prevalentStroke", value)}
          />

          <RadioGroup
            label="Prevalent hypertension"
            value={form.prevalentHyp}
            options={yesNoOptions}
            required
            onChange={(value) => updateField("prevalentHyp", value)}
          />

          <RadioGroup
            label="Diabetes"
            value={form.diabetes}
            options={yesNoOptions}
            required
            onChange={(value) => updateField("diabetes", value)}
          />
        </FormSection>

        <FormSection
          title="Clinical measurements"
          description="Continuous measurements. Values are validated again by the FastAPI backend."
        >
          <NumberInput
            label="Total cholesterol"
            value={form.totChol}
            min={80}
            max={700}
            step={1}
            required
            helperText="Allowed API range: 80 to 700."
            onChange={(value) => {
              if (value !== "") updateField("totChol", value);
            }}
          />

          <NumberInput
            label="Systolic blood pressure"
            value={form.sysBP}
            min={70}
            max={300}
            step={1}
            required
            helperText="Allowed API range: 70 to 300."
            onChange={(value) => {
              if (value !== "") updateField("sysBP", value);
            }}
          />

          <NumberInput
            label="Diastolic blood pressure"
            value={form.diaBP}
            min={40}
            max={180}
            step={1}
            required
            helperText="Allowed API range: 40 to 180."
            onChange={(value) => {
              if (value !== "") updateField("diaBP", value);
            }}
          />

          <NumberInput
            label="Body mass index"
            value={form.BMI}
            min={10}
            max={80}
            step={0.1}
            required
            helperText="Allowed API range: 10 to 80."
            onChange={(value) => {
              if (value !== "") updateField("BMI", value);
            }}
          />

          <NumberInput
            label="Resting heart rate"
            value={form.heartRate}
            min={30}
            max={220}
            step={1}
            required
            helperText="Allowed API range: 30 to 220."
            onChange={(value) => {
              if (value !== "") updateField("heartRate", value);
            }}
          />

          <NumberInput
            label="Glucose"
            value={form.glucose ?? ""}
            min={40}
            max={500}
            step={1}
            helperText="Optional. Leave blank if unknown."
            onChange={(value) => {
              updateField("glucose", value === "" ? null : value);
            }}
          />
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Calculating..." : "Calculate 10-year risk score"}
          </Button>

          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset example values
          </Button>
        </div>

        {smokingConsistencyWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {smokingConsistencyWarning}
          </div>
        ) : null}

        <ErrorMessage message={errorMessage} />
      </form>

      {result ? (
        <Card className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Prediction result
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Model used: {result.model_name}
              </p>
            </div>

            <ResultBadge result={result.screening_result} />
          </div>

          <ScoreBar
            score={result.chd_10yr_score}
            threshold={result.threshold}
            label="10-year CHD risk score"
          />

          <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Score</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatPercent(result.chd_10yr_score)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Decision threshold</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatPercent(result.threshold)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Binary class</p>
              <p className="mt-1 font-semibold text-slate-900">
                {result.predicted_class}
              </p>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            The score should be interpreted as a model-derived risk score rather
            than a definitive clinical probability or diagnosis.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

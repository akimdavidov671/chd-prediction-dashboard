import { type FormEvent, useState } from "react";
import { predictCurrentHeartDisease } from "../api/uci";
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
  chestPainOptions,
  majorVesselsOptions,
  optionalYesNoOptions,
  restingEcgOptions,
  sexOptions,
  slopeOptions,
  thalassemiaOptions,
  yesNoOptions,
} from "../data/uciFields";
import type {
  CurrentHeartDiseasePredictionResponse,
  CurrentHeartDiseaseRequest,
} from "../types/uci";
import { formatPercent, humanizeFieldName } from "../utils/format";

const initialForm: CurrentHeartDiseaseRequest = {
  age: 58,
  sex: 1,
  cp: 4,
  exang: 1,
  trestbps: 145,
  thalach: 130,

  chol: null,
  restecg: null,
  oldpeak: null,

  fbs: null,
  slope: null,
  ca: null,
  thal: null,
};

export function CurrentScreeningPage() {
  const [form, setForm] = useState<CurrentHeartDiseaseRequest>(initialForm);
  const [result, setResult] =
    useState<CurrentHeartDiseasePredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<TKey extends keyof CurrentHeartDiseaseRequest>(
    key: TKey,
    value: CurrentHeartDiseaseRequest[TKey],
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
      const prediction = await predictCurrentHeartDisease(form);
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

  function clearOptionalFields() {
    setForm((currentForm) => ({
      ...currentForm,
      chol: null,
      restecg: null,
      oldpeak: null,
      fbs: null,
      slope: null,
      ca: null,
      thal: null,
    }));
    setResult(null);
    setErrorMessage(null);
  }

  const isProvided = (value: unknown) => value !== null && value !== undefined;

  const reducedClinicalValues = [form.chol, form.restecg, form.oldpeak];
  const fullClinicalValues = [form.fbs, form.slope, form.ca, form.thal];

  const hasAnyReducedFields = reducedClinicalValues.some(isProvided);
  const hasAllReducedFields = reducedClinicalValues.every(isProvided);

  const hasAnyFullFields = fullClinicalValues.some(isProvided);
  const hasAllFullFields = fullClinicalValues.every(isProvided);

  const optionalFieldWarning =
    hasAnyReducedFields && !hasAllReducedFields
      ? "Some reduced clinical fields are partially filled. The backend will still run, but Model 2 requires cholesterol, resting ECG, and ST depression."
      : hasAnyFullFields && !hasAllReducedFields
        ? "Full clinical fields were provided, but the reduced clinical section is missing or incomplete. The backend will keep using Model 3 until the reduced clinical section is complete."
        : hasAnyFullFields && !hasAllFullFields
          ? "Some full clinical fields are partially filled. The backend will still run, but Model 1 requires all full clinical fields plus the reduced clinical fields."
          : null;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            UCI tiered screening model
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Current Heart Disease Screening
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Enter screening and clinical values to estimate a model-derived
            likelihood score for current heart disease. The backend will
            automatically select the richest model supported by the fields you
            provide.
          </p>
        </div>

        <MedicalDisclaimer variant="screening" />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Required minimal screening information"
          description="These six fields are required. If only these are provided, the backend uses the minimal screening model."
        >
          <NumberInput
            label="Age"
            value={form.age}
            min={18}
            max={100}
            step={1}
            required
            helperText="Allowed API range: 18 to 100 years."
            onChange={(value) => {
              if (value !== "") updateField("age", value);
            }}
          />

          <RadioGroup
            label="Biological sex"
            value={form.sex}
            options={sexOptions}
            required
            onChange={(value) => updateField("sex", value)}
          />

          <SelectInput
            label="Chest pain type"
            value={form.cp}
            options={chestPainOptions}
            required
            onChange={(value) => updateField("cp", value)}
          />

          <RadioGroup
            label="Exercise-induced angina"
            value={form.exang}
            options={yesNoOptions}
            required
            onChange={(value) => updateField("exang", value)}
          />

          <NumberInput
            label="Systolic blood pressure"
            value={form.trestbps}
            min={70}
            max={250}
            step={1}
            required
            helperText="trestbps. Allowed API range: 70 to 250."
            onChange={(value) => {
              if (value !== "") updateField("trestbps", value);
            }}
          />

          <NumberInput
            label="Maximum heart rate achieved"
            value={form.thalach}
            min={60}
            max={230}
            step={1}
            required
            helperText="thalach. Allowed API range: 60 to 230."
            onChange={(value) => {
              if (value !== "") updateField("thalach", value);
            }}
          />
        </FormSection>

        <FormSection
          title="Optional reduced clinical information"
          description="Providing all three fields in this section allows the backend to use the reduced clinical model."
        >
          <NumberInput
            label="Serum cholesterol"
            value={form.chol ?? ""}
            min={80}
            max={700}
            step={1}
            helperText="Optional. Leave blank if unavailable."
            onChange={(value) => {
              updateField("chol", value === "" ? null : value);
            }}
          />

          <SelectInput
            label="Resting ECG"
            value={form.restecg ?? null}
            options={restingEcgOptions}
            helperText="Optional."
            onChange={(value) => updateField("restecg", value)}
          />

          <NumberInput
            label="ST depression"
            value={form.oldpeak ?? ""}
            min={0}
            max={10}
            step={0.1}
            helperText="oldpeak. Optional. Leave blank if unavailable."
            onChange={(value) => {
              updateField("oldpeak", value === "" ? null : value);
            }}
          />
        </FormSection>

        <FormSection
          title="Optional full clinical information"
          description="Providing all fields in this section, plus the reduced clinical fields, allows the backend to use the full clinical model."
        >
          <RadioGroup
            label="Fasting blood sugar above 120 mg/dL"
            value={form.fbs ?? null}
            options={optionalYesNoOptions}
            helperText="Optional."
            onChange={(value) => updateField("fbs", value)}
          />

          <SelectInput
            label="Slope of peak exercise ST segment (exercise ECG)"
            value={form.slope ?? null}
            options={slopeOptions}
            helperText="Optional."
            onChange={(value) => updateField("slope", value)}
          />

          <SelectInput
            label="Number of major heart vessels with abnormality, in coronagraphy/scopy"
            value={form.ca ?? null}
            options={majorVesselsOptions}
            helperText="Optional."
            onChange={(value) => updateField("ca", value)}
          />

          <SelectInput
            label="Thalassemia"
            value={form.thal ?? null}
            options={thalassemiaOptions}
            helperText="Optional."
            onChange={(value) => updateField("thal", value)}
          />
        </FormSection>

        {optionalFieldWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {optionalFieldWarning}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Calculating..." : "Calculate screening score"}
          </Button>

          <Button type="button" variant="secondary" onClick={resetForm}>
            Reset example values
          </Button>

          <Button type="button" variant="ghost" onClick={clearOptionalFields}>
            Clear optional fields
          </Button>
        </div>

        <ErrorMessage message={errorMessage} />
      </form>

      {result ? (
        <Card className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Screening result
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Model used: {result.model_name}
              </p>
            </div>

            <ResultBadge result={result.screening_result} />
          </div>

          <ScoreBar
            score={result.current_hd_score}
            threshold={result.threshold}
            label="Current heart disease screening score"
          />

          <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-slate-500">Score</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatPercent(result.current_hd_score)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Decision threshold</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatPercent(result.threshold)}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Selected tier</p>
              <p className="mt-1 font-semibold text-slate-900">
                Model {result.model_tier}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Binary class</p>
              <p className="mt-1 font-semibold text-slate-900">
                {result.predicted_class}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Model selection reason
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {result.selection_reason}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Features used
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {result.features_used.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {humanizeFieldName(feature)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Missing optional fields
              </h3>

              {result.missing_optional_features.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.missing_optional_features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {humanizeFieldName(feature)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  No optional model fields are missing.
                </p>
              )}
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            This screening model is intended to support triage-style workflows.
            It should not be interpreted as a standalone diagnosis.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

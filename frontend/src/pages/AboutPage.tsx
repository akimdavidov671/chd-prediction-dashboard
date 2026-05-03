import { Card } from "../components/common/Card";
import { MedicalDisclaimer } from "../components/medical/MedicalDisclaimer";

export function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Project overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            About This Project
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            This application demonstrates an end-to-end machine learning system:
            model training, artifact serialization, FastAPI inference endpoints,
            and a React TypeScript frontend.
          </p>
        </div>

        <MedicalDisclaimer variant="general" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            Framingham 10-year CHD risk model
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            The Framingham workflow estimates a model-derived 10-year coronary
            heart disease risk score from long-term risk factors such as age,
            smoking, blood pressure, cholesterol, diabetes, BMI, heart rate,
            and glucose.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This tool is best understood as a preventive risk-oriented model. It
            should not be presented as a definitive clinical diagnosis.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            UCI current heart disease screening model
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            The UCI workflow estimates a current heart disease screening score.
            It uses a tiered design: a minimal screening model, a reduced
            clinical model, and a full clinical model.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            The backend automatically selects the richest eligible model based
            on which fields are provided.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">
          Frontend and backend architecture
        </h2>

        <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-4">
          <div>
            <p className="font-semibold text-slate-900">React</p>
            <p className="mt-1">
              Renders forms, pages, navigation, and result cards.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">TypeScript</p>
            <p className="mt-1">
              Defines request and response shapes so frontend code is safer.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">FastAPI</p>
            <p className="mt-1">
              Receives JSON requests, validates inputs, and exposes prediction
              endpoints.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Model artifacts</p>
            <p className="mt-1">
              Serialized pipelines are loaded by the backend and used for
              inference.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">
          Interpretation limits
        </h2>

        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>
            The scores are model outputs and should not be treated as standalone
            medical diagnoses.
          </li>
          <li>
            A threshold-based result depends on the selected operating point and
            may produce false positives or false negatives.
          </li>
          <li>
            The UCI screening workflow prioritizes screening support, not final
            clinical confirmation.
          </li>
          <li>
            The app is intended as a machine learning engineering project and
            should be evaluated in that context.
          </li>
        </ul>
      </Card>
    </div>
  );
}

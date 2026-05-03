import { Link } from "react-router-dom";
import { Card } from "../components/common/Card";
import { MedicalDisclaimer } from "../components/medical/MedicalDisclaimer";

const tools = [
  {
    title: "10-Year CHD Risk Prediction",
    description:
      "Estimate a Framingham-style 10-year coronary heart disease risk score from demographic, lifestyle, medical history, and clinical measurement inputs.",
    href: "/framingham-risk",
    badge: "Long-term risk",
    details: [
      "Uses a fixed Framingham model",
      "Requires cholesterol, blood pressure, BMI, heart rate, and related risk factors",
      "Best for preventive risk-oriented screening",
    ],
  },
  {
    title: "Current Heart Disease Screening",
    description:
      "Estimate a current heart disease screening score using a tiered UCI model that automatically selects the richest eligible model from the fields provided.",
    href: "/current-screening",
    badge: "Current screening",
    details: [
      "Uses minimal, reduced, or full clinical model tiers",
      "Only six fields are required to start",
      "Best for triage-style screening demonstration",
    ],
  },
];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            End-to-end machine learning application
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-900">
            CHD Prediction Dashboard
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            This app connects a React TypeScript frontend to a FastAPI backend
            serving two coronary heart disease prediction workflows.
          </p>
        </div>

        <MedicalDisclaimer variant="general" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.href} className="flex flex-col">
            <div className="flex-1">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {tool.badge}
              </span>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {tool.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {tool.description}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {tool.details.map((detail) => (
                  <li key={detail} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={tool.href}
              className="mt-6 inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open tool
            </Link>
          </Card>
        ))}
      </section>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">
          How the app works
        </h2>

        <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">1. Enter values</p>
            <p className="mt-1">
              The frontend collects patient-style inputs using React forms.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">2. Send request</p>
            <p className="mt-1">
              The browser sends JSON to your FastAPI backend running locally.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">3. Display result</p>
            <p className="mt-1">
              The backend runs the model pipeline and returns a score,
              threshold, and screening classification.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

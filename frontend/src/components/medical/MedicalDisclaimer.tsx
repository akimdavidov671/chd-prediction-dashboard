type MedicalDisclaimerProps = {
  variant?: "risk" | "screening" | "general";
};

const messages: Record<Required<MedicalDisclaimerProps>["variant"], string> = {
  general:
    "This application is an educational machine learning project. It is not intended for standalone medical diagnosis or treatment decisions.",
  risk:
    "This model produces a 10-year CHD risk-oriented score. It should be interpreted as decision-support information, not as a definitive clinical diagnosis.",
  screening:
    "This model produces a current heart disease screening score. A positive screening result does not confirm disease, and a negative result does not rule it out.",
};

export function MedicalDisclaimer({
  variant = "general",
}: MedicalDisclaimerProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <span className="font-semibold">Important: </span>
      {messages[variant]}
    </div>
  );
}

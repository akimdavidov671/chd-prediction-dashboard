type ResultBadgeProps = {
  result: "below_threshold" | "elevated_risk" | "elevated_likelihood";
};

const labels: Record<ResultBadgeProps["result"], string> = {
  below_threshold: "Below threshold",
  elevated_risk: "Elevated risk",
  elevated_likelihood: "Elevated likelihood",
};

const classes: Record<ResultBadgeProps["result"], string> = {
  below_threshold: "border-emerald-200 bg-emerald-50 text-emerald-800",
  elevated_risk: "border-orange-200 bg-orange-50 text-orange-800",
  elevated_likelihood: "border-orange-200 bg-orange-50 text-orange-800",
};

export function ResultBadge({ result }: ResultBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
        classes[result],
      ].join(" ")}
    >
      {labels[result]}
    </span>
  );
}

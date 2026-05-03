import { formatPercent } from "../../utils/format";

type ScoreBarProps = {
  score: number;
  threshold?: number;
  label?: string;
};

export function ScoreBar({ score, threshold, label = "Model score" }: ScoreBarProps) {
  const safeScore = Math.max(0, Math.min(1, score));
  const scorePercent = safeScore * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">
          {formatPercent(safeScore)}
        </span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${scorePercent}%` }}
        />

        {threshold !== undefined ? (
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-500"
            style={{ left: `${Math.max(0, Math.min(1, threshold)) * 100}%` }}
            title={`Threshold: ${formatPercent(threshold)}`}
          />
        ) : null}
      </div>

      {threshold !== undefined ? (
        <p className="mt-2 text-xs text-slate-500">
          Decision threshold: {formatPercent(threshold)}
        </p>
      ) : null}
    </div>
  );
}

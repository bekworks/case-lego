import type { LucideIcon } from "lucide-react";

/** One key number. Same surface language as Panel: one border, one radius, no shadow. */
export const Kpi = ({
  label,
  value,
  icon: Icon,
  hint,
  emphasis = false,
  progress,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  emphasis?: boolean;
  /** 0 to 1, drawn as a thin bar under the value. */
  progress?: number;
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded border bg-surface px-4 py-3 ${
        emphasis ? "border-ink" : "border-line"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-muted">{label}</span>
        <span
          className={`text-3xl font-black tabular-nums ${emphasis ? "text-success" : "text-ink"}`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {progress !== undefined && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line-soft"
          >
            <div
              className={`h-full rounded-full ${progress >= 1 ? "bg-success" : "bg-brick"}`}
              style={{
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              }}
            />
          </div>
        )}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <Icon
        aria-hidden
        className={`mt-1 size-5 shrink-0 ${emphasis ? "text-success" : "text-muted"}`}
      />
    </div>
  );
};

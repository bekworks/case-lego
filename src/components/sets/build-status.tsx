import type { BuildStatusKind } from "@/domain/model";

const styles: Record<BuildStatusKind, { label: string; className: string }> = {
  buildable: { label: "Can build", className: "bg-success/10 text-success" },
  unbuildable: { label: "Can't build", className: "bg-line-soft text-muted" },
};
export const BuildStatus = ({
  status,
  missing,
}: {
  status: BuildStatusKind;
  missing: number;
}) => {
  const { label, className } = styles[status];
  return (
    <span
      title={
        missing === 0
          ? "You own every piece"
          : `Missing ${missing.toLocaleString()} pieces`
      }
      className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
};

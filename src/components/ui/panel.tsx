import type { ReactNode } from "react";

/** A bordered section of the page with a title row. Flat on purpose: no shadow, one radius. */
export const Panel = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <section className="rounded border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {action}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
};

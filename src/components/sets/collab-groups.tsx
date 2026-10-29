import type { Collaborator } from "@/domain/model";

export const CollabGroups = ({
  groups,
  missing,
}: {
  groups: ReadonlyArray<ReadonlyArray<Collaborator>>;
  missing: number;
}) => {
  if (groups.length === 0) {
    return (
      <p className="py-4 text-sm text-muted">
        No group of up to three other users has the {missing.toLocaleString()}{" "}
        pieces you are missing.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line-soft">
      {groups.map((group) => (
        <li
          key={group.map((m) => m.id).join("+")}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2.5 text-sm"
        >
          <span className="w-20 shrink-0 text-muted">
            {group.length === 1 ? "Alone" : `${group.length} people`}
          </span>
          {group.length === 1 ? (
            <span className="inline-flex items-baseline gap-1">
              <span className="font-bold text-ink">{group[0]!.username}</span>
              <span className="text-muted">
                covers all {missing.toLocaleString()}
              </span>
            </span>
          ) : (
            <>
              {group.map((m, i) => (
                <span key={m.id} className="inline-flex items-baseline gap-1">
                  {i > 0 && <span className="text-muted">+</span>}
                  <span className="font-bold text-ink">{m.username}</span>
                  <span className="text-muted tabular-nums">
                    {m.pieces.toLocaleString()}
                  </span>
                </span>
              ))}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

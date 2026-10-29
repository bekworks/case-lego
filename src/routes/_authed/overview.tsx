import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel } from "@/components/ui/panel";
import { Kpi } from "@/components/ui/kpi";
import { collectionQuery, setMatchesQuery } from "@/queries";
import { Blocks, Hammer, Shapes } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/overview")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query(collectionQuery(context.user.id)),
      context.queryClient.query(setMatchesQuery(context.user.id)),
    ]);
  },
  component: Overview,
});

function Overview() {
  const { user } = Route.useRouteContext();
  const { data: collection } = useSuspenseQuery(collectionQuery(user.id));
  const { data: matches } = useSuspenseQuery(setMatchesQuery(user.id));

  const buildableSets = matches.filter((m) => m.status === "buildable");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Get an easy overview of your collection and what you can build.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Pieces owned"
          value={collection.totalPieces}
          icon={Blocks}
        />
        <Kpi
          label="Distinct pieces"
          value={collection.distinctPieces}
          icon={Shapes}
        />
        <Kpi
          label="Sets you can build"
          value={buildableSets.length}
          icon={Hammer}
          emphasis
          hint="with the pieces you own"
        />
      </div>

      <Panel
        title="Ready to build"
        action={
          <Link
            to="/sets"
            className="text-sm font-bold text-primary hover:underline"
          >
            All sets
          </Link>
        }
      >
        {buildableSets.length === 0 ? (
          <p className="py-4 text-sm text-muted">
            No set is fully covered by your collection yet.
          </p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {buildableSets.map((s) => (
              <li key={s.id} className="flex items-center gap-4 py-2.5 text-sm">
                <Link
                  to="/sets/$setId"
                  params={{ setId: s.id }}
                  className="w-14 shrink-0 font-bold text-primary tabular-nums hover:underline"
                >
                  {s.setNumber}
                </Link>
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="shrink-0 text-muted tabular-nums">
                  {s.totalPieces} pieces
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

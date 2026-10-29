import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Blocks, Hammer, Shapes, Users } from "lucide-react";
import { BuildStatus } from "@/components/sets/build-status";
import { Kpi } from "@/components/ui/kpi";
import { Panel } from "@/components/ui/panel";
import { SetPiecesTable } from "@/components/sets/set-pieces-table";
import { coloursQuery, setDetailQuery } from "@/queries";

export const Route = createFileRoute("/_authed/sets/$setId/")({
  loader: async ({ context, params }) => {
    const [detail] = await Promise.all([
      context.queryClient.query(setDetailQuery(context.user.id, params.setId)),
      context.queryClient.query(coloursQuery),
    ]);

    if (!detail) {
      throw notFound();
    }
  },
  component: SetDetailPage,
});

function SetDetailPage() {
  const { user } = Route.useRouteContext();
  const { setId } = Route.useParams();
  const { data: detail } = useSuspenseQuery(setDetailQuery(user.id, setId));
  const { data: colours } = useSuspenseQuery(coloursQuery);

  if (!detail) {
    throw notFound();
  }

  const buildable = detail.status === "buildable";
  const missing = detail.pieces.filter((p) => p.missing > 0);
  const complete = detail.pieces.filter((p) => p.missing === 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/sets"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft aria-hidden className="size-4" />
            All sets
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-ink">
              <span className="text-muted tabular-nums">
                {detail.setNumber}
              </span>{" "}
              {detail.name}
            </h1>
            <BuildStatus
              status={detail.status}
              missing={detail.missingPieces}
            />
          </div>
          <p className="mt-1 text-sm text-muted">
            {buildable
              ? "You own every piece this set needs."
              : "The set compared with your pieces."}
          </p>
        </div>
        {!buildable && (
          <Link
            to="/sets/$setId/collab"
            params={{ setId }}
            className="inline-flex h-9 items-center gap-2 rounded bg-primary px-4 text-sm font-bold whitespace-nowrap text-on-primary hover:bg-primary-hover"
          >
            <Users aria-hidden className="size-4" />
            Find collaborators
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Pieces you have"
          value={`${detail.ownedPieces.toLocaleString()} / ${detail.totalPieces.toLocaleString()}`}
          icon={Blocks}
          progress={
            detail.totalPieces === 0
              ? 1
              : detail.ownedPieces / detail.totalPieces
          }
        />
        <Kpi
          label="Missing"
          value={detail.missingPieces}
          icon={Hammer}
          hint={
            missing.length === 0
              ? "nothing to find"
              : `across ${missing.length} different ${missing.length === 1 ? "piece" : "pieces"}`
          }
          emphasis={buildable}
        />
        <Kpi
          label="Different pieces"
          value={detail.pieces.length}
          icon={Shapes}
          hint="by shape and colour"
        />
      </div>

      {missing.length > 0 && (
        <Panel title="Missing pieces">
          <SetPiecesTable pieces={missing} colours={colours} missingOnly />
        </Panel>
      )}

      {complete.length > 0 && (
        <Panel title={missing.length > 0 ? "Pieces you have" : "Pieces"}>
          <SetPiecesTable pieces={complete} colours={colours} />
        </Panel>
      )}
    </div>
  );
}

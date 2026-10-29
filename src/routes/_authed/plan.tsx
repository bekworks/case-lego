import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Blocks, Shapes, Users } from "lucide-react";
import { CollectionTable } from "@/components/collection/collection-table";
import { Kpi } from "@/components/ui/kpi";
import { Panel } from "@/components/ui/panel";
import { BUILD_SHARES, type BuildShare } from "@/domain/model";
import { coloursQuery, largestCommonPieceListQuery } from "@/queries";

export const Route = createFileRoute("/_authed/plan")({
  validateSearch: (raw: Record<string, unknown>): { share: BuildShare } => ({
    share: BUILD_SHARES.find((s) => s === raw.share) ?? 50,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.query(
        largestCommonPieceListQuery(context.user.id, deps),
      ),
      context.queryClient.query(coloursQuery),
    ]);
  },
  component: PlanPage,
});

function PlanPage() {
  const { user } = Route.useRouteContext();
  const { share } = Route.useSearch();
  const { data: build } = useSuspenseQuery(
    largestCommonPieceListQuery(user.id, { share }),
  );

  const { data: colours } = useSuspenseQuery(coloursQuery);

  const distinct = new Set(build.pieces.map((p) => p.pieceId)).size;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-black text-ink">Plan a build</h1>
        <p className="mt-1 text-sm text-muted">
          Designing something new? These are the pieces from your own collection
          that enough other users also own, so a build made from them is one
          they could build too.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Pieces you can use"
          value={build.totalPieces}
          icon={Blocks}
          hint="from your own collection"
        />
        <Kpi
          label="Different pieces"
          value={distinct}
          icon={Shapes}
          hint="by shape"
        />
        <Kpi
          label="How many could build it?"
          value={build.builders.length}
          icon={Users}
          hint="users"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span id="share-label" className="text-sm font-bold text-ink">
          Share of other users who must own every piece in the build
        </span>
        <div
          role="group"
          aria-labelledby="share-label"
          className="inline-flex rounded border border-line bg-surface"
        >
          {BUILD_SHARES.map((s) => (
            <Link
              key={s}
              to="/plan"
              search={{ share: s }}
              aria-pressed={share === s}
              className="flex h-9 items-center px-3 text-sm font-bold text-muted first:rounded-l last:rounded-r hover:text-ink aria-pressed:bg-primary aria-pressed:text-on-primary"
            >
              {s} %
            </Link>
          ))}
        </div>
      </div>

      <Panel title="Pieces to use">
        {build.pieces.length === 0 ? (
          <p className="py-4 text-sm text-muted">
            None of your pieces are owned by that many other users at once.
          </p>
        ) : (
          <CollectionTable
            pieces={build.pieces}
            colours={colours}
            quantityLabel="Most you can use"
          />
        )}
      </Panel>
    </div>
  );
}

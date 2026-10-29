import { createFileRoute } from "@tanstack/react-router";
import { collectionQuery, coloursQuery } from "@/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CollectionTable } from "@/components/collection/collection-table";

export const Route = createFileRoute("/_authed/pieces")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query(collectionQuery(context.user.id)),
      context.queryClient.query(coloursQuery),
    ]);
  },
  component: Pieces,
});

function Pieces() {
  const { user } = Route.useRouteContext();
  const { data: collection } = useSuspenseQuery(collectionQuery(user.id));
  const { data: colours } = useSuspenseQuery(coloursQuery);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-ink">My pieces</h1>
        <p className="mt-1 text-sm text-muted">
          <span>
            <span className={"font-semibold"}>
              {collection.totalPieces.toLocaleString()}
            </span>{" "}
            pieces across{" "}
            <span className={"font-semibold"}>
              {collection.distinctPieces.toLocaleString()}
            </span>{" "}
            shapes, expand a row to see colours owned.
          </span>
        </p>
      </div>
      <CollectionTable pieces={collection.pieces} colours={colours} />
    </div>
  );
}

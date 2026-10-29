import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CollabGroups } from "@/components/sets/collab-groups";
import { Panel } from "@/components/ui/panel";
import { collabGroupsQuery, setDetailQuery } from "@/queries";

export const Route = createFileRoute("/_authed/sets/$setId/collab")({
  loader: async ({ context, params }) => {
    const [detail] = await Promise.all([
      context.queryClient.query(setDetailQuery(context.user.id, params.setId)),
      context.queryClient.query(
        collabGroupsQuery(context.user.id, params.setId),
      ),
    ]);

    if (!detail) {
      throw notFound();
    }
  },
  component: CollabPage,
});

function CollabPage() {
  const { user } = Route.useRouteContext();
  const { setId } = Route.useParams();
  const { data: detail } = useSuspenseQuery(setDetailQuery(user.id, setId));
  const { data: groups } = useSuspenseQuery(collabGroupsQuery(user.id, setId));

  if (!detail) {
    throw notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/sets/$setId"
          params={{ setId }}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {detail.setNumber} {detail.name}
        </Link>
        <h1 className="mt-2 text-2xl font-black text-ink">Build it together</h1>
        <p className="mt-1 text-sm text-muted">
          You are missing {detail.missingPieces.toLocaleString()} pieces for
          this set. These are the smallest groups of other users whose pieces
          would complete it, and how many each would bring.
        </p>
      </div>

      <Panel
        title={
          groups.length === 0
            ? "No one can fill the gap"
            : `${groups.length} ${groups.length === 1 ? "way" : "ways"} to build it`
        }
      >
        <CollabGroups groups={groups} missing={detail.missingPieces} />
      </Panel>
    </div>
  );
}

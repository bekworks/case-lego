import { createFileRoute } from "@tanstack/react-router";
import { setMatchesQuery } from "@/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SetTable } from "@/components/sets/set-table";

export const Route = createFileRoute("/_authed/sets/")({
  loader: ({ context }) =>
    context.queryClient.query(setMatchesQuery(context.user.id)),
  component: Sets,
});

function Sets() {
  const { user } = Route.useRouteContext();
  const { data: matches } = useSuspenseQuery(setMatchesQuery(user.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-ink">Sets</h1>
        <p className="mt-1 text-sm text-muted">
          Every set in the catalogue, checked against your pieces.
        </p>
      </div>
      <SetTable matches={matches} />
    </div>
  );
}

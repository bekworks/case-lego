import type { FileRouteTypes } from "@/routeTree.gen";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { logout } from "@/server/auth";

type NavItem = { to: FileRouteTypes["to"]; label: string };

// Ensure that you regenerate routes before adding newly created routes to the list
const primaryNav = [
  { to: "/overview", label: "Overview" },
  { to: "/sets", label: "Sets" },
  { to: "/pieces", label: "My pieces" },
  { to: "/plan", label: "Plan a build" },
] as const satisfies ReadonlyArray<NavItem>;

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }

    return { user: context.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, queryClient } = Route.useRouteContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    queryClient.removeQueries({ queryKey: ["user"] });
    await router.invalidate();
    await router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-8 px-4">
          <Link
            to="/overview"
            className="flex items-center gap-2 text-lg font-black tracking-tight text-ink"
          >
            <span aria-hidden className="size-3 rounded-sm bg-brick" />
            Brick Builder
          </Link>

          <nav aria-label="Primary" className="flex h-full items-stretch gap-1">
            {primaryNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center border-b-[3px] border-transparent px-3 text-sm font-bold text-muted hover:text-ink data-[status=active]:border-brick data-[status=active]:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {user.username}
            </span>
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary"
            >
              {user.username.slice(0, 2).toUpperCase()}
            </span>
            <Button variant="ghost" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

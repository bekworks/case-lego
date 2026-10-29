import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import { login } from "@/server/auth";
import { getUsers } from "@/server/users";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const DEFAULT_USER_ID = "6d6bc9f2-a762-4a30-8d9a-52cf8d8373fc";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/overview" });
    }
  },
  loader: () => getUsers(),
  component: Login,
});

function Login() {
  const users = Route.useLoaderData();
  const router = useRouter();
  const [userId, setUserId] = useState(DEFAULT_USER_ID);

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ data: userId });
    await router.invalidate();
    await router.navigate({ to: "/overview" });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div className="flex items-center gap-2 text-lg font-black tracking-tight text-ink">
        <span aria-hidden className="size-3 rounded-sm bg-brick" />
        Brick Builder
      </div>
      <Panel title="Sign in">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-bold">User</span>
            <select
              className="h-9 rounded border border-line bg-surface px-3"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit">Sign in</Button>
        </form>
      </Panel>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { readUsers } from "./api-reads.server";
import { currentUserId, endSession, startSession } from "./session.server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const id = currentUserId();

    if (!id) {
      return null;
    }

    const users = await readUsers();

    return users.find((u) => u.id === id) ?? null;
  },
);

export const login = createServerFn({ method: "POST" })
  .validator((id: unknown) => {
    if (typeof id !== "string" || id === "") {
      throw new Error("A user id is required");
    }

    return id;
  })
  .handler(async ({ data: id }) => {
    const users = await readUsers();

    if (!users.some((u) => u.id === id)) {
      throw new Error("Unknown user");
    }

    startSession(id);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
});

import { createServerFn } from "@tanstack/react-start";
import { readCollection } from "./api-reads.server";
import { currentUserId } from "./session.server";

export const getMyCollection = createServerFn({ method: "GET" }).handler(
  async () => {
    const id = currentUserId();

    if (!id) {
      throw new Error("Not signed in");
    }

    return readCollection(id);
  },
);

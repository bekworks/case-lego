import { createServerFn } from "@tanstack/react-start";
import { readColours } from "./api-reads.server";

export const getColours = createServerFn({ method: "GET" }).handler(
  async () => {
    return readColours();
  },
);

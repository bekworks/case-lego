import { createServerFn } from "@tanstack/react-start";
import { readUsers } from "./api-reads.server";

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return readUsers();
});

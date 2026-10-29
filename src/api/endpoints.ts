import type { SetId, UserId } from "./types";

export const endpoints = {
  users: "/api/users",
  userByUsername: (username: string) =>
    `/api/user/by-username/${encodeURIComponent(username)}`,
  userById: (id: UserId) => `/api/user/by-id/${encodeURIComponent(id)}`,
  sets: "/api/sets",
  setByName: (name: string) => `/api/set/by-name/${encodeURIComponent(name)}`,
  setById: (id: SetId) => `/api/set/by-id/${encodeURIComponent(id)}`,
  colours: "/api/colours",
} as const;

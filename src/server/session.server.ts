import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

import type { UserId } from "@/api/types";

// TODO - never do this outside a poc, can be forged easily and is a good way to ensure accounts will be hacked
const COOKIE = "userId";

export const currentUserId = (): UserId | undefined => {
  return getCookie(COOKIE);
};

export const startSession = (id: UserId) => {
  setCookie(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
};

export const endSession = () => {
  deleteCookie(COOKIE, { path: "/" });
};

export const requireUserId = (): UserId => {
  const id = currentUserId();

  if (!id) {
    throw new Error("Not signed in");
  }

  return id;
};

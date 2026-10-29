import { createServerFn } from "@tanstack/react-start";
import { collabGroups } from "@/domain/collaboration";
import { key, shortfallOf } from "@/domain/matching";
import type { CollabGroups, SetDetail, SetMatch } from "@/domain/model";
import { readSetPieces, readSets } from "./api-reads.server";
import { requireUserId } from "./session.server";
import {
  scoreSet,
  usersAndInventoriesOtherThan,
  inventoryOf,
} from "./sets.server";

const requireSetId = (setId: unknown): string => {
  if (typeof setId !== "string" || setId === "") {
    throw new Error("A set id is required");
  }

  return setId;
};

/** Returns every set scored against users inventory */
export const getSetMatches = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<SetMatch>> => {
    const id = requireUserId();
    const [myInventory, sets] = await Promise.all([
      inventoryOf(id),
      readSets(),
    ]);

    const scored = await Promise.all(
      sets.map((set) => scoreSet(set, myInventory)),
    );

    return scored.map((s) => s.match);
  },
);

/** Returns the details of a single set scored against users inventory or null if set not found */
export const getSetDetail = createServerFn({ method: "GET" })
  .validator(requireSetId)
  .handler(async ({ data: setId }): Promise<SetDetail | null> => {
    const id = requireUserId();
    const [myInventory, sets] = await Promise.all([
      inventoryOf(id),
      readSets(),
    ]);

    const set = sets.find((s) => s.id === setId);

    if (!set) {
      return null;
    }

    const { match, pieces, shortfall } = await scoreSet(set, myInventory);

    const detailPieces = pieces.map((piece) => {
      const missing = shortfall.get(key(piece)) ?? 0;

      // owned is what the set needs minus what the shortfall says is still missing
      return { ...piece, owned: piece.quantity - missing, missing };
    });

    return { ...match, pieces: detailPieces };
  });

/** Returns groups of other users who together cover the set's missing pieces, with each user's share */
export const getCollabGroups = createServerFn({ method: "GET" })
  .validator(requireSetId)
  .handler(async ({ data: setId }): Promise<CollabGroups> => {
    const id = requireUserId();
    const [myInventory, pieces, others] = await Promise.all([
      inventoryOf(id),
      readSetPieces(setId),
      usersAndInventoriesOtherThan(id),
    ]);

    return collabGroups(shortfallOf(pieces, myInventory), others);
  });

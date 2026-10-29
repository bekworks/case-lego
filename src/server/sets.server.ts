import type { UserId } from "@/api/types";
import type { Candidate } from "@/domain/collaboration";
import {
  buildStatus,
  shortfallOf,
  toInventory,
  totalMissing,
  type Inventory,
  type Shortfall,
} from "@/domain/matching";
import type { SetMatch, SetPiece, SetSummary } from "@/domain/model";
import { readCollection, readSetPieces, readUsers } from "./api-reads.server";

export const inventoryOf = async (userId: UserId): Promise<Inventory> => {
  const collection = await readCollection(userId);

  return toInventory(collection.pieces);
};

export const usersAndInventoriesOtherThan = async (
  excludedUserId: UserId,
): Promise<Array<Candidate>> => {
  const users = await readUsers();

  return Promise.all(
    users
      .filter((u) => u.id !== excludedUserId)
      .map(async (u): Promise<Candidate> => ({
        ...u,
        inventory: await inventoryOf(u.id),
      })),
  );
};

type ScoredSet = {
  match: SetMatch;
  pieces: Array<SetPiece>;
  shortfall: Shortfall;
};

// score set requirements against an inventory of pieces
export const scoreSet = async (
  set: SetSummary,
  inventory: Inventory,
): Promise<ScoredSet> => {
  const pieces = await readSetPieces(set.id);
  const shortfall = shortfallOf(pieces, inventory);
  const missing = totalMissing(shortfall);

  return {
    match: {
      ...set,
      missingPieces: missing,
      ownedPieces: set.totalPieces - missing,
      status: buildStatus(shortfall),
    },
    pieces,
    shortfall,
  };
};

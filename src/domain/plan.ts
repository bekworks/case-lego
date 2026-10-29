import type { Candidate } from "./collaboration";
import { parseKey, type Inventory } from "./matching.ts";
import type { CollectionPiece, UserSummary } from "./model";

export type CommonPieceList = {
  pieces: Array<CollectionPiece>;
  totalPieces: number;
  builders: Array<UserSummary>;
};

type GroupPieceList = {
  pieces: Map<string, number>;
  builders: ReadonlyArray<Candidate>;
};

// per key, the smallest quantity any member of the group owns
const piecesInCommon = (
  inventories: ReadonlyArray<Inventory>,
): Map<string, number> => {
  const inCommon = new Map<string, number>();
  const [first, ...rest] = inventories;

  if (!first) {
    return inCommon;
  }

  for (const [k, quantity] of first) {
    let least = quantity;

    for (const inventory of rest) {
      least = Math.min(least, inventory.get(k) ?? 0);

      if (least === 0) {
        break;
      }
    }

    if (least > 0) {
      inCommon.set(k, least);
    }
  }

  return inCommon;
};

const sum = (pieces: ReadonlyMap<string, number>): number => {
  let total = 0;

  for (const quantity of pieces.values()) {
    total += quantity;
  }

  return total;
};

// a piece list is keyed by piece and colour, the page wants rows with both spelled out
const toCollectionPieces = (
  pieceList: ReadonlyMap<string, number>,
): Array<CollectionPiece> => {
  const rows: Array<CollectionPiece> = [];

  for (const [pieceKey, quantity] of pieceList) {
    const { pieceId, colourCode } = parseKey(pieceKey);
    rows.push({ pieceId, colourCode, quantity });
  }

  return rows;
};

const toUserSummary = ({
  inventory: _inventory,
  ...user
}: Candidate): UserSummary => user;

// every group of groupSize candidates, each group once
const candidateGroups = (
  candidates: ReadonlyArray<Candidate>,
  groupSize: number,
): Array<Array<Candidate>> => {
  if (groupSize === 0) {
    return [[]];
  }

  const groups: Array<Array<Candidate>> = [];

  candidates.forEach((candidate, index) => {
    for (const rest of candidateGroups(
      candidates.slice(index + 1),
      groupSize - 1,
    )) {
      groups.push([candidate, ...rest]);
    }
  });

  return groups;
};

// tries every group of the required size and keeps the one with the most pieces in common
const bestGroupPieceList = (
  candidates: ReadonlyArray<Candidate>,
  requiredCandidateCount: number,
  plannerInventory: Inventory,
): GroupPieceList => {
  let best: GroupPieceList & { total: number } = {
    pieces: new Map(),
    builders: [],
    total: -1,
  };

  for (const group of candidateGroups(candidates, requiredCandidateCount)) {
    const pieces = piecesInCommon([
      plannerInventory,
      ...group.map((member) => member.inventory),
    ]);

    const total = sum(pieces);

    if (total > best.total) {
      best = { pieces, builders: group, total };
    }
  }

  return { pieces: best.pieces, builders: best.builders };
};

const toCommonPieceList = ({
  pieces,
  builders,
}: GroupPieceList): CommonPieceList => ({
  pieces: toCollectionPieces(pieces),
  totalPieces: sum(pieces),
  builders: builders.map(toUserSummary),
});

// the most pieces the planner and a share of the candidates all own
export const largestCommonPieceList = (
  candidates: ReadonlyArray<Candidate>,
  share: number,
  plannerInventory: Inventory,
): CommonPieceList => {
  const requiredCandidateCount = Math.ceil(candidates.length * share);

  if (requiredCandidateCount === 0 || candidates.length === 0) {
    return { pieces: [], totalPieces: 0, builders: [] };
  }

  return toCommonPieceList(
    bestGroupPieceList(candidates, requiredCandidateCount, plannerInventory),
  );
};

import type {
  BuildStatusKind,
  CollectionPiece,
  ColourCode,
  SetPiece,
} from "./model";
import type { PieceId } from "@/api/types";

export type PieceKey = string;
export type Inventory = ReadonlyMap<PieceKey, number>; // map of owned pieces
export type Shortfall = ReadonlyMap<PieceKey, number>; // map of missing pieces

// combine piece and color into single key
export const key = (piece: {
  pieceId: PieceId;
  colourCode: ColourCode;
}): PieceKey => {
  return `${piece.pieceId}:${piece.colourCode}`;
};

// parse a key into its parts
export const parseKey = (
  k: string,
): {
  pieceId: PieceId;
  colourCode: ColourCode;
} => {
  const at = k.lastIndexOf(":");

  return { pieceId: k.slice(0, at), colourCode: Number(k.slice(at + 1)) };
};

// create a map of owned piece and color combinations
export const toInventory = (
  pieces: ReadonlyArray<CollectionPiece>,
): Inventory => {
  const inventory = new Map<string, number>();

  for (const p of pieces) {
    inventory.set(key(p), (inventory.get(key(p)) ?? 0) + p.quantity);
  }

  return inventory;
};

// calculate users shortfall of a set
export const shortfallOf = (
  set: ReadonlyArray<SetPiece>,
  inventory: Inventory,
): Shortfall => {
  const required = new Map<string, number>();

  for (const p of set) {
    required.set(key(p), (required.get(key(p)) ?? 0) + p.quantity);
  }

  const missing = new Map<string, number>();

  for (const [k, quantity] of required) {
    const shortfall = quantity - (inventory.get(k) ?? 0);
    if (shortfall > 0) {
      missing.set(k, shortfall);
    }
  }

  return missing;
};

// helper: number of missing pieces regardless of type and color
export const totalMissing = (shortfall: Shortfall): number => {
  let total = 0;

  for (const quantity of shortfall.values()) {
    total += quantity;
  }

  return total;
};

export const buildStatus = (shortfall: Shortfall): BuildStatusKind => {
  return shortfall.size === 0 ? "buildable" : "unbuildable";
};

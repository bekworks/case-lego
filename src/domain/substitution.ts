import type { ColourCode, SetPiece } from "@/domain/model.ts";
import { type Inventory, parseKey } from "@/domain/matching.ts";
import type { PieceId } from "@/api/types.ts";

export type ColourSwap = {
  from: ColourCode;
  to: ColourCode;
  pieces: ReadonlyArray<SetPiece>;
};
type Substitution = ReadonlyArray<ColourSwap>;

export const substitutionSets = (
  set: ReadonlyArray<SetPiece>,
  inventory: Inventory,
): Array<Substitution> => {
  // get unique colors and their pieces from the set
  const piecesByColor = new Map<number, Map<PieceId, number>>();

  for (const piece of set) {
    let pieces = piecesByColor.get(piece.colourCode);
    if (!pieces) {
      pieces = new Map<PieceId, number>();
      piecesByColor.set(piece.colourCode, pieces);
    }
    pieces.set(
      piece.pieceId,
      (pieces.get(piece.pieceId) ?? 0) + piece.quantity,
    );
  }

  // find candidates that we have all pieces for in a single color
  const candidates = new Map<ColourCode, Array<ColourCode>>();

  for (const [from, needed] of piecesByColor) {
    const covered = new Map<ColourCode, number>();

    for (const [k, ownedQuantity] of inventory) {
      const { pieceId, colourCode } = parseKey(k);
      const neededQuantity = needed.get(pieceId);

      if (neededQuantity !== undefined && ownedQuantity >= neededQuantity) {
        covered.set(colourCode, (covered.get(colourCode) ?? 0) + 1);
      }
    }

    const targets = [...covered]
      .filter(([, count]) => count === needed.size)
      .map(([colourCode]) => colourCode);

    candidates.set(from, targets);
  }

  console.log(candidates);

  // next step: calculate unique combinations where only one of each color can be represented

  return [];
};

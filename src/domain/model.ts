import type { PieceId, SetId, UserId } from "@/api/types";

export type ColourCode = number;

export type UserSummary = {
  id: UserId;
  username: string;
  location: string;
  brickCount: number;
};

export type Colour = {
  colourCode: ColourCode;
  name: string;
};

export type CollectionPiece = {
  pieceId: PieceId;
  colourCode: ColourCode;
  quantity: number;
};

export type Collection = {
  pieces: ReadonlyArray<CollectionPiece>;
  totalPieces: number;
  distinctPieces: number;
  colourCount: number;
};

export type SetSummary = {
  id: SetId;
  setNumber: string;
  name: string;
  totalPieces: number;
};

export type SetPiece = {
  pieceId: PieceId;
  colourCode: ColourCode;
  quantity: number;
};

export type BuildStatusKind = "buildable" | "unbuildable";

/** Another user who could supply some of the missing pieces, and how many. */
export type Collaborator = UserSummary & { pieces: number };

export type SetMatch = SetSummary & {
  missingPieces: number;
  ownedPieces: number;
  status: BuildStatusKind;
};

/** Smallest groups of users who together cover a set's missing pieces, fewest members first. */
export type CollabGroups = Array<Array<Collaborator>>;

/** One entry of a set's piece list, against the owner's collection. */
export type SetDetailPiece = SetPiece & {
  owned: number;
  missing: number;
};

/** A set match with its full piece list, for the set detail page. */
export type SetDetail = SetMatch & {
  pieces: Array<SetDetailPiece>;
};

/** The share of other users a planned build must be completable by, as the page offers it. */
export const BUILD_SHARES = [25, 50, 75, 100] as const;
export type BuildShare = (typeof BUILD_SHARES)[number];

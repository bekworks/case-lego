/** A UUID */
export type UserId = string;
/** A UUID */
export type SetId = string;
/** A piece's design number */
export type PieceId = string;
/** A colour's numeric code */
export type ApiColourCode = string;

export type ApiColour = {
  name: string;
  code: ApiColourCode;
};

/** One colour of a piece in a user's collection, with how many the user owns */
export type ApiPieceVariant = {
  color: ApiColourCode;
  count: number;
};

/** One piece in a user's collection, in every colour the user owns it in */
export type ApiPiece = {
  pieceId: PieceId;
  variants: ReadonlyArray<ApiPieceVariant>;
};

export type ApiCollection = ReadonlyArray<ApiPiece>;

/** The public view of a user, as the users list and user-by-username endpoints return it */
export type ApiUserSummary = {
  id: UserId;
  username: string;
  location: string;
  brickCount: number;
};

/** The owner's view of a user, as the user-by-id endpoint returns it */
export type ApiUserDetail = ApiUserSummary & {
  collection: ApiCollection;
};

/** A set as the sets list and set-by-name endpoints return it */
export type ApiSetSummary = {
  id: SetId;
  name: string;
  setNumber: string;
  totalPieces: number;
};

export type ApiSetPiecePart = {
  designID: PieceId;
  material: ApiColourCode;
  /** Only "rigid" seen so far. Narrow to a union once every value in the data is known */
  partType: string;
};

/** One entry of a set's piece list. */
export type ApiSetPiece = {
  part: ApiSetPiecePart;
  quantity: number;
};

/** A set with its piece list, as the set-by-id endpoint returns it */
export type ApiSetDetail = ApiSetSummary & {
  pieces: ReadonlyArray<ApiSetPiece>;
};

/* Response envelopes */

export type ApiUsersResponse = { Users: ReadonlyArray<ApiUserSummary> };
export type ApiUserByUsernameResponse = ApiUserSummary;
export type ApiUserByIdResponse = ApiUserDetail;

export type ApiSetsResponse = { Sets: ReadonlyArray<ApiSetSummary> };
export type ApiSetByNameResponse = ApiSetSummary;
export type ApiSetByIdResponse = ApiSetDetail;

export type ApiColoursResponse = { colours: ReadonlyArray<ApiColour> };

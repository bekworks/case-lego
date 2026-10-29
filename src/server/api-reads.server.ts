import { fetchJson } from "@/api/client.server";
import { endpoints } from "@/api/endpoints";
import type {
  ApiCollection,
  ApiColoursResponse,
  ApiSetByIdResponse,
  ApiSetsResponse,
  ApiSetSummary,
  ApiUserByIdResponse,
  ApiUserSummary,
  ApiUsersResponse,
  SetId,
  UserId,
} from "@/api/types";
import type {
  Collection,
  CollectionPiece,
  Colour,
  SetPiece,
  SetSummary,
  UserSummary,
} from "@/domain/model";

const toUserSummary = (user: ApiUserSummary): UserSummary => {
  return {
    id: user.id,
    username: user.username,
    location: user.location,
    brickCount: user.brickCount,
  };
};

const toCollection = (collection: ApiCollection): Collection => {
  const pieces: Array<CollectionPiece> = [];

  for (const piece of collection) {
    for (const variant of piece.variants) {
      pieces.push({
        pieceId: piece.pieceId,
        colourCode: Number(variant.color), // bad API is bad, sending numbers as strings...
        quantity: Number(variant.count),
      });
    }
  }

  const colourCount = new Set(pieces.map((p) => p.colourCode)).size;

  return {
    pieces,
    totalPieces: pieces.reduce((sum, p) => sum + p.quantity, 0),
    distinctPieces: collection.length,
    colourCount,
  };
};

const toSetSummary = (set: ApiSetSummary): SetSummary => {
  return {
    id: set.id,
    setNumber: set.setNumber,
    name: set.name,
    totalPieces: Number(set.totalPieces),
  };
};

const toSetPieces = (set: ApiSetByIdResponse): Array<SetPiece> => {
  return set.pieces.map((p) => ({
    pieceId: p.part.designID,
    colourCode: Number(p.part.material),
    quantity: Number(p.quantity),
  }));
};

export const readUsers = async (): Promise<Array<UserSummary>> => {
  const { Users } = await fetchJson<ApiUsersResponse>(endpoints.users);
  return Users.map(toUserSummary);
};

export const readCollection = async (userId: UserId): Promise<Collection> => {
  const user = await fetchJson<ApiUserByIdResponse>(endpoints.userById(userId));
  return toCollection(user.collection);
};

export const readSets = async (): Promise<Array<SetSummary>> => {
  const { Sets } = await fetchJson<ApiSetsResponse>(endpoints.sets);
  return Sets.map(toSetSummary);
};

export const readSetPieces = async (setId: SetId): Promise<Array<SetPiece>> => {
  const set = await fetchJson<ApiSetByIdResponse>(endpoints.setById(setId));
  return toSetPieces(set);
};

export const readColours = async (): Promise<Array<Colour>> => {
  const { colours } = await fetchJson<ApiColoursResponse>(endpoints.colours);
  return colours.map((c) => ({
    colourCode: Number(c.code),
    name: c.name,
  }));
};

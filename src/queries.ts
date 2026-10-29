import { queryOptions } from "@tanstack/react-query";
import { getMyCollection } from "@/server/collection";
import { getColours } from "@/server/colours";
import { getLargestCommonPieceList, type PlanInput } from "@/server/plan";
import { getCollabGroups, getSetDetail, getSetMatches } from "@/server/sets";
import type { SetId, UserId } from "@/api/types";

export const collectionQuery = (userId: UserId) =>
  queryOptions({
    queryKey: ["user", userId, "collection"],
    queryFn: () => getMyCollection(),
    staleTime: 0,
  });

export const coloursQuery = queryOptions({
  queryKey: ["colours"],
  queryFn: () => getColours(),
  staleTime: Infinity,
});

export const setMatchesQuery = (userId: UserId) =>
  queryOptions({
    queryKey: ["user", userId, "set-matches"],
    queryFn: () => getSetMatches(),
    staleTime: 0,
  });

export const setDetailQuery = (userId: UserId, setId: SetId) =>
  queryOptions({
    queryKey: ["user", userId, "set", setId],
    queryFn: () => getSetDetail({ data: setId }),
    staleTime: 0,
  });

export const collabGroupsQuery = (userId: UserId, setId: SetId) =>
  queryOptions({
    queryKey: ["user", userId, "set", setId, "collab"],
    queryFn: () => getCollabGroups({ data: setId }),
  });

export const largestCommonPieceListQuery = (userId: UserId, input: PlanInput) =>
  queryOptions({
    queryKey: ["user", userId, "plan", input],
    queryFn: () => getLargestCommonPieceList({ data: input }),
  });

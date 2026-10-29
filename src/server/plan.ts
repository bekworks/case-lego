import { createServerFn } from "@tanstack/react-start";
import { largestCommonPieceList, type CommonPieceList } from "@/domain/plan";
import { BUILD_SHARES, type BuildShare } from "@/domain/model";
import { requireUserId } from "./session.server";
import { usersAndInventoriesOtherThan, inventoryOf } from "./sets.server";

export type LargestCommonPieceList = CommonPieceList & { otherUsers: number };
export type PlanInput = { share: BuildShare };

const requirePlanInput = (input: unknown): PlanInput => {
  const raw = (input as Partial<PlanInput> | null)?.share;
  const share = BUILD_SHARES.find((s) => s === raw);
  if (share === undefined) {
    throw new Error(`share must be one of ${BUILD_SHARES.join(", ")}`);
  }
  return { share };
};

export const getLargestCommonPieceList = createServerFn({ method: "GET" })
  .validator(requirePlanInput)
  .handler(async ({ data }): Promise<LargestCommonPieceList> => {
    const id = requireUserId();
    const [others, myInventory] = await Promise.all([
      usersAndInventoriesOtherThan(id),
      inventoryOf(id),
    ]);
    return {
      ...largestCommonPieceList(others, data.share / 100, myInventory),
      otherUsers: others.length,
    };
  });

import type { Inventory, Shortfall } from "./matching";
import type { CollabGroups, Collaborator, UserSummary } from "./model";

export type Candidate = UserSummary & { inventory: Inventory }; // possible candidate user
export type Contributor = Candidate & { pieces: number }; // possible contributor user

const MAX_COLLAB_GROUP_SIZE = 3;

// helper: calculate how many pieces can be contributed to help with the shortfall by another user
export const possibleContributionByCandidate = (
  shortfall: Shortfall,
  candidate: Candidate,
): number => {
  let total = 0;

  for (const [k, needed] of shortfall) {
    total += Math.min(needed, candidate.inventory.get(k) ?? 0); // cap to what's needed
  }

  return total;
};

// helper: check that a group covers entire shortfall
const candidateGroupCoversShortfall = (
  shortfall: Shortfall,
  group: ReadonlyArray<Candidate>,
): boolean => {
  for (const [k, needed] of shortfall) {
    let have = 0;

    for (const member of group) {
      have += member.inventory.get(k) ?? 0;
    }

    if (have < needed) {
      return false;
    }
  }

  return true;
};

export const collabGroups = (
  shortfall: Shortfall,
  candidates: ReadonlyArray<Candidate>,
): CollabGroups => {
  if (shortfall.size === 0) {
    return [];
  }

  const contributors = candidates
    .map((c) => ({
      ...c,
      pieces: possibleContributionByCandidate(shortfall, c),
    }))
    .filter((c) => c.pieces > 0);

  const foundGroups: Array<ReadonlyArray<Contributor>> = [];

  /**
   * Ensure that we don't include already accepted groups into other groups
   * that would have included them wholly
   * @example Group [A, B] satisfies collab condition, [A, B, C] is dropped
   * because it already contains [A, B]
   */
  const isSupersetOfFoundGroup = (group: ReadonlyArray<Contributor>) => {
    const ids = new Set(group.map((m) => m.id));

    return foundGroups.some((g) => g.every((member) => ids.has(member.id)));
  };

  // helper: find covering groups based on size
  const findCoveringGroupsOfSize = (
    size: number,
    start: number,
    group: ReadonlyArray<Contributor>,
  ) => {
    // group is full, keep it if it covers the shortfall and contains no already found group
    if (group.length === size) {
      if (
        !isSupersetOfFoundGroup(group) &&
        candidateGroupCoversShortfall(shortfall, group)
      ) {
        foundGroups.push(group);
      }

      return;
    }

    // walk through remaining contributors
    for (let i = start; i < contributors.length; i++) {
      findCoveringGroupsOfSize(size, i + 1, [...group, contributors[i]!]);
    }
  };

  // smaller groups found first to ensure superset check actually works
  for (let size = 1; size <= MAX_COLLAB_GROUP_SIZE; size++) {
    findCoveringGroupsOfSize(size, 0, []);
  }

  // largest single contributor first, so the person who brings most is named first
  const largest = (group: ReadonlyArray<Contributor>) =>
    Math.max(...group.map((member) => member.pieces));

  return foundGroups
    .sort((a, b) => a.length - b.length || largest(b) - largest(a))
    .map((g) => sharesOfShortfall(shortfall, g));
};

export const sharesOfShortfall = (
  shortfall: Shortfall,
  group: ReadonlyArray<Contributor>,
): Array<Collaborator> => {
  const remaining = new Map(shortfall);
  const contributorsByAmountToContribute = [...group].sort(
    (a, b) => b.pieces - a.pieces,
  );

  return contributorsByAmountToContribute.map(({ inventory, ...member }) => {
    let share = 0;

    for (const [k, needed] of remaining) {
      const take = Math.min(needed, inventory.get(k) ?? 0);
      share += take;
      remaining.set(k, needed - take);
    }

    return { ...member, pieces: share };
  });
};

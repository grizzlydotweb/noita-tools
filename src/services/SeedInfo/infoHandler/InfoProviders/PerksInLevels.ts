import { IRule } from "../IRule";
import { PerkInfoProvider } from "./Perk";
import { includesSome, includesAll } from "../../../helpers";

export class PerksInLevelsProvider extends PerkInfoProvider {
  getPerksForLevelRange(fromLevel: number, toLevel: number): string[] {
    const perks: string[] = [];
    const maxLevel = Math.min(toLevel, 6);

    for (let level = fromLevel; level <= maxLevel; level++) {
      const rows = this.provide(undefined, level + 1, false, 0, undefined);
      const levelPerks = rows[level];
      if (levelPerks) {
        for (const perk of levelPerks) {
          if (perk && typeof perk === "string" && !perks.includes(perk)) {
            perks.push(perk);
          }
        }
      }
    }
    return perks;
  }

  getRerollCountForLevelRange(fromLevel: number, toLevel: number, maxRerollCount: number): number {
    let maxRerolls = 0;
    const maxLevel = Math.min(toLevel, 6);

    for (let level = fromLevel; level <= maxLevel; level++) {
      const rerolls = new Map<number, number[]>();
      rerolls.set(0, new Array(level + 1).fill(maxRerollCount));
      const rows = this.provide(undefined, level + 1, false, 0, rerolls);
      if (rows[level]) {
        maxRerolls = Math.max(maxRerolls, maxRerollCount);
      }
    }
    return maxRerolls;
  }

  test(rule: IRule): boolean {
    const { perks, fromLevel, toLevel, shouldMatchAll, maxRerollCount } = rule.val || {};
    if (!perks || !perks.length) {
      return true;
    }

    try {
      let perkList: string[];

      if (maxRerollCount !== undefined && maxRerollCount > 0) {
        this.getRerollCountForLevelRange(fromLevel, toLevel, maxRerollCount);
        perkList = this.getPerksForLevelRange(fromLevel, toLevel);
      } else {
        perkList = this.getPerksForLevelRange(fromLevel, toLevel);
      }

      const check = shouldMatchAll ? includesAll : includesSome;
      return check(perkList, perks);
    } catch (e) {
      console.error(e);
    }
    return true;
  }
}

export default PerksInLevelsProvider;

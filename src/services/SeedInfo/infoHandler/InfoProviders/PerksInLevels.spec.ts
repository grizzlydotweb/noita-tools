import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadRandom } from "../../../../testHelpers";
import { PerksInLevelsProvider } from "./PerksInLevels";

describe("PerksInLevelsProvider", () => {
  let provider: PerksInLevelsProvider;
  let randoms: any;

  beforeEach(async () => {
    randoms = await loadRandom();
    provider = new PerksInLevelsProvider(randoms);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("#test", () => {
    describe("single level", () => {
      const tests = [
        {
          name: "perk found at level",
          mockResult: [["TELEPORT", "LIGHTNING"]],
          rule: { val: { perks: ["TELEPORT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "perk not found at level",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: ["NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: false,
        },
        {
          name: "any match - one of multiple found",
          mockResult: [["TELEPORT", "LIGHTNING"]],
          rule: { val: { perks: ["TELEPORT", "NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "all match - all found",
          mockResult: [["TELEPORT", "LIGHTNING"]],
          rule: { val: { perks: ["TELEPORT", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "all match - not all found",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: ["TELEPORT", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: false,
        },
        {
          name: "empty perks array returns true",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: [], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provide").mockImplementation((_perkPicks: any, maxLevels: number) => t.mockResult);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });

    describe("multiple levels", () => {
      const tests = [
        {
          name: "level 0 - perk found",
          mockResult: [
            ["TELEPORT", "LIGHTNING"],
            ["FIRE", "ICE"],
          ],
          rule: { val: { perks: ["TELEPORT"], fromLevel: 0, toLevel: 1, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "level 1 - perk found",
          mockResult: [
            ["TELEPORT", "LIGHTNING"],
            ["FIRE", "ICE"],
          ],
          rule: { val: { perks: ["FIRE"], fromLevel: 0, toLevel: 1, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "level range - any match",
          mockResult: [
            ["TELEPORT", "LIGHTNING"],
            ["FIRE", "ICE"],
          ],
          rule: { val: { perks: ["LIGHTNING", "ICE"], fromLevel: 0, toLevel: 1, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "level range - all match",
          mockResult: [
            ["TELEPORT", "LIGHTNING"],
            ["FIRE", "ICE"],
          ],
          rule: { val: { perks: ["TELEPORT", "FIRE"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "level range - not all match",
          mockResult: [
            ["TELEPORT", "LIGHTNING"],
            ["FIRE", "ICE"],
          ],
          rule: { val: { perks: ["TELEPORT", "NONEXISTENT"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: false,
        },
        {
          name: "undefined perks returns true",
          mockResult: [["TELEPORT"]],
          rule: { val: { fromLevel: 0, toLevel: 0 } },
          expected: true,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provide").mockImplementation((_perkPicks: any, maxLevels: number) => t.mockResult);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });

    describe("maxRerollCount", () => {
      const tests = [
        {
          name: "maxRerollCount greater than 0 triggers reroll check",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: ["TELEPORT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false, maxRerollCount: 1 } },
          expected: true,
        },
        {
          name: "maxRerollCount 0 does not trigger reroll check",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: ["TELEPORT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false, maxRerollCount: 0 } },
          expected: true,
        },
        {
          name: "maxRerollCount not set defaults to no reroll check",
          mockResult: [["TELEPORT"]],
          rule: { val: { perks: ["TELEPORT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provide").mockImplementation(
            (_perkPicks: any, maxLevels: number, _returnPerkObjects: boolean, _worldOffset: number, rerolls: any) =>
              t.mockResult,
          );
          vi.spyOn(provider as any, "getRerollCountForLevelRange").mockReturnValue(0);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });
  });
});

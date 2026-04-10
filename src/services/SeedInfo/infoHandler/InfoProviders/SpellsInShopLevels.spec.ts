import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WandInfoProvider } from "./Wand";
import { SpellInfoProvider } from "./Spell";
import { loadRandom } from "../../../../testHelpers";
import { SpellsInShopLevelsProvider } from "./SpellsInShopLevels";
import { IShopType, IItemShop, IWandShop } from "./Shop";

describe("SpellsInShopLevelsProvider", () => {
  let provider: SpellsInShopLevelsProvider;
  let randoms: any;
  let wandInfoProvider: WandInfoProvider;
  let spellInfoProvider: SpellInfoProvider;

  beforeEach(async () => {
    randoms = await loadRandom();
    wandInfoProvider = new WandInfoProvider(randoms);
    await wandInfoProvider.ready();
    spellInfoProvider = new SpellInfoProvider({} as any);
    await spellInfoProvider.ready();
    provider = new SpellsInShopLevelsProvider(randoms, wandInfoProvider, spellInfoProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("#test", () => {
    describe("single level - IShopType.item", () => {
      const tests = [
        {
          name: "spell found in item shop",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }, { spell: { id: "LIGHTNING" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: ["RECHARGE"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "spell not found in item shop",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }, { spell: { id: "LIGHTNING" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: ["NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: false,
        },
        {
          name: "any match - one of multiple found",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }, { spell: { id: "LIGHTNING" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: ["RECHARGE", "NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "all match - all found",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }, { spell: { id: "LIGHTNING" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "all match - not all found",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: false,
        },
        {
          name: "empty spells array returns true",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
          ] as IItemShop[],
          rule: { val: { spells: [], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provideLevel").mockImplementation((level: number) => t.mockResult[level]);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });

    describe("single level - IShopType.wand", () => {
      const tests = [
        {
          name: "spell found in wand shop",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }, { id: "LIGHTNING" }] } }],
            },
          ],
          rule: { val: { spells: ["RECHARGE"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "spell not found in wand shop",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }] } }],
            },
          ],
          rule: { val: { spells: ["NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: false,
        },
        {
          name: "any match - one of multiple found",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }, { id: "LIGHTNING" }] } }],
            },
          ],
          rule: { val: { spells: ["RECHARGE", "NONEXISTENT"], fromLevel: 0, toLevel: 0, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "all match - all found",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }, { id: "LIGHTNING" }] } }],
            },
          ],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "all match - not all found",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }] } }],
            },
          ],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 0, shouldMatchAll: true } },
          expected: false,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provideLevel").mockImplementation((level: number) => t.mockResult[level]);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });

    describe("multiple levels with mixed shop types", () => {
      const tests = [
        {
          name: "item shop level 0, wand shop level 1 - any match",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "LIGHTNING" }] } }],
            },
          ] as any[],
          rule: { val: { spells: ["LIGHTNING"], fromLevel: 0, toLevel: 1, shouldMatchAll: false } },
          expected: true,
        },
        {
          name: "item shop level 0, wand shop level 1 - all match",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "LIGHTNING" }] } }],
            },
          ] as any[],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "item shop level 0, wand shop level 1 - not all match",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "LIGHTNING" }] } }],
            },
          ] as any[],
          rule: { val: { spells: ["RECHARGE", "NONEXISTENT"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: false,
        },
        {
          name: "undefined spells returns true",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
          ] as any[],
          rule: { val: { fromLevel: 0, toLevel: 0 } },
          expected: true,
        },
        {
          name: "multiple levels - both item shops",
          mockResult: [
            {
              type: IShopType.item,
              items: [{ spell: { id: "RECHARGE" } }],
            },
            {
              type: IShopType.item,
              items: [{ spell: { id: "LIGHTNING" } }],
            },
            {
              type: IShopType.item,
              items: [{ spell: { id: "FIRE" } }],
            },
          ] as any[],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: true,
        },
        {
          name: "multiple levels - both wand shops",
          mockResult: [
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "RECHARGE" }] } }],
            },
            {
              type: IShopType.wand,
              items: [{ gun: { actions: [{ id: "LIGHTNING" }] } }],
            },
          ] as any[],
          rule: { val: { spells: ["RECHARGE", "LIGHTNING"], fromLevel: 0, toLevel: 1, shouldMatchAll: true } },
          expected: true,
        },
      ];

      tests.forEach(t => {
        it(t.name, () => {
          vi.spyOn(provider as any, "provideLevel").mockImplementation((level: number) => t.mockResult[level]);
          const result = provider.test(t.rule as any);
          expect(result).toEqual(t.expected);
        });
      });
    });
  });
});

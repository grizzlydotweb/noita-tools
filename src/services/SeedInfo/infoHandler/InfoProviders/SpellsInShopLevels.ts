import { IRule } from "../IRule";
import { ShopInfoProvider, IShopType, IItemShop, IWandShop } from "./Shop";
import type { WandInfoProvider } from "./Wand";
import type { SpellInfoProvider } from "./Spell";
import { includesSome, includesAll } from "../../../helpers";

export class SpellsInShopLevelsProvider extends ShopInfoProvider {
  constructor(randoms: any, wandInfoProvider: WandInfoProvider, spellInfoProvider: SpellInfoProvider) {
    super(randoms, wandInfoProvider, spellInfoProvider);
  }

  getSpellsForLevelRange(fromLevel: number, toLevel: number): string[] {
    const spells: string[] = [];
    const maxLevel = Math.min(toLevel, 6);

    for (let level = fromLevel; level <= maxLevel; level++) {
      const shop = this.provideLevel(level);

      if (!shop) continue;

      if (shop.type === IShopType.item) {
        const itemShop = shop as IItemShop;
        for (const item of itemShop.items) {
          const spellId = String(item.spell.id);
          if (!spells.includes(spellId)) {
            spells.push(spellId);
          }
        }
      } else if (shop.type === IShopType.wand) {
        const wandShop = shop as IWandShop;
        for (const wandItem of wandShop.items) {
          const wand = wandItem.gun as any;
          if (wand && wand.actions) {
            for (const action of wand.actions) {
              if (action.id && typeof action.id === "string" && !spells.includes(action.id)) {
                spells.push(action.id);
              }
            }
          }
        }
      }
    }
    return spells;
  }

  test(rule: IRule): boolean {
    const { spells, fromLevel, toLevel, shouldMatchAll } = rule.val || {};
    if (!spells || !spells.length) {
      return true;
    }

    try {
      const shopSpells = this.getSpellsForLevelRange(fromLevel, toLevel);
      const check = shouldMatchAll ? includesAll : includesSome;
      return check(shopSpells, spells);
    } catch (e) {
      console.error(e);
    }
    return true;
  }
}

export default SpellsInShopLevelsProvider;

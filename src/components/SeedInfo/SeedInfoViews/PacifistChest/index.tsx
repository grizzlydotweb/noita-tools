import React, { FC } from "react";
import Entity from "../../../Icons/Entity";
import BadgesWrapper, { CountBadge } from "../../../Icons/BadgesWrapper";
import { IItem } from "../../../../services/SeedInfo/infoHandler/InfoProviders/ChestRandom";
import GameInfoProvider from "../../../../services/SeedInfo/infoHandler";

interface IPacifistChestProps {
  items: IItem[];
  isSpellFavorite?: (id: string) => boolean;
  infoProvider?: GameInfoProvider;
}

const PacifistChest: FC<IPacifistChestProps> = ({ items, isSpellFavorite, infoProvider }) => {
  const goldReward = items.filter(r => r.entity.includes("goldnugget"));
  const nonGoldReward = items.filter(r => !r.entity.includes("goldnugget"));
  let goldSumm = goldReward.reduce<number>((c, r) => {
    // either goldnugget or goldnugget_x
    const gn = r.entity.split("/")[4].split(".")[0];
    if (gn === "goldnugget") {
      return c + 10;
    }
    const number = gn.replace("goldnugget_", "");
    return c + parseInt(number, 10);
  }, 0);

  return (
    <>
      {goldSumm > 0 && (
        <div className="d-flex m-2 flex-column align-content-center justify-content-center align-items-center">
          <Entity width="1rem" height="1rem" id="data/entities/items/pickup/goldnugget.xml" />
          {goldSumm}
        </div>
      )}
      {nonGoldReward.map((r, i) => {
        // Check if this is a wand item
        const isWand = r.entity.includes("wand_") && r.extra;

        if (isWand && isSpellFavorite && infoProvider) {
          try {
            // Create a temporary WandInfoProvider to generate wand data
            const wandProvider = infoProvider.providers.wand;
            if (wandProvider && r.extra) {
              // Generate wand data using the extra information
              const wandData = wandProvider.provide(
                r.x || 0,
                r.y || 0,
                r.extra.cost,
                r.extra.level,
                r.extra.force_unshuffle,
                false, // unshufflePerk - we don't have this info, defaulting to false
              );

              // Get spell IDs from the wand
              const spellIds: string[] = [
                ...(wandData.cards.permanentCard ? [wandData.cards.permanentCard] : []),
                ...wandData.cards.cards,
              ].filter(Boolean) as string[];

              // Filter only favorite spells
              const favoriteSpells = spellIds.filter(isSpellFavorite);

              // Group duplicate favorite spells and count occurrences
              const favoriteSpellsGrouped: Map<string, number> = favoriteSpells.reduce((acc, spell) => {
                acc.set(spell, (acc.get(spell) ?? 0) + 1);
                return acc;
              }, new Map<string, number>());

              // Create preview icons for favorite spells
              let favSpellIcons = Array.from(favoriteSpellsGrouped.entries())
                .slice(0, 3) // Limit to 3 for display
                .map(([spell, count]) => (
                  <BadgesWrapper key={spell} badges={[CountBadge({ text: count.toString() })]}>
                    <Entity key={spell} width="0.75rem" height="0.75rem" id="Spell" entityParams={{ extra: spell }} />
                  </BadgesWrapper>
                ));

              return (
                <div key={`${r.entity} - ${i}`} className="d-inline-block position-relative">
                  <Entity preview id={r.entity} entityParams={{ extra: r.extra, x: r.x, y: r.y }} />
                  {favSpellIcons.length > 0 && (
                    <div
                      className="position-absolute"
                      style={{
                        bottom: 0,
                        right: 0,
                        transform: "translate(25%, 25%)",
                        display: "flex",
                        gap: "2px",
                        padding: "2px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "3px",
                      }}
                    >
                      {favSpellIcons}
                    </div>
                  )}
                </div>
              );
            }
          } catch (error) {
            console.debug("Error generating wand preview:", error);
            // Fallback to regular Entity display
            return (
              <Entity
                preview
                key={`${r.entity} - ${i}`}
                id={r.entity}
                entityParams={{ extra: r.extra, x: r.x, y: r.y }}
              />
            );
          }
        }

        // Regular item display
        return (
          <Entity preview key={`${r.entity} - ${i}`} id={r.entity} entityParams={{ extra: r.extra, x: r.x, y: r.y }} />
        );
      })}
    </>
  );
};

export default PacifistChest;

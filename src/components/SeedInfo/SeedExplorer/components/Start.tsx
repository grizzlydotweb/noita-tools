import React from "react";
import { Card, Stack } from "react-bootstrap";
import GameInfoProvider from "../../../../services/SeedInfo/infoHandler";
import { SpellInfoProvider } from "../../../../services/SeedInfo/infoHandler/InfoProviders/Spell";
import { StartingBombSpellInfoProvider } from "../../../../services/SeedInfo/infoHandler/InfoProviders/StartingBomb";
import { StartingFlaskInfoProvider } from "../../../../services/SeedInfo/infoHandler/InfoProviders/StartingFlask";
import { StartingSpellInfoProvider } from "../../../../services/SeedInfo/infoHandler/InfoProviders/StartingSpell";

import Entity from "../../../Icons/Entity";
import { FungalMaterial } from "../../SeedInfoViews/FungalShifts";

interface IStartProps {
  startingFlask: ReturnType<StartingFlaskInfoProvider["provide"]>;
  startingSpell: ReturnType<StartingSpellInfoProvider["provide"]>;
  startingBombSpell: ReturnType<StartingBombSpellInfoProvider["provide"]>;
}

const spells = new SpellInfoProvider({} as any);

const Start = (props: IStartProps) => {
  const { startingFlask, startingSpell, startingBombSpell } = props;
  const startingSpellSpell = spells.provide(startingSpell.toUpperCase());
  const startingBombSpellSpell = spells.provide(startingBombSpell.toUpperCase());

  return (
    <div className="border rounded d-flex align-items-center">
          <div className="fw-bold text-uppercase p-1" style={{ fontSize: '.7rem' }}>Starting setup:</div>
          <Entity
            id="Spell"
            size={"1.3rem"}
            entityParams={{
              extra: startingSpell.toUpperCase(),
            }}
          />
          <Entity
            id="Spell"
            size={"1.3rem"}
            entityParams={{
              extra: startingBombSpell.toUpperCase(),
            }}
          />
          <FungalMaterial showColor id={startingFlask} />
    </div>
  );
};

export default Start;

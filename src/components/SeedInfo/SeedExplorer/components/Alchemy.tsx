import classNames from "classnames";
import { FC, ReactElement } from "react";

import GameInfoProvider from "../../../../services/SeedInfo/infoHandler";
import { FungalMaterial } from "../../SeedInfoViews/FungalShifts";

interface IAlchemyProps {
  alchemy: {
    LC: string[];
    AP: string[];
  };
  infoProvider: GameInfoProvider;
}

const easyMaterials = ['water', 'blood', 'oil', 'alcohol', 'swamp', 'lava']

const AlchemyCard: FC<{ materials: string[]; Title: ReactElement }> = ({ materials, Title }) => {
  const hasEasyMaterials = !materials.map(m => easyMaterials.includes(m)).includes(false);
  return (
    <div>
      <div className={classNames("d-flex flex-wrap align-items-center border rounded-3", hasEasyMaterials && 'border-success')}>
       <div className={classNames("fw-bold text-uppercase p-1", hasEasyMaterials && 'text-success')} style={{ fontSize: '.7rem' }}>{Title}:</div>
        {materials.map(l => (
          <FungalMaterial key={l} id={l} />
        ))}
      </div>
    </div>
  );
};

const Alchemy = (props: IAlchemyProps) => {
  const { alchemy, infoProvider } = props;
  return (
    <div className="d-flex flex-wrap gap-2">
      <AlchemyCard Title={<>Lively Concoction</>} materials={alchemy.LC} />
      <AlchemyCard Title={<>Alchemic Precursor</>} materials={alchemy.AP} />
    </div>
  );
};

export default Alchemy;

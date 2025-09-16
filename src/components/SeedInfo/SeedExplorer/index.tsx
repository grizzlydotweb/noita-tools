import { Modal, CloseButton } from "react-bootstrap";

import useLocalStorage from "../../../services/useLocalStorage";

import Alchemy from "./components/Alchemy";
import Start from "./components/Start";
import WorldSelector from "../HolyMountain/components/WorldSelector";
import HolyMountain, { HolyMountainContextProvider } from "../HolyMountain";


const SeedExplorer = ({ data, infoProvider, seed, isDaily }) => {
  const [explorerView, setExplorerView] = useLocalStorage<boolean>('explorer-view', false);
  const handleClose = () => setExplorerView(false);

  return (
    <HolyMountainContextProvider infoProvider={infoProvider} perks={data.perks} perkDeck={data.perkDeck}>
      <Modal 
        fullscreen
        scrollable
        animation={false}
        show={explorerView} 
        onHide={handleClose}
      >
        <Modal.Body className="p-0">
          <div className="d-flex flex-column h-100 gap-2 p-2">

            <div className="d-flex border border-primary align-items-center justify-items-space gap-2 p-2">
              <CloseButton onClick={handleClose}/>
              <span>Seed: {seed} {isDaily && ` (Daily)`}</span>
              <div className="border"><WorldSelector /></div>
            </div>
            
            <div className="d-flex align-items-stretch justify-content-between">
              <Start startingFlask={data.startingFlask} startingSpell={data.startingSpell} startingBombSpell={data.startingBombSpell} />
              <Alchemy infoProvider={infoProvider} alchemy={data.alchemy} />
            </div>

            <div className="d-flex flex-grow-1 align-self-stretch align-items-stretch justify-content-between" style={{overflowY: 'scroll'}}>
              <HolyMountain infoProvider={infoProvider} shop={data.shop} perks={data.perks} perkDeck={data.perkDeck} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </HolyMountainContextProvider>
  );
}
export default SeedExplorer;
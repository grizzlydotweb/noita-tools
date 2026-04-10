import { useReducer, useState, useEffect } from "react";
import { Row, Col, Container, Stack, Form } from "react-bootstrap";

import { IRule } from "../../../services/SeedInfo/infoHandler/IRule";
import { PerkInfoProvider } from "../../../services/SeedInfo/infoHandler/InfoProviders/Perk";
import { Square } from "../../helpers";
import PerkSelect from "../../PerkSelect";
import Perk from "../../Icons/Perk";
import cloneDeep from "lodash/cloneDeep.js";

const perkInfoProvider = new PerkInfoProvider({} as any);

interface IPerksInLevelsProps {
  onUpdateConfig: (config: Partial<IRule>) => void;
  config: IRule;
}

interface IConfig {
  perks: string[];
  fromLevel: number;
  toLevel: number;
  shouldMatchAll: boolean;
  maxRerollCount: number;
}

interface IAction {
  action: "perk-add" | "perk-remove" | "fromLevel" | "toLevel" | "shouldMatchAll" | "maxRerollCount";
  data?: any;
}

const perksReducer = (state: IConfig, a: IAction): IConfig => {
  const { action, data } = a;
  const newState = cloneDeep(state);

  switch (action) {
    case "perk-add": {
      if (!newState.perks.includes(data)) {
        newState.perks.push(data);
      }
      return newState;
    }
    case "perk-remove": {
      const index = newState.perks.indexOf(data);
      if (index !== -1) {
        newState.perks.splice(index, 1);
      }
      return newState;
    }
    case "fromLevel": {
      newState.fromLevel = Math.min(Math.max(Number(data), 0), 6);
      return newState;
    }
    case "toLevel": {
      newState.toLevel = Math.min(Math.max(Number(data), 0), 6);
      return newState;
    }
    case "shouldMatchAll": {
      newState.shouldMatchAll = Boolean(data);
      return newState;
    }
    case "maxRerollCount": {
      newState.maxRerollCount = Math.min(Math.max(Number(data), 0), 10);
      return newState;
    }
  }
  return state;
};

const PerksInLevels = (props: IPerksInLevelsProps) => {
  const { onUpdateConfig, config } = props;
  const [showPerkSelect, setShowPerkSelect] = useState(false);

  const defaultConfig: IConfig = {
    perks: config.val?.perks || [],
    fromLevel: config.val?.fromLevel ?? 0,
    toLevel: config.val?.toLevel ?? 6,
    shouldMatchAll: config.val?.shouldMatchAll ?? false,
    maxRerollCount: config.val?.maxRerollCount ?? 0,
  };

  const [state, dispatch] = useReducer(perksReducer, defaultConfig);

  useEffect(() => {
    const newConfig = {
      type: "perksInLevels",
      path: "",
      params: [],
      val: state,
    };
    if (JSON.stringify(config.val) !== JSON.stringify(state)) {
      onUpdateConfig(newConfig);
    }
  }, [state]);

  const handlePerkAdd = (perk: string) => {
    dispatch({ action: "perk-add", data: perk });
  };

  const handlePerkRemove = (perk: string) => {
    dispatch({ action: "perk-remove", data: perk });
  };

  const handleFromLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ action: "fromLevel", data: e.target.value });
  };

  const handleToLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ action: "toLevel", data: e.target.value });
  };

  const handleShouldMatchAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ action: "shouldMatchAll", data: e.target.checked });
  };

  const handleMaxRerollCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ action: "maxRerollCount", data: e.target.value });
  };

  return (
    <Container fluid>
      <p>Check if selected perks appear in temples between specified levels.</p>
      <Row className="justify-content-md-center">
        <Col xs="auto">
          <Stack gap={3}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={6}
                    value={state.fromLevel}
                    onChange={handleFromLevelChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>To</Form.Label>
                  <Form.Control type="number" min={0} max={6} value={state.toLevel} onChange={handleToLevelChange} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Max Rerolls</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={10}
                    value={state.maxRerollCount}
                    onChange={handleMaxRerollCountChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Perks</Form.Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {state.perks.map(perkId => {
                      const perk = perkInfoProvider.perks[perkId];
                      return perk ? <Perk key={perkId} perk={perk} onClick={() => handlePerkRemove(perkId)} /> : null;
                    })}
                    <div onClick={() => setShowPerkSelect(true)} style={{ cursor: "pointer" }}>
                      <Square className="bg-secondary">+</Square>
                    </div>
                  </Stack>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Check
                    type="switch"
                    id="shouldMatchAll"
                    label={state.shouldMatchAll ? "All" : "Any"}
                    checked={state.shouldMatchAll}
                    onChange={handleShouldMatchAllChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Stack>
        </Col>
      </Row>
      <PerkSelect
        show={showPerkSelect}
        selected={state.perks}
        showSelected
        handleClose={() => setShowPerkSelect(false)}
        handleOnClick={handlePerkAdd}
        handleSelectedClicked={handlePerkRemove}
      />
    </Container>
  );
};

export default PerksInLevels;

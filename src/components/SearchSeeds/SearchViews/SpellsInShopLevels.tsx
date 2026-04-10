import { useReducer, useState, useEffect } from "react";
import { Row, Col, Container, Stack, Form } from "react-bootstrap";

import { IRule } from "../../../services/SeedInfo/infoHandler/IRule";
import { Square } from "../../helpers";
import SpellSelect from "../../SpellSelect";
import Spell from "../../Icons/Spell";
import cloneDeep from "lodash/cloneDeep.js";

interface ISpellsInShopLevelsProps {
  onUpdateConfig: (config: Partial<IRule>) => void;
  config: IRule;
}

interface IConfig {
  spells: string[];
  fromLevel: number;
  toLevel: number;
  shouldMatchAll: boolean;
}

interface IAction {
  action: "spell-add" | "spell-remove" | "fromLevel" | "toLevel" | "shouldMatchAll";
  data?: any;
}

const spellsReducer = (state: IConfig, a: IAction): IConfig => {
  const { action, data } = a;
  const newState = cloneDeep(state);

  switch (action) {
    case "spell-add": {
      if (!newState.spells.includes(data)) {
        newState.spells.push(data);
      }
      return newState;
    }
    case "spell-remove": {
      const index = newState.spells.indexOf(data);
      if (index !== -1) {
        newState.spells.splice(index, 1);
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
  }
  return state;
};

const SpellsInShopLevels = (props: ISpellsInShopLevelsProps) => {
  const { onUpdateConfig, config } = props;
  const [showSpellSelect, setShowSpellSelect] = useState(false);

  const defaultConfig: IConfig = {
    spells: config.val?.spells || [],
    fromLevel: config.val?.fromLevel ?? 0,
    toLevel: config.val?.toLevel ?? 6,
    shouldMatchAll: config.val?.shouldMatchAll ?? false,
  };

  const [state, dispatch] = useReducer(spellsReducer, defaultConfig);

  useEffect(() => {
    const newConfig = {
      type: "spellsInShopLevels",
      path: "",
      params: [],
      val: state,
    };
    if (JSON.stringify(config.val) !== JSON.stringify(state)) {
      onUpdateConfig(newConfig);
    }
  }, [state]);

  const handleSpellAdd = (spell: string) => {
    dispatch({ action: "spell-add", data: spell });
  };

  const handleSpellRemove = (spell: string) => {
    dispatch({ action: "spell-remove", data: spell });
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

  return (
    <Container fluid>
      <p>Check if selected spells appear in shops between specified levels.</p>
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
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Spells</Form.Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {state.spells.map(spell => (
                      <Spell key={spell} id={spell} onClick={() => handleSpellRemove(spell)} />
                    ))}
                    <div onClick={() => setShowSpellSelect(true)} style={{ cursor: "pointer" }}>
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
      <SpellSelect
        show={showSpellSelect}
        selected={state.spells}
        showSelected
        handleClose={() => setShowSpellSelect(false)}
        handleOnClick={handleSpellAdd}
        handleSelectedClicked={handleSpellRemove}
      />
    </Container>
  );
};

export default SpellsInShopLevels;

import classNames from "classnames";
import { useContext, useState, useRef, useEffect } from "react";
import { Stack, Button, Form } from "react-bootstrap";

import { HolyMountainContext } from "../index";


  const OffsetText = (worldOffset:number, handleOffset:Function) => {
    const [clicked, setClicked] = useState(false);
    const formRef = useRef<HTMLInputElement>(null);
    let direction = worldOffset === 0 ? "Main" : worldOffset < 0 ? "West" : "East";

    useEffect(() => {
      if (clicked) {
        formRef.current!.focus();
      }
    }, [clicked]);

    return (
      <div
        className={classNames(!clicked && "border border-dark rounded px-3 py-1")}
        onClick={() => {
          setClicked(true);
        }}
      >
        {!clicked && `${direction} World ${Math.abs(worldOffset) || ""}`}
        <Form.Control
          size="sm"
          style={{ width: "8rem" }}
          hidden={!clicked}
          ref={formRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          onBlur={e => {
            setClicked(false);
            const value = parseInt(e.target.value);
            if (isNaN(value)) {
              return;
            }
            handleOffset(value);
          }}
          placeholder={worldOffset.toString()}
        />
      </div>
    );
  };


const WorldSelector = () => {
  const { perkMethods, perkData } = useContext(HolyMountainContext);

  const {
    handleOffset,
  } = perkMethods;

  const {
    worldOffset,
  } = perkData;
return (
    <Stack gap={3} direction="horizontal">
        <Button variant="outline-primary" size="sm" onClick={() => handleOffset("-")}>
        &lt;
        </Button>
        <span className="block capitalize">{OffsetText(worldOffset, handleOffset)}</span>
        <Button variant="outline-primary" size="sm" onClick={() => handleOffset("+")}>
        &gt;
        </Button>
    </Stack>
);
    
}

export default WorldSelector;
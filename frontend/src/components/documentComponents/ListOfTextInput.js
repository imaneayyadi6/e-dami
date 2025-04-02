import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { Form } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { v4 as uuidv4 } from "uuid";
import { cssStringToObject } from "../../services";

const ListOfTextInput = ({
  mainLabelProps,
  isBlock = false,
  lineProps = null,
}) => {
  const [show, setShow] = useState(false);

  const [placeholder, setPlaceholder] = useState(
    lineProps ? lineProps.placeholder : ""
  );
  const [size, setSize] = useState(lineProps ? lineProps.size : "");
  const [block, setBlock] = useState(isBlock);
  const [nbrLines, setNbrLines] = useState(lineProps ? lineProps.nbrLines : 4);

  const txtAreaRef = useRef();
  const popoverRef = useRef();

  const id = uuidv4();
  const popoverId = `popover-${id}`;

  const clickHandler = (event) => {
    setShow(!show);
  };

  useEffect(() => {
    const handleBodyClick = (event) => {
      const popover = document.querySelector(".popover");
      document.querySelectorAll(".dami-textarea-line").forEach((txArLine) => {
        const condition =
          !txtAreaRef.current.contains(event.target) &&
          popover &&
          !popover.contains(event.target) &&
          !txArLine.contains(event.target);

        if (condition) {
          setShow(false);
        }
      });
    };
    document.body.addEventListener("click", handleBodyClick);
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (txtAreaRef && txtAreaRef.current) {
      if (placeholder) {
        const selector = ".dami-textarea-line";
        const elements = txtAreaRef.current.querySelectorAll(selector);
        const firstElement = elements[0];
        if (firstElement) firstElement.placeholder = placeholder;
      }

      if (size) {
        const selector = ".dami-textarea-line";
        const elements = txtAreaRef.current.querySelectorAll(selector);
        elements.forEach((element) => {
          element.style.fontSize = size + "px";
        });
      }

      if (block) {
        txtAreaRef.current.classList.add("block");
      } else {
        txtAreaRef.current.classList.remove("block");
      }
    }
  }, [id, placeholder, size, block]);

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>Style des zone de textes</Popover.Header>
      <Popover.Body>
        <label>Placeholder :</label>
        <Form.Control
          size="sm"
          placeholder="Exp: 'veuillez saisire quelque chose' "
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
        />
        <label>Nombre de lignes :</label>
        <Form.Control
          type="number"
          size="sm"
          min={4}
          max={10}
          value={nbrLines}
          onChange={(e) => setNbrLines(e.target.value)}
        />
        <label className="mt-3">Taille de police</label>
        <Form.Select
          size="sm"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        >
          <option value={""}>
            ---- veuillez choisire la taille de police ----
          </option>
          <option value={"12"}>12px</option>
          <option value={"13"}>13px</option>
          <option value={"14"}>14px</option>
          <option value={"15"}>15px</option>
          <option value={"16"}>16px</option>
          <option value={"17"}>17px</option>
          <option value={"18"}>18px</option>
        </Form.Select>
        <label className="mt-3">Taille de la zone de text</label>
        <Form.Check
          label="block"
          checked={block}
          onChange={(e) => setBlock(!block)}
        />
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      <Label
        className={`mr-1 ${mainLabelProps && mainLabelProps.className}`}
        style={
          mainLabelProps && cssStringToObject(String(mainLabelProps.style))
        }
        text={mainLabelProps ? mainLabelProps.text : "label"}
      />
      <OverlayTrigger
        trigger="click"
        placement="left"
        overlay={popover}
        show={show}
        rootClose={true}
      >
        <div
          className="lst-of-text-input"
          ref={txtAreaRef}
          onClick={clickHandler}
        >
          {(() => {
            const contentArray = [];
            for (let i = 0; i <= nbrLines - 1; i++) {
              contentArray.push(
                <input key={i} className={`dami-textarea-line`} readOnly />
              );
            }
            return contentArray;
          })()}
        </div>
      </OverlayTrigger>
    </>
  );
};

export default ListOfTextInput;

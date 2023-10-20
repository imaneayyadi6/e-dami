import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import { cssStringToObject } from "../../services";

const TextInput = ({ showLabel = true, mainLabelProps, textInputProp }) => {
  const id = uuidv4();
  const [show, setShow] = useState(false);

  const [placeholder, setPlaceholder] = useState(
    textInputProp && textInputProp.placeholder ? textInputProp.placeholder : ""
  );
  const [type, setType] = useState(
    textInputProp && textInputProp.type ? textInputProp.type : ""
  );
  const [size, setSize] = useState(
    textInputProp && textInputProp.size ? textInputProp.size : ""
  );
  const [block, setBlock] = useState(
    textInputProp && textInputProp.block ? textInputProp.block : false
  );
  const [min, setMin] = useState(
    textInputProp && textInputProp.min ? textInputProp.min : 0
  );
  const [max, setMax] = useState(
    textInputProp && textInputProp.max ? textInputProp.max : 100
  );

  const txtInputRef = useRef();
  const popoverRef = useRef();

  const popoverId = `popover-${id}`;

  const clickHandler = (event) => {
    setShow(!show);
  };

  useEffect(() => {
    const handleBodyClick = (event) => {
      const popover = document.querySelector(".popover");
      if (
        txtInputRef &&
        !txtInputRef.current.contains(event.target) &&
        popover &&
        !popover.contains(event.target)
      ) {
        setShow(false);
      }
    };
    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (txtInputRef && txtInputRef.current) {
      if (placeholder) txtInputRef.current.placeholder = placeholder;
      if (type) txtInputRef.current.type = type;
      if (min) txtInputRef.current.min = min;
      if (max) txtInputRef.current.max = max;
      if (size) txtInputRef.current.style.fontSize = size + "px";
      if (block) txtInputRef.current.classList.add("block");
      else txtInputRef.current.classList.remove("block");
    }
  }, [placeholder, type, size, block, min, max]);

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>Style de la zone de text</Popover.Header>
      <Popover.Body>
        <Form>
          <label>Type</label>
          <Form.Select
            size="sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value={""}>---- veuillez choisire type ----</option>
            <option value={"text"}>Text</option>
            <option value={"date"}>Date</option>
            <option value={"number"}>Nombre</option>
          </Form.Select>

          {type === "number" && (
            <>
              <label>Min - Max valeur :</label>
              <div className="d-flex align-items-center justify-content-center">
                <div className="mx-1">
                  <label>min :</label>
                  <Form.Control
                    className=""
                    size="sm"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                  />
                </div>
                <div className="mx-1">
                  <label>max :</label>
                  <Form.Control
                    className=""
                    size="sm"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <label className="mt-3">Placeholder :</label>
          <Form.Control
            size="sm"
            placeholder="Exp: 'veuillez saisire quelque chose' "
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
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
        </Form>
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="d-flex align-items-center">
      {showLabel && (
        <Label
          className={`mr-1 ${mainLabelProps && mainLabelProps.className}`}
          style={
            mainLabelProps && cssStringToObject(String(mainLabelProps.style))
          }
          text={mainLabelProps ? mainLabelProps.text : "label"}
        />
      )}
      <OverlayTrigger
        trigger="click"
        placement="left"
        overlay={popover}
        show={show}
        rootClose={true}
      >
        <input
          type="text"
          className="dami-input"
          ref={txtInputRef}
          readOnly
          id={`dami-input-${id}`}
          onClick={clickHandler}
        />
      </OverlayTrigger>
    </div>
  );
};

export default TextInput;

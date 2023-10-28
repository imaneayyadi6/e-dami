import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { v4 as uuidv4 } from "uuid";

const Label = ({ block = false, className, style, text = "label" }) => {
  const [labelText, setLabelText] = useState(text);
  const [show, setShow] = useState(false);

  const labelRef = useRef();
  const popoverRef = useRef();

  const id = uuidv4();

  const labelId = `dami-label-${id}`;
  const popoverId = `popover-${id}`;

  const clickHandler = event => {
    if (labelRef.current) {
      labelRef.current.classList.toggle("focus");
      setShow(!show);
    }
  };

  useEffect(() => {
    const handleBodyClick = event => {
      const popover = document.querySelector(".popover");
      if (
        !labelRef.current.contains(event.target) &&
        popover &&
        !popover.contains(event.target)
      ) {
        setShow(false);
        labelRef.current.classList.remove("focus");
      }
    };
    document.body.addEventListener("click", handleBodyClick);
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>Changer le text de label</Popover.Header>
      <Popover.Body>
        <Form onClick={e => e.stopPropagation()}>
          <Form.Control
            placeholder='changer le text de label'
            value={labelText}
            onClick={e => e.stopPropagation()}
            onChange={e => setLabelText(e.target.value)}
          />
        </Form>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger='click'
      placement='top'
      overlay={popover}
      show={show}
      rootClose={true}>
      <label
        className={`dami-label ${className} ${block && "block"}`}
        onClick={clickHandler}
        style={style ? style : {}}
        ref={labelRef}
        id={labelId}>
        {labelText}
      </label>
    </OverlayTrigger>
  );
};

export default Label;

import React from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

const TextStyles = () => {
  const doc = document.querySelector(".doc");

  const fontSizeHandler = (event) => {
    if (doc) {
      const selectedLabels = [];
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          selectedLabels[j].style.fontSize = event.target.value + "px";
        }
      }
    }
  };

  const textBoldHandler = () => {
    if (doc) {
      const selectedLabels = [];
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("bold")) {
            selectedLabels[j].classList.remove("bold");
          } else {
            selectedLabels[j].classList.add("bold");
          }
        }
      }
    }
  };

  const textItalicHandler = () => {
    if (doc) {
      const selectedLabels = [];
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("italic")) {
            selectedLabels[j].classList.remove("italic");
          } else {
            selectedLabels[j].classList.add("italic");
          }
        }
      }
    }
  };

  const textUnderlineHandler = () => {
    if (doc) {
      const selectedLabels = [];

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("underline")) {
            selectedLabels[j].classList.remove("underline");
          } else {
            selectedLabels[j].classList.add("underline");
          }
        }
      }
    }
  };

  const textAlignRightHandler = (event) => {
    if (doc) {
      const selectedLabels = [];

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("align-right")) {
            selectedLabels[j].classList.remove("align-right");
          } else if (selectedLabels[j].classList.contains("align-left")) {
            selectedLabels[j].classList.remove("align-left");
            selectedLabels[j].classList.add("align-right");
          } else if (selectedLabels[j].classList.contains("align-center")) {
            selectedLabels[j].classList.remove("align-center");
            selectedLabels[j].classList.add("align-right");
          } else if (selectedLabels[j].classList.contains("align-justify")) {
            selectedLabels[j].classList.remove("align-center");
            selectedLabels[j].classList.add("align-right");
          } else {
            selectedLabels[j].classList.add("align-right");
          }
        }
      }
    }
  };

  const textAlignCenterHandler = (event) => {
    if (doc) {
      const selectedLabels = [];

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("align-center")) {
            selectedLabels[j].classList.remove("align-center");
          } else if (selectedLabels[j].classList.contains("align-left")) {
            selectedLabels[j].classList.remove("align-left");
            selectedLabels[j].classList.add("align-center");
          } else if (selectedLabels[j].classList.contains("align-right")) {
            selectedLabels[j].classList.remove("align-right");
            selectedLabels[j].classList.add("align-center");
          } else if (selectedLabels[j].classList.contains("align-justify")) {
            selectedLabels[j].classList.remove("align-justify");
            selectedLabels[j].classList.add("align-center");
          } else {
            selectedLabels[j].classList.add("align-center");
          }
        }
      }
    }
  };

  const textAlignLeftHandler = (event) => {
    if (doc) {
      const selectedLabels = [];

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("align-left")) {
            selectedLabels[j].classList.remove("align-left");
          } else if (selectedLabels[j].classList.contains("align-center")) {
            selectedLabels[j].classList.remove("align-center");
            selectedLabels[j].classList.add("align-left");
          } else if (selectedLabels[j].classList.contains("align-right")) {
            selectedLabels[j].classList.remove("align-right");
            selectedLabels[j].classList.add("align-left");
          } else if (selectedLabels[j].classList.contains("align-justify")) {
            selectedLabels[j].classList.remove("align-justify");
            selectedLabels[j].classList.add("align-left");
          } else {
            selectedLabels[j].classList.add("align-left");
          }
        }
      }
    }
  };

  const textAlignJustifyHandler = (event) => {
    if (doc) {
      const selectedLabels = [];

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const allLabels = doc.querySelectorAll(".dami-label");

      for (let i = 0; i < allLabels.length; i++) {
        const label = allLabels[i];
        const labelRange = document.createRange();
        labelRange.selectNode(label);

        if (
          (range.intersectsNode(label) && !selectedLabels.includes(label)) ||
          label.classList.contains("focus")
        ) {
          selectedLabels.push(label);
        }
      }

      if (selectedLabels.length > 0) {
        for (let j = 0; j < selectedLabels.length; j++) {
          if (selectedLabels[j].classList.contains("align-justify")) {
            selectedLabels[j].classList.remove("align-justify");
          } else if (selectedLabels[j].classList.contains("align-center")) {
            selectedLabels[j].classList.remove("align-center");
            selectedLabels[j].classList.add("align-justify");
          } else if (selectedLabels[j].classList.contains("align-right")) {
            selectedLabels[j].classList.remove("align-right");
            selectedLabels[j].classList.add("align-justify");
          } else if (selectedLabels[j].classList.contains("align-left")) {
            selectedLabels[j].classList.remove("align-left");
            selectedLabels[j].classList.add("align-justify");
          } else {
            selectedLabels[j].classList.add("align-justify");
          }
        }
      }
    }
  };

  return (
    <Card className="my-3">
      <Card.Body style={{ userSelect: "none" }}>
        <Row>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textBoldHandler}
            >
              <i className="fa-solid fa-bold"></i>
            </Button>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textItalicHandler}
            >
              <i className="fa-solid fa-italic"></i>
            </Button>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textUnderlineHandler}
            >
              <i className="fa-solid fa-underline"></i>
            </Button>
          </Col>
          <Col xl={3} lg={3} md={3} sm={4} xs={4}>
            <Form.Select size="sm" className="w-100" onChange={fontSizeHandler}>
              <option value={"8"}>8px</option>
              <option value={"9"}>9px</option>
              <option value={"10"}>10px</option>
              <option value={"11"}>11px</option>
              <option value={"12"}>12px</option>
              <option value={"13"}>13px</option>
              <option value={"14"}>14px</option>
              <option value={"16"}>16px</option>
              <option value={"18"}>18px</option>
              <option value={"24"}>24px</option>
              <option value={"36"}>36px</option>
              <option value={"48"}>48px</option>
              <option value={"52"}>52px</option>
              <option value={"64"}>64px</option>
              <option value={"72"}>72px</option>
            </Form.Select>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textAlignLeftHandler}
            >
              <i className="fa-solid fa-align-left"></i>
            </Button>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textAlignCenterHandler}
            >
              <i className="fa-solid fa-align-center"></i>
            </Button>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textAlignRightHandler}
            >
              <i className="fa-solid fa-align-right"></i>
            </Button>
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} xs={1}>
            <Button
              className="d-inline"
              size="sm"
              variant="light"
              onClick={textAlignJustifyHandler}
            >
              <i className="fa-solid fa-align-justify"></i>
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TextStyles;

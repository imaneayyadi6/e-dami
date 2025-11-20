import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { cssStringToObject } from "../../services";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import Message from "../Message";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const DamiCheckBox = ({ id, onRemove, labelProp, dataConditionID = "" }) => {
  const { isRTL } = useLanguageSync();
  const [chkId, setChkId] = useState(dataConditionID);
  const [show, setShow] = useState(false);

  const uuid = uuidv4();

  const chkInputRef = useRef();
  const popoverRef = useRef();
  const popoverId = `popover-${uuid}`;

  const clickHandler = (event) => {
    setShow(!show);
  };

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>identifiant</Popover.Header>
      <Popover.Body dir={isRTL ? 'rtl' : 'ltr'}>
        <Message type="warning">
          Saisir un identifiant à utiliser dans une condition de signataire.
        </Message>
        <Form>
          <label>Identifiant :</label>
          <Form.Control
            size="sm"
            value={chkId}
            placeholder="saisir un identifiant ..."
            onChange={(e) => setChkId(e.target.value)}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </Form>
      </Popover.Body>
    </Popover>
  );

  useEffect(() => {
    const handleBodyClick = (event) => {
      const popover = document.querySelector(".popover");
      if (
        chkInputRef &&
        !chkInputRef.current.contains(event.target) &&
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

  return (
    <div className="d-flex justify-content-center align-items-center">
      <span className="btn-remove-chk" onClick={() => onRemove(id)}>
        <i className="fas fa-times text-danger"></i>
      </span>
      <OverlayTrigger
        trigger="click"
        placement="top"
        overlay={popover}
        show={show}
        rootClose={true}
      >
        <input
          className="dami-check-box ml-1"
          type="checkbox"
          readOnly
          ref={chkInputRef}
          onClick={clickHandler}
          data-conditionid={chkId}
        />
      </OverlayTrigger>
      <Label
        className={`ml-1 ${labelProp && labelProp.className}`}
        style={labelProp && cssStringToObject(labelProp.style)}
        text={labelProp && labelProp.text}
      />
    </div>
  );
};

const CheckBox = ({ mainLabelProps, checkboxItems = [] }) => {
  const [items, setItems] = useState([{ id: uuidv4() }]);

  const onAddCheckboxHandler = () => {
    if (items.length < 4) {
      setItems([...items, { id: uuidv4() }]);
    }
  };

  const onRemoveHandler = (id) => {
    const nItems = items.filter((item) => String(id) !== String(item.id));
    setItems(nItems);
  };

  useEffect(() => {
    if (checkboxItems.length > 0) {
      let nItems = [];
      for (const item of checkboxItems) {
        nItems.push({
          labelProp: item,
          id: uuidv4(),
          dataConditionID: item.dataConditionID,
        });
      }
      setItems(nItems);
    }
  }, [checkboxItems]);

  return (
    <div className="d-flex align-items-center dami-check-box-container">
      <Label
        className={`mr-1 ${mainLabelProps && mainLabelProps.className}`}
        style={
          mainLabelProps && cssStringToObject(String(mainLabelProps.style))
        }
        text={mainLabelProps ? mainLabelProps.text : "label"}
      />
      {items.length > 0 &&
        items.map((item) => (
          <DamiCheckBox
            key={item.id}
            id={item.id}
            labelProp={item.labelProp}
            dataConditionID={item.dataConditionID}
            onRemove={() => onRemoveHandler(item.id)}
          />
        ))}
      <span className="btn-add-chk ml-2" onClick={onAddCheckboxHandler}>
        <i className="fas fa-plus"></i>
      </span>
    </div>
  );
};

export default CheckBox;

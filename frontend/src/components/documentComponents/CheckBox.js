import React, { useEffect, useState } from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { cssStringToObject } from "../../services";

const DamiCheckBox = ({ id, onRemove, labelProp }) => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <span className="btn-remove-chk" onClick={() => onRemove(id)}>
        <i className="fas fa-times text-danger"></i>
      </span>
      <input className="dami-check-box ml-1" type="checkbox" readOnly />
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
    if (items.length < 3) {
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
        nItems.push({ labelProp: item, id: uuidv4() });
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

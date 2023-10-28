import React from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { cssStringToObject } from "../../services";

const RadioButtons = ({ mainLabelProps = null, radioButtonItems = [] }) => {
  const id = uuidv4();
  return (
    <div className='d-flex align-items-center dami-radio-button-container'>
      <Label
        className={`mr-1 ${mainLabelProps && mainLabelProps.className}`}
        style={
          mainLabelProps && cssStringToObject(String(mainLabelProps.style))
        }
        text={mainLabelProps ? mainLabelProps.text : "label"}
      />
      <div className='d-flex justify-content-center align-items-center dami-radio-button-wrapper'>
        <input
          className='dami-radio-button ml-1'
          type='radio'
          name={id}
          readOnly
        />
        <Label
          className={`mr-1 ${
            radioButtonItems.length > 0 && radioButtonItems[0].className
          }`}
          text={
            radioButtonItems.length > 0 ? radioButtonItems[0].text : "label"
          }
          style={
            radioButtonItems.length > 0 &&
            cssStringToObject(radioButtonItems[0].style)
          }
        />
      </div>
      <div className='d-flex justify-content-center align-items-center dami-radio-button-wrapper'>
        <input
          className='dami-radio-button ml-1'
          type='radio'
          name={id}
          readOnly
        />
        <Label
          className={`mr-1 ${
            radioButtonItems.length > 0 && radioButtonItems[1].className
          }`}
          text={
            radioButtonItems.length > 0 ? radioButtonItems[1].text : "label"
          }
          style={
            radioButtonItems.length > 0 &&
            cssStringToObject(radioButtonItems[1].style)
          }
        />
      </div>
    </div>
  );
};

export default RadioButtons;

import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import { cssStringToObject } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const DamiRadioButton = ({ name, disabled }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguageSync();
  const id = uuidv4();
  const [show, setShow] = useState(false);
  const [disabledChk, setDisabledChk] = useState(disabled);
  const radioRef = useRef();
  const popoverRef = useRef();
  const popoverId = `popover-${id}`;

  const clickHandler = (event) => {
    event.preventDefault();
    setShow(!show);
  };

  useEffect(() => {
    const handleBodyClick = (event) => {
      const popover = document.querySelector(".popover");
      if (
        radioRef &&
        !radioRef.current.contains(event.target) &&
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

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>
        <small>{t('builder.common.disabledTitle', { defaultValue: 'Désactiver ou non' })}</small>
      </Popover.Header>
      <Popover.Body dir={isRTL ? 'rtl' : 'ltr'}>
        <label>{t('builder.common.disabledLabel', { defaultValue: 'Désactiver :' })}</label>
        <Form.Switch
          size="lg"
          checked={disabledChk}
          onChange={(e) => setDisabledChk(!disabledChk)}
        />
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="left"
      overlay={popover}
      show={show}
      rootClose={true}
    >
      <input
        type="radio"
        ref={radioRef}
        readOnly
        className={`lst dami-radio-button ${disabledChk && "disabled"}`}
        onClick={clickHandler}
        
        name={name}
      />
    </OverlayTrigger>
  );
};

const ListOfRadiosButtons = ({ headerProps = null, bodyItems = [] }) => {
  const { t } = useTranslation();
  const [contentLines, setContentLines] = useState([
    { id: uuidv4(), isSection: false },
  ]);

  const addContentLinesHandler = () => {
    setContentLines([...contentLines, { id: uuidv4() }]);
  };

  const removeContentLinesHandler = (id) => {
    const updatedItems = contentLines.filter((item) => item.id !== id);
    setContentLines(updatedItems);
  };

  const addSectionHandler = () => {
    setContentLines([...contentLines, { id: uuidv4(), isSection: true }]);
  };

  useEffect(
    () => {
      if (bodyItems.length > 0) {
        setContentLines([]);
        let nItems = [];
        for (const item of bodyItems) {
          nItems.push({ labelProp: item, id: uuidv4() });
        }
        setContentLines(nItems);
      }
    },

    bodyItems
  );
  return (
    <>
      <table className="w-100">
        <thead className="lst-check-boxes-header">
          <tr>
            <td colSpan={100}>
              <Label
                className={`mr-2 ${
                  headerProps && headerProps.mainLabelProps.className
                }`}
                style={
                  headerProps &&
                  cssStringToObject(String(headerProps.mainLabelProps.style))
                }
                text={headerProps ? headerProps.mainLabelProps.text : t('builder.common.label', { defaultValue: 'label' })}
              />
            </td>
            <td>
              <Label
                className={`${
                  headerProps &&
                  headerProps.headerItems[0] &&
                  headerProps.headerItems[0].className
                }`}
                style={
                  headerProps &&
                  headerProps.headerItems[0] &&
                  cssStringToObject(String(headerProps.headerItems[0].style))
                }
                text={
                  headerProps && headerProps.headerItems[0]
                    ? headerProps.headerItems[0].text
                    : t('builder.common.label', { defaultValue: 'label' })
                }
              />
            </td>
            <td>
              <Label
                className={`${
                  headerProps &&
                  headerProps.headerItems[1] &&
                  headerProps.headerItems[1].className
                }`}
                style={
                  headerProps &&
                  headerProps.headerItems[1] &&
                  cssStringToObject(String(headerProps.headerItems[1].style))
                }
                text={headerProps && headerProps.headerItems[1]
                    ? headerProps.headerItems[1].text
                    : t('builder.common.label', { defaultValue: 'label' })}
              />
            </td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {contentLines.length > 0 &&
            contentLines.map((item) => (
              <tr
                key={item.id}
                className={`${
                  item.isSection || (item.labelProp && item.labelProp.isSection)
                    ? "line-section"
                    : ""
                }`}
              >
                <td colSpan={100}>
                  <Label
                    className={` ${item.labelProp && item.labelProp.className}`}
                    style={
                      item.labelProp && cssStringToObject(item.labelProp.style)
                    }
                    text={item.labelProp && item.labelProp.text}
                  />
                </td>
                <td>
                  {item.isSection ||
                    (item.labelProp && item.labelProp.isSection ? (
                      <></>
                    ) : (
                      <DamiRadioButton
                        name={`dami-radio-${item.id}`}
                        disabled={item.labelProp && item.labelProp.disableds[0]}
                      />
                    ))}
                </td>
                <td>
                  {item.isSection ||
                    (item.labelProp && item.labelProp.isSection ? (
                      <></>
                    ) : (
                      <DamiRadioButton
                        name={`dami-radio-${item.id}`}
                        disabled={item.labelProp && item.labelProp.disableds[1]}
                      />
                    ))}
                </td>

                <td colSpan={1}>
                  <span
                    className="btn-remove-checkbox-line"
                    onClick={() => removeContentLinesHandler(item.id)}
                  >
                    <i className="fas fa-times text-danger"></i>
                  </span>
                </td>
              </tr>
            ))}

          <tr>
            <td colSpan={1}>
              <span
                className="btn-add-checkbox-line"
                onClick={addContentLinesHandler}
              >
                <i className="fas fa-plus"></i>
              </span>
              <span
                className="btn-add-checkbox-line"
                onClick={addSectionHandler}
              >
                <i className="fa-regular fa-calendar-plus"></i>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ListOfRadiosButtons;

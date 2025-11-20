import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { v4 as uuidv4 } from "uuid";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import { cssStringToObject } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const DamiCheckBox = ({ disabled = false, labelProps }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguageSync();
  const id = uuidv4();
  const [show, setShow] = useState(false);
  const [disabledChk, setDisabledChk] = useState(disabled);
  const chkRef = useRef();
  const popoverRef = useRef();
  const popoverId = `popover-${id}`;

  const clickHandler = event => {
    event.preventDefault();
    setShow(!show);
  };

  useEffect(() => {
    const handleBodyClick = event => {
      const popover = document.querySelector(".popover");
      if (
        chkRef &&
        !chkRef.current.contains(event.target) &&
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
  }, [disabled]);

  const popover = (
    <Popover ref={popoverRef} id={popoverId}>
      <Popover.Header>
        <small>{t('builder.common.disabledTitle', { defaultValue: 'Désactiver ou non' })}</small>
      </Popover.Header>
      <Popover.Body dir={isRTL ? 'rtl' : 'ltr'}>
        <label>{t('builder.common.disabledLabel', { defaultValue: 'Désactiver :' })}</label>
        <Form.Switch
          size='lg'
          checked={disabledChk}
          onChange={e => setDisabledChk(!disabledChk)}
        />
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger='click'
      placement='left'
      overlay={popover}
      show={show}
      rootClose={true}>
      <input
        type='checkbox'
        ref={chkRef}
        readOnly
        className={`lst dami-check-box ${disabledChk && "disabled"} `}
        onClick={clickHandler}
        
      />
    </OverlayTrigger>
  );
};

const ListOfCheckBoxes = ({ headerProps = null, bodyItems = [] }) => {
  const { t } = useTranslation();
  const [headerLabels, setHeaderLabels] = useState([{ id: uuidv4() }]);
  const [contentLines, setContentLines] = useState([
    { id: uuidv4(), isSection: false },
  ]);

  const addHeaderLabelsHandler = () => {
    if (headerLabels.length < 4)
      setHeaderLabels([...headerLabels, { id: uuidv4() }]);
  };

  const addContentLinesHandler = () => {
    setContentLines([...contentLines, { id: uuidv4() }]);
  };

  const removeHeaderLabelsHandler = id => {
    const updatedItems = headerLabels.filter(item => item.id !== id);
    setHeaderLabels(updatedItems);
  };
  const removeContentLinesHandler = id => {
    const updatedItems = contentLines.filter(item => item.id !== id);
    setContentLines(updatedItems);
  };

  const addSectionHandler = () => {
    setContentLines([...contentLines, { id: uuidv4(), isSection: true }]);
  };
  useEffect(
    () => {
      if (headerProps) {
        setHeaderLabels([]);
        let nItems = [];
        for (const item of headerProps.headerItems) {
          nItems.push({ labelProp: item, id: uuidv4() });
        }
        setHeaderLabels(nItems);
      }

      if (bodyItems.length > 0) {
        setContentLines([]);
        let nItems = [];
        for (const item of bodyItems) {
          nItems.push({ labelProp: item, id: uuidv4() });
        }
        setContentLines(nItems);
      }
    },
    headerProps,
    bodyItems
  );
  return (
    <>
      <table className='w-100'>
        <thead className='lst-check-boxes-header'>
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
                text={headerProps ? headerProps.mainLabelProps.text : "label"}
              />
            </td>
            {headerLabels.length > 0 &&
              headerLabels.map(item => (
                <td key={item.id}>
                  <div>
                    <span
                      className='btn-remove-checkbox-label-header'
                      onClick={() => removeHeaderLabelsHandler(item.id)}>
                      <i className='fas fa-times text-danger'></i>
                    </span>
                    <Label
                      className={`${
                        item.labelProp && item.labelProp.className
                      }`}
                      style={
                        item.labelProp &&
                        cssStringToObject(item.labelProp.style)
                      }
                      text={item.labelProp ? item.labelProp.text : t('builder.common.label', { defaultValue: 'label' })}
                    />
                  </div>
                </td>
              ))}

            <td>
              <span
                className='btn-add-checkbox-label-header'
                onClick={addHeaderLabelsHandler}>
                <i className='fas fa-plus'></i>
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          {contentLines.length > 0 &&
            contentLines.map(item => (
              <tr
                key={item.id}
                className={`${
                  item.isSection || (item.labelProp && item.labelProp.isSection)
                    ? "line-section"
                    : ""
                }`}>
                <td colSpan={100}>
                  <Label
                    className={` ${item.labelProp && item.labelProp.className}`}
                    style={
                      item.labelProp && cssStringToObject(item.labelProp.style)
                    }
                    text={item.labelProp ? item.labelProp.text : t('builder.common.label', { defaultValue: 'label' })}
                  />
                </td>
                {item.isSection || (item.labelProp && item.labelProp.isSection)
                  ? headerLabels && headerLabels.map(headerItem => (
                      <td key={headerItem.id}></td>
                    ))
                  : headerLabels && headerLabels.map((headerItem, index) => (
                      <td key={headerItem.id}>
                        <DamiCheckBox
                          disabled={
                            item.labelProp && item.labelProp.disableds[index]
                          }
                          labelProps={item.labelProp}
                        />
                      </td>
                    ))}

                <td colSpan={1}>
                  <span
                    className='btn-remove-checkbox-line'
                    onClick={() => removeContentLinesHandler(item.id)}>
                    <i className='fas fa-times text-danger'></i>
                  </span>
                </td>
              </tr>
            ))}

          <tr>
            <td colSpan={1}>
              <span
                className='btn-add-checkbox-line'
                onClick={addContentLinesHandler}>
                <i className='fas fa-plus'></i>
              </span>
              <span
                className='btn-add-checkbox-line'
                onClick={addSectionHandler}>
                <i className='fa-regular fa-calendar-plus'></i>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ListOfCheckBoxes;

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
} from "react-bootstrap";
import {
  CheckBox,
  Line,
  Label,
  ListOfCheckBoxes,
  ListOfRadiosButtons,
  ListOfTextInput,
  RadioButtons,
  TextInput,
  Divider,
  SectionCondtion,
} from "../../components/DocumentComponents";
import { TextStyles } from "../../components/CreateDamiComponents";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Dami,
  Loader,
  Message,
  StepsProgress,
  TableLoading,
} from "../../components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDirections,
  getByServiceID,
  resetGetByServiceID,
} from "../../redux/direction/directionActions";
import {
  fetchServiceByID,
  fetchServices,
} from "../../redux/service/serviceActions";
import { fetchSousCategories } from "../../redux/sousCategorie/sousCategorieActions";
import { Toast, cssStringToObject } from "../../services";
import {
  createOptionCrtOp,
  fetchOptionByID,
  resetCreateOption,
  resetFetchOptionByID,
  resetUpdateOptionCrtOp,
  updateOptionCrtOp,
} from "../../redux/option/optionActions";

import { OPTION_LIST_REMOVE } from "../../redux/option/optionTypes";
import {
  fetchDepartementByID,
  fetchDepartements,
} from "../../redux/departement/departementActions";
import {
  fetchUsersByDivision,
  resetFetchUsersByDivision,
} from "../../redux/user/userActions";
import axios from "axios";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";
import ErrorBoundary from "../../components/ErrorBoundary";
import ArabicKeyboard from "../../components/ArabicKeyboard";
import UltimateErrorSuppressor from "../../components/UltimateErrorSuppressor";
import "../../styles/damiEdit.css";

const UICOMPONENTS = {
  label: <Label block />,
  textinput: <TextInput />,
  checkboxes: <CheckBox />,
  radiobuttons: <RadioButtons />,
  lsttextinput: <ListOfTextInput />,
  lstcheckboxes: <ListOfCheckBoxes />,
  lstradiobuttons: <ListOfRadiosButtons />,
  line: <Line />,
  divider: <Divider />,
};



const DamiEditPageCrtOp = () => {
  const { t, i18n } = useTranslation();
  const { isRTL, currentLanguage, autoSwitchToArabic } = useLanguageSync();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  
const validationHeaderSchema = Yup.object({
  libelle: Yup.string().required(
      t('damiEdit.form.validation.libelleRequired', { defaultValue: "il faut saisire une libelle (nom de l'option)" })
  ),
    typeProcessus: Yup.string().required(
      t('damiEdit.form.validation.typeProcessusRequired', { defaultValue: "il faut saisire le type de processsus" })
    ),
  document: Yup.string()
      .required(
        t('damiEdit.form.validation.documentRequired', { defaultValue: "il faut saisire le document" })
      )
    .matches(
      /^([A-Z]{3})\.([A-Z&]{0,2}[A-Z]|[0-9]{3})\.([0-9]{3})\.([A-Z])$/,
        t('damiEdit.form.validation.documentFormat', { defaultValue: "Le document doit être saisi sous cette forme, par exemple : 'ERT.LSI.001.A'" })
    ),
  classification: Yup.string().required(
      t('damiEdit.form.validation.classificationRequired', { defaultValue: "il faut saisire le type de classification" })
    ),
    creation: Yup.date().required(
      t('damiEdit.form.validation.creationDateRequired', { defaultValue: "il faut saisire la date de creation" })
    ),
    maj: Yup.date().required(
      t('damiEdit.form.validation.updateDateRequired', { defaultValue: "il faut saisire le date de mise a jour" })
    ),
});

const validationSousCategorieSchema = Yup.object({
    sousCategorie: Yup.string().required(
      t('damiEdit.form.validation.sousCategorieRequired', { defaultValue: "il faut enntrer une sous-categorie" })
    ),
  service: Yup.string(), 
  departement: Yup.string(),
  typePdd: Yup.string(),
  proprietaireDeDonnees: Yup.string(),
  typeAtr: Yup.string(),
  atr: Yup.string(),
});

  const [callOnce, setCallOnce] = useState(false);
  const [draggedItems, setDraggedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateOpModal, setShowCreateOpModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);

  
  useEffect(() => {
    setShowArabicKeyboard(false);
  }, [activeStep]);

  
  useEffect(() => {
    return () => {
      setShowArabicKeyboard(false);
    };
  }, []);

  
  const arabicKeys = useMemo(() => [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ], []);

  const insertArabicChar = useCallback((currentValue, setFieldValue, field, char) => {
    if (char === '⌫') {
      setFieldValue(field, currentValue.slice(0, -1));
    } else if (char === '␣') {
      setFieldValue(field, currentValue + ' ');
    } else {
      setFieldValue(field, currentValue + char);
    }
  }, []);
  const steps = useMemo(() => ([
    t('damiEdit.steps.header', { defaultValue: 'entête' }),
    t('damiEdit.steps.meta', { defaultValue: 'sous-categorie & service & proprietaire de donnees' }),
    t('damiEdit.steps.signatories', { defaultValue: 'signataires' }),
    t('damiEdit.steps.confirmation', { defaultValue: 'confirmation' }),
  ]), [i18n.language]);
  const [checkValues, setCheckValues] = useState({
    cds: false,
    cdd: false,
    hiq: true,
    atr: false,
    pdd: false,
    dir: true,
    dg: false,
    pdg: false,
    admin: false,
  });
  const [option, setOption] = useState(null);
  const [callOptionByIDOnce, setCallOptionByIDOnce] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  const [getUpdatedComponentsLoading, setGetUpdatedComponentsLoading] =
    useState(false);

  const [typePdd, setTypePdd] = useState("srv");
  const [typeAtr, setTypeAtr] = useState("srv");
  const [usersAtr, setUsersAtr] = useState([]);
  const [atrTitle, setAtrTitle] = useState("");

  const [headerInitialValues] = useState({
    libelle: "",
    typeProcessus: "",
    document: "",
    classification: "",
    creation: "",
    maj: "",
  });

  const [sousCategorieInitialValues] = useState({
    sousCategorie: "",
    departement:
      userInfo && userInfo.departement ? userInfo.departement._id : "",
    service: userInfo && userInfo.service ? userInfo.service._id : "",
    typePdd: "",
    proprietaireDeDonnees: "",
    autreUtilisateur: "",
    typeAtr: "",
  });

  const docRef = useRef(null);
  const viewResultDocRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    directions,
  } = directionList;

  const serviceList = useSelector((state) => state.serviceList);
  const {
    loading: loadingServiceList,
    error: errorServiceList,
    services,
  } = serviceList;

  const departementList = useSelector((state) => state.departementList);
  const {
    loading: loadingDepartementList,
    error: errordDepartementList,
    departements,
  } = departementList;

  const sousCategorieList = useSelector((state) => state.sousCategorieList);
  const {
    loading: loadingSousCategorieList,
    error: errorSousCategorieList,
    souscategories,
  } = sousCategorieList;

  const [shouldAskAnyTime, setShouldAskAnyTime] = useState(false);

  const directionByServiceID = useSelector(
    (state) => state.directionByServiceID
  );
  const {
    loading: loadingDirectionByServiceID,
    error: errorDirectionByServiceID,
    direction,
  } = directionByServiceID;

  const serviceByID = useSelector((state) => state.serviceByID);
  const {
    loading: loadingServiceByID,
    error: errorServiceByID,
    service,
  } = serviceByID;

  const departementByID = useSelector((state) => state.departementByID);
  const {
    loading: loadingDepartementByID,
    error: errorDepartementByID,
    departement,
  } = departementByID;

  const optionCrtOpCreate = useSelector((state) => state.optionCrtOpCreate);
  const {
    loading: loadingOptionCrtOpCreate,
    error: errorOptionCrtOpCreate,
    
    success: successOptionCrtOpCreate,
  } = optionCrtOpCreate;

  const optionByID = useSelector((state) => state.optionByID);
  const {
    loading: loadingOptionByID,
    error: errorOptionByID,
    option: recoveredOption,
    success: successOptionByID,
  } = optionByID;

  const optionCrtOpUpdate = useSelector((state) => state.optionCrtOpUpdate);
  const {
    loading: loadingoptionCrtOpUpdate,
    error: erroroptionCrtOpUpdate,
    
    success: successoptionCrtOpUpdate,
  } = optionCrtOpUpdate;

  const userByDivision = useSelector((state) => state.userByDivision);
  const {
    loading: loadingUserByDivision,
    error: errorUserByDivision,
    success: successUserByDivision,
    users,
  } = userByDivision;

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData("text/plain", item);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    try {
      const data = event.dataTransfer.getData("text/plain");

      if (data) {
        if (String(data) !== "divider") {
          const dividers = draggedItems.filter(
            (item) => String(item.type) === "divider"
          );
          const mouseY = event.clientY;
          const mouseX = event.clientX;
          if (dividers.length > 0) {
            for (const divider of dividers) {
              const uiElement = document.querySelector(
                `#comp-ui-${divider.id}`
              );
              const divs = uiElement.querySelectorAll(`.divider-child`);

              const div1 = divs[0];
              const div2 = divs[1];

              const div1Rect = div1.getBoundingClientRect();
              const div2Rect = div2.getBoundingClientRect();

              if (
                mouseY >= div1Rect.top &&
                mouseY <= div1Rect.bottom &&
                mouseX >= div1Rect.left &&
                mouseX <= div1Rect.right
              ) {
                
                let nDraggedItems = draggedItems && draggedItems.map((item) => {
                  if (String(item.id) === String(divider.id)) {
                    item.children1.push({
                      id: uuidv4(),
                      component: UICOMPONENTS[data],
                      type: data,
                    });
                  }
                  return item;
                });

                setDraggedItems(nDraggedItems);
                div1.style.backgroundColor = "#fff";
              } else if (
                mouseY >= div2Rect.top &&
                mouseY <= div2Rect.bottom &&
                mouseX >= div2Rect.left &&
                mouseX <= div2Rect.right
              ) {
                
                let nDraggedItems = draggedItems && draggedItems.map((item) => {
                  if (String(item.id) === String(divider.id)) {
                    item.children2.push({
                      id: uuidv4(),
                      component: UICOMPONENTS[data],
                      type: data,
                    });
                  }
                  return item;
                });

                setDraggedItems(nDraggedItems);
                div2.style.backgroundColor = "#fff";
              } else {
                if (UICOMPONENTS[data]) {
                  setDraggedItems((prevItems) => [
                    ...prevItems,
                    {
                      id: uuidv4(),
                      component: UICOMPONENTS[data],
                      type: data,
                      children1: [],
                      children2: [],
                    },
                  ]);
                }
              }
            }
          } else {
            if (UICOMPONENTS[data]) {
              setDraggedItems((prevItems) => [
                ...prevItems,
                {
                  id: uuidv4(),
                  component: UICOMPONENTS[data],
                  type: data,
                  children1: [],
                  children2: [],
                },
              ]);
            }
          }
        } else {
          if (UICOMPONENTS[data]) {
            setDraggedItems((prevItems) => [
              ...prevItems,
              {
                id: uuidv4(),
                component: UICOMPONENTS[data],
                type: data,
                children1: [],
                children2: [],
              },
            ]);
          }
        }
      }
    } catch (error) {
      Toast.open({
        type: "danger",
        message: {
          title: "notifications.error",
          message: "notifications.dropComponentError"
        }
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrag = (event) => {
    const dividers = draggedItems.filter(
      (item) => String(item.type) === "divider"
    );

    const mouseY = event.clientY;
    const mouseX = event.clientX;

    if (dividers.length > 0) {
      for (const divider of dividers) {
        const uiElement = document.querySelector(`#comp-ui-${divider.id}`);
        const divs = uiElement.querySelectorAll(`.divider-child`);

        const div1 = divs[0];
        const div2 = divs[1];

        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();

        if (
          mouseY >= div1Rect.top &&
          mouseY <= div1Rect.bottom &&
          mouseX >= div1Rect.left &&
          mouseX <= div1Rect.right
        ) {
          div1.style.backgroundColor = "#f4f4f4";
        } else {
          div1.style.backgroundColor = "#fff";
        }

        if (
          mouseY >= div2Rect.top &&
          mouseY <= div2Rect.bottom &&
          mouseX >= div2Rect.left &&
          mouseX <= div2Rect.right
        ) {
          div2.style.backgroundColor = "#f4f4f4";
        } else {
          div2.style.backgroundColor = "#fff";
        }
      }
    }
  };

  const removeBtnsAndLayoutsHandler = (el) => {
    try {
      el.querySelectorAll(".divider .btn-remove-divider-children").forEach(
        (element) => {
          element.remove();
        }
      );
      el.querySelectorAll(".divider div").forEach((element) => {
        element.style.borderRight = "none";
      });
      el.querySelectorAll(".btn-add-chk").forEach((element) => {
        element.remove();
      });
      el.querySelectorAll(".btn-remove-chk").forEach((element) => {
        element.remove();
      });
      el.querySelectorAll(".btn-remove-component").forEach((element) => {
        element.remove();
      });
      el.querySelectorAll(".btn-remove-checkbox-label-header").forEach(
        (element) => {
          element.remove();
        }
      );
      el.querySelectorAll(".btn-add-checkbox-label-header").forEach(
        (element) => {
          element.remove();
        }
      );
      el.querySelectorAll(".btn-remove-checkbox-line").forEach((element) => {
        element.remove();
      });
      el.querySelectorAll(".btn-add-checkbox-line").forEach((element) => {
        element.remove();
      });
    } catch (error) {
      Toast.open({
        type: "danger",
        message: {
          title: "notifications.error",
          message: "notifications.removeLayoutError"
        }
      });
    }
  };

  const removeBtnsAndLayouts = () => {
    removeBtnsAndLayoutsHandler(viewResultDocRef.current);
  };

  const openModalHandler = () => {
    setShowModal(true);
    setHtmlContent(docRef.current.innerHTML);
    setTimeout(removeBtnsAndLayouts, 100);
  };

  const removeComponentHandler = (id) => {
    const nItems = draggedItems.filter(
      (item) => String(item.id) !== String(id)
    );
    setDraggedItems(nItems);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updatedItems = [...draggedItems];
    const [reorderedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, reorderedItem);

    setDraggedItems(updatedItems);
  };

  const removeChild1Handler = (idDivider, idChild1) => {
    const updatedItems = [];
    for (const item of draggedItems) {
      if (item.type === "divider" && String(item.id) === String(idDivider)) {
        const updatedChildren1 = item.children1.filter(
          (ch) => String(ch.id) !== String(idChild1)
        );
        updatedItems.push({
          ...item,
          children1: updatedChildren1,
          component: {
            ...item.component,
            props: {
              ...item.component.props,
              children1: updatedChildren1,
            },
          },
        });
      } else {
        updatedItems.push(item);
      }
    }

    setDraggedItems(updatedItems);
  };

  const removeChild2Handler = (idDivider, idChild2) => {
    const updatedItems = [];
    for (const item of draggedItems) {
      if (item.type === "divider" && String(item.id) === String(idDivider)) {
        const updatedChildren2 = item.children2.filter(
          (ch) => String(ch.id) !== String(idChild2)
        );
        updatedItems.push({
          ...item,
          children2: updatedChildren2,
          component: {
            ...item.component,
            props: {
              ...item.component.props,
              children2: updatedChildren2,
            },
          },
        });
      } else {
        updatedItems.push(item);
      }
    }

    setDraggedItems(updatedItems);
  };

  
  const showCreateOptionModalHandler = () => {
    if (docRef.current.querySelector("div").innerHTML !== "") {
      setShowCreateOpModal(true);
    } else {
      Toast.open({
        type: "danger",
        message: {
          title: "notifications.error",
          message: "notifications.fillContentError"
        }
      });
    }
  };

  const goBackStepsHandler = () => {
    console.log('goBackStepsHandler called, current activeStep:', activeStep);
    if (activeStep > 0) {
      const newStep = activeStep - 1;
      console.log('Setting activeStep to:', newStep);
      setActiveStep(newStep);
    } else {
      console.log('Cannot go back, already at step 0');
    }
  };

  const headerForm = useFormik({
    initialValues: headerInitialValues,
    validationSchema: validationHeaderSchema,
    onSubmit: (values) => {
      const {
        libelle,
        typeProcessus,
        document,
        classification,
        creation,
        maj,
      } = values;

      const contenu = docRef.current.innerHTML;
      const obj = {
        libelle,
        typeProcessus,
        contenu,
        header: {
          document,
          classification,
          creation,
          maj,
        },
      };

      setOption(obj);
      setActiveStep(1);
    },
  });

  const sousCategorieForm = useFormik({
    initialValues: sousCategorieInitialValues,
    validationSchema: validationSousCategorieSchema,
    onSubmit: (values) => {
      dispatch(resetGetByServiceID());
      setOption({
        ...option,
        ...values,
        
        service: values.service || (userInfo && userInfo.service ? userInfo.service._id : null),
      });

      
      if (values.service && values.service.trim() !== '') {
      dispatch(fetchServiceByID(values.service));
      }

      
      if (values.departement && values.departement.trim() !== '') {
        dispatch(fetchDepartementByID(values.departement));
      }

      setActiveStep(2);
    },
  });

  const putSignatairesHandler = () => {
    setActiveStep(3);
    let signataires = [];
    const elSig = document.querySelectorAll(".check-signataire");

    for (const check of elSig) {
      if (check.firstChild.checked) {
        signataires.push(check.firstChild.getAttribute("id"));
      }
    }

    setOption({
      ...option,
      signataires: signataires,
      dirLibelle: direction && direction.libelle ? direction.libelle : "",
      autreResponsableTitre: atrTitle,
    });

    setHtmlContent(docRef.current.innerHTML);
  };

  const sigChangeHandler = (event) => {
    let nbr = 0;

    document.querySelectorAll(".check-signataire").forEach((check) => {
      if (check.firstChild.checked) {
        nbr++;
      }
    });

    if (nbr === 6) {
      event.target.checked = false;
    } else {
      const key = event.target.getAttribute("id");
      let obj = { ...checkValues };
      obj[key] = event.target.checked;
      setCheckValues(obj);
    }
  };

  const closeCreateOptionModalHandler = () => {
    setActiveStep(0);
    if (!isUpdateForm) {
      headerForm.resetForm();
      sousCategorieForm.resetForm();
      setCheckValues({
        cds: false,
        cdd: false,
        hiq: true,
        atr: false,
        pdd: false,
        dir: true,
        dg: false,
        pdg: false,
      });
    }
    setShowCreateOpModal(false);
  };

  const addOptionHandler = () => {
    console.log(option);
    dispatch(createOptionCrtOp({...option,shouldAskAnyTime:shouldAskAnyTime}));
  };

  const modifierOptionHandler = () => {
    if (isUpdateForm) {
      
      dispatch(updateOptionCrtOp(id, {...option,shouldAskAnyTime:shouldAskAnyTime}));
    }
  };

  
  
  
  
  
  

  
  

  
  
  

  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  

  const getUpdatedComponent = (recoveredOption) => {
    try {
      setGetUpdatedComponentsLoading(true);
      const div = document.createElement("div");
      div.innerHTML = recoveredOption.contenu;
      let nDraggedItems = [];
      let elements = div.querySelectorAll(".comp-ui");
      for (const el of elements) {
        if (el.classList.contains("type-label")) {
          const label = el.querySelector(".dami-label");
          let obj = {
            id: uuidv4(),
            component: (
              <Label
                block
                text={label.innerText}
                className={label.className}
                style={cssStringToObject(label.getAttribute("style"))}
              />
            ),
            type: "label",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-checkboxes")) {
          const mainLabel = el.querySelector(".dami-label:first-child");
          const checkboxes = el.querySelectorAll(
            ".dami-check-box-container div"
          );

          const checkboxItems = [];

          for (const checkbox of checkboxes) {
            checkboxItems.push({
              text: checkbox.querySelector(".dami-label").innerText,
              className: checkbox.querySelector(".dami-label").className,
              style: checkbox
                .querySelector(".dami-label")
                .getAttribute("style"),
            });
          }
          const mainLabelProps = {
            className: mainLabel.className,
            style: mainLabel.getAttribute("style"),
            text: mainLabel.innerText,
          };

          let obj = {
            id: uuidv4(),
            component: (
              <CheckBox
                mainLabelProps={mainLabelProps}
                checkboxItems={checkboxItems}
              />
            ),
            type: "checkboxes",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-textinput")) {
          const mainLabel = el.querySelector(".dami-label:first-child");
          const textInput = el.querySelector(".dami-input");

          const mainLabelProps = {
            className: mainLabel.className,
            style: mainLabel.getAttribute("style"),
            text: mainLabel.innerText,
          };
          let style = textInput.getAttribute("style");
          let fontsize = style
            ? style.split("font-size:")[1].split("px")[0]
            : 12;
          const textInputProp = {
            type: textInput.getAttribute("type"),
            block: textInput.classList.contains("block"),
            placeholder: textInput.getAttribute("placeholder"),
            size: Number(fontsize),
            min: textInput.getAttribute("min"),
            max: textInput.getAttribute("max"),
            value: textInput.value,
          };

          let obj = {
            id: uuidv4(),
            component: (
              <TextInput
                mainLabelProps={mainLabelProps}
                textInputProp={textInputProp}
              />
            ),
            type: "textinput",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-radiobuttons")) {
          const mainLabel = el.querySelector(".dami-label:first-child");
          const radiobuttons = el.querySelectorAll(
            ".dami-radio-button-container div"
          );

          const radioButtonItems = [];

          for (const radiobutton of radiobuttons) {
            radioButtonItems.push({
              text: radiobutton.querySelector(".dami-label").innerText,
              className: radiobutton.querySelector(".dami-label").className,
              style: radiobutton
                .querySelector(".dami-label")
                .getAttribute("style"),
            });
          }
          const mainLabelProps = {
            className: mainLabel.className,
            style: mainLabel.getAttribute("style"),
            text: mainLabel.innerText,
          };

          let obj = {
            id: uuidv4(),
            component: (
              <RadioButtons
                mainLabelProps={mainLabelProps}
                radioButtonItems={radioButtonItems}
              />
            ),
            type: "checkboxes",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-lsttextinput")) {
          const lstinputs = el.querySelector(".lst-of-text-input");
          const firstLine = lstinputs.querySelector(".dami-textarea-line");
          const mainLabel = el.querySelector(".dami-label:first-child");
          const mainLabelProps = {
            className: mainLabel.className,
            style: mainLabel.getAttribute("style"),
            text: mainLabel.innerText,
          };

          const style = firstLine.getAttribute("style");
          const size = style ? style.split("font-size:")[1].split("px")[0] : 12;
          const placeholder = firstLine.getAttribute("placeholder");

          const lineProps = {
            nbrLines: lstinputs.querySelectorAll(".dami-textarea-line").length,
            size: Number(size),
            placeholder: placeholder ? firstLine.placeholder : "",
          };
          let obj = {
            id: uuidv4(),
            component: (
              <ListOfTextInput
                mainLabelProps={mainLabelProps}
                isBlock={lstinputs.classList.contains("block")}
                lineProps={lineProps}
              />
            ),
            type: "lsttextinput",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-lstcheckboxes")) {
          const header = el.querySelector(".lst-check-boxes-header");
          const mainLabel = header.querySelector(".dami-label");
          const headerElements = header.querySelectorAll("td div");
          const body = el.querySelector("tbody");
          const lines = body.querySelectorAll("tr");

          const filteredlines = Array.from(lines).filter((row) => {
            return !row.querySelector(".btn-add-checkbox-line");
          });

          const headerItems = [];
          const bodyItems = [];

          for (const item of headerElements) {
            headerItems.push({
              className: item.querySelector(".dami-label").className,
              style: item.querySelector(".dami-label").getAttribute("style"),
              text: item.querySelector(".dami-label").innerText,
            });
          }

          for (const item of filteredlines) {
            const lineLabel = item.querySelector("td .dami-label");
            const chks = item.querySelectorAll(".dami-check-box");

            let disableds = [];

            for (const item of chks) {
              disableds.push(item.classList.contains("disabled"));
            }

            bodyItems.push({
              className: lineLabel && lineLabel.className,
              style: lineLabel && lineLabel.getAttribute("style"),
              text: lineLabel && lineLabel.innerText,
              isSection: item.classList.contains("line-section"),
              disableds: disableds,
            });
          }

          const headerProps = {
            mainLabelProps: {
              className: mainLabel.className,
              style: mainLabel.getAttribute("style"),
              text: mainLabel.innerText,
            },
            headerItems: headerItems,
          };

          let obj = {
            id: uuidv4(),
            component: (
              <ListOfCheckBoxes
                headerProps={headerProps}
                bodyItems={bodyItems}
              />
            ),
            type: "lstcheckboxes",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-lstradiobuttons")) {
          const header = el.querySelector(".lst-check-boxes-header");
          const mainLabel = header.querySelector(
            "td[colspan='100'] .dami-label"
          );
          const headerElements = header.querySelectorAll(
            "td:not([colspan]) .dami-label"
          );
          const body = el.querySelector("tbody");
          const lines = body.querySelectorAll("tr");

          const filteredlines = Array.from(lines).filter((row) => {
            return !row.querySelector(".btn-add-checkbox-line");
          });

          const headerItems = [];
          const bodyItems = [];

          for (const item of headerElements) {
            headerItems.push({
              className: item.className,
              style: item.getAttribute("style"),
              text: item.innerText,
            });
          }

          for (const item of filteredlines) {
            const lineLabel = item.querySelector("td .dami-label");
            const chks = item.querySelectorAll(".dami-radio-button");
            let disableds = [];

            for (const item of chks) {
              disableds.push(item.classList.contains("disabled"));
            }
            bodyItems.push({
              className: lineLabel && lineLabel.className,
              style: lineLabel && lineLabel.getAttribute("style"),
              text: lineLabel && lineLabel.innerText,
              isSection: item.classList.contains("line-section"),
              disableds: disableds,
            });
          }

          const headerProps = {
            mainLabelProps: {
              className: mainLabel.className,
              style: mainLabel.getAttribute("style"),
              text: mainLabel.innerText,
            },
            headerItems: headerItems,
          };

          let obj = {
            id: uuidv4(),
            component: (
              <ListOfRadiosButtons
                headerProps={headerProps}
                bodyItems={bodyItems}
              />
            ),
            type: "lstradiobuttons",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-line")) {
          let obj = {
            id: uuidv4(),
            component: <Line />,
            type: "line",
            children1: [],
            children2: [],
          };
          nDraggedItems.push(obj);
        } else if (el.classList.contains("type-divider")) {
          const divider = el.querySelector(".divider");
          const children1 = [];
          const children2 = [];

          let elChildren1 = divider.querySelectorAll(
            ".divider-child:first-child > div"
          );

          for (const el of elChildren1) {
            console.log(el);
            if (el.querySelector(".child-type-label")) {
              const label = el.querySelector(".dami-label");
              let obj = {
                id: uuidv4(),
                component: (
                  <Label
                    block
                    text={label.innerText}
                    className={label.className}
                    style={cssStringToObject(label.getAttribute("style"))}
                  />
                ),
                type: "label",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-checkboxes")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const checkboxes = el.querySelectorAll(
                ".dami-check-box-container div"
              );

              const checkboxItems = [];

              for (const checkbox of checkboxes) {
                checkboxItems.push({
                  text: checkbox.querySelector(".dami-label").innerText,
                  className: checkbox.querySelector(".dami-label").className,
                  style: checkbox
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                });
              }
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <CheckBox
                    mainLabelProps={mainLabelProps}
                    checkboxItems={checkboxItems}
                  />
                ),
                type: "checkboxes",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-textinput")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const textInput = el.querySelector(".dami-input");

              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };
              let style = textInput.getAttribute("style");
              let fontsize = style
                ? style.split("font-size:")[1].split("px")[0]
                : 12;
              const textInputProp = {
                type: textInput.getAttribute("type"),
                block: textInput.classList.contains("block"),
                placeholder: textInput.getAttribute("placeholder"),

                size: Number(fontsize),
                min: textInput.getAttribute("min"),
                max: textInput.getAttribute("max"),
                value: textInput.value,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <TextInput
                    mainLabelProps={mainLabelProps}
                    textInputProp={textInputProp}
                  />
                ),
                type: "textinput",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-radiobuttons")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const radiobuttons = el.querySelectorAll(
                ".dami-radio-button-container div"
              );

              const radioButtonItems = [];

              for (const radiobutton of radiobuttons) {
                radioButtonItems.push({
                  text: radiobutton.querySelector(".dami-label").innerText,
                  className: radiobutton.querySelector(".dami-label").className,
                  style: radiobutton
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                });
              }
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <RadioButtons
                    mainLabelProps={mainLabelProps}
                    radioButtonItems={radioButtonItems}
                  />
                ),
                type: "checkboxes",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-lsttextinput")) {
              const lstinputs = el.querySelector(".lst-of-text-input");
              const firstLine = lstinputs.querySelector(".dami-textarea-line");
              const mainLabel = el.querySelector(".dami-label:first-child");
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              const style = firstLine.getAttribute("style");
              const size = style
                ? style.split("font-size:")[1].split("px")[0]
                : 12;
              const placeholder = firstLine.getAttribute("placeholder");

              const lineProps = {
                nbrLines: lstinputs.querySelectorAll(".dami-textarea-line")
                  .length,
                size: Number(size),
                placeholder: placeholder ? firstLine.placeholder : "",
              };
              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfTextInput
                    mainLabelProps={mainLabelProps}
                    isBlock={lstinputs.classList.contains("block")}
                    lineProps={lineProps}
                  />
                ),
                type: "lsttextinput",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-lstcheckboxes")) {
              const header = el.querySelector(".lst-check-boxes-header");
              const mainLabel = header.querySelector(".dami-label");
              const headerElements = header.querySelectorAll("td div");
              const body = el.querySelector("tbody");
              const lines = body.querySelectorAll("tr");

              const filteredlines = Array.from(lines).filter((row) => {
                return !row.querySelector(".btn-add-checkbox-line");
              });

              const headerItems = [];
              const bodyItems = [];

              for (const item of headerElements) {
                headerItems.push({
                  className: item.querySelector(".dami-label").className,
                  style: item
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                  text: item.querySelector(".dami-label").innerText,
                });
              }

              for (const item of filteredlines) {
                const lineLabel = item.querySelector("td .dami-label");
                const chks = item.querySelectorAll(".dami-check-box");

                let disableds = [];

                for (const item of chks) {
                  disableds.push(item.classList.contains("disabled"));
                }

                bodyItems.push({
                  className: lineLabel && lineLabel.className,
                  style: lineLabel && lineLabel.getAttribute("style"),
                  text: lineLabel && lineLabel.innerText,
                  isSection: item.classList.contains("line-section"),
                  disableds: disableds,
                });
              }

              const headerProps = {
                mainLabelProps: {
                  className: mainLabel.className,
                  style: mainLabel.getAttribute("style"),
                  text: mainLabel.innerText,
                },
                headerItems: headerItems,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfCheckBoxes
                    headerProps={headerProps}
                    bodyItems={bodyItems}
                  />
                ),
                type: "lstcheckboxes",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-lstradiobuttons")) {
              const header = el.querySelector(".lst-check-boxes-header");
              const mainLabel = header.querySelector(
                "td[colspan='100'] .dami-label"
              );
              const headerElements = header.querySelectorAll(
                "td:not([colspan]) .dami-label"
              );
              const body = el.querySelector("tbody");
              const lines = body.querySelectorAll("tr");

              const filteredlines = Array.from(lines).filter((row) => {
                return !row.querySelector(".btn-add-checkbox-line");
              });

              const headerItems = [];
              const bodyItems = [];

              for (const item of headerElements) {
                headerItems.push({
                  className: item.className,
                  style: item.getAttribute("style"),
                  text: item.innerText,
                });
              }

              for (const item of filteredlines) {
                const lineLabel = item.querySelector("td .dami-label");
                const chks = item.querySelectorAll(".dami-radio-button");
                let disableds = [];

                for (const item of chks) {
                  disableds.push(item.classList.contains("disabled"));
                }
                bodyItems.push({
                  className: lineLabel && lineLabel.className,
                  style: lineLabel && lineLabel.getAttribute("style"),
                  text: lineLabel && lineLabel.innerText,
                  isSection: item.classList.contains("line-section"),
                  disableds: disableds,
                });
              }

              const headerProps = {
                mainLabelProps: {
                  className: mainLabel.className,
                  style: mainLabel.getAttribute("style"),
                  text: mainLabel.innerText,
                },
                headerItems: headerItems,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfRadiosButtons
                    headerProps={headerProps}
                    bodyItems={bodyItems}
                  />
                ),
                type: "lstradiobuttons",
              };
              children1.push(obj);
            } else if (el.querySelector(".child-type-line")) {
              let obj = {
                id: uuidv4(),
                component: <Line />,
                type: "line",
              };
              children1.push(obj);
            }
          }

          let elChildren2 = divider.querySelectorAll(
            ".divider-child:last-child > div"
          );

          for (const el of elChildren2) {
            if (el.querySelector(".child-type-label")) {
              const label = el.querySelector(".dami-label");
              let obj = {
                id: uuidv4(),
                component: (
                  <Label
                    block
                    text={label.innerText}
                    className={label.className}
                    style={cssStringToObject(label.getAttribute("style"))}
                  />
                ),
                type: "label",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-checkboxes")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const checkboxes = el.querySelectorAll(
                ".dami-check-box-container div"
              );

              const checkboxItems = [];

              for (const checkbox of checkboxes) {
                checkboxItems.push({
                  text: checkbox.querySelector(".dami-label").innerText,
                  className: checkbox.querySelector(".dami-label").className,
                  style: checkbox
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                });
              }
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <CheckBox
                    mainLabelProps={mainLabelProps}
                    checkboxItems={checkboxItems}
                  />
                ),
                type: "checkboxes",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-textinput")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const textInput = el.querySelector(".dami-input");

              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };
              let style = textInput.getAttribute("style");
              let fontsize = style
                ? style.split("font-size:")[1].split("px")[0]
                : 12;
              const textInputProp = {
                type: textInput.getAttribute("type"),
                block: textInput.classList.contains("block"),
                placeholder: textInput.getAttribute("placeholder"),
                size: Number(fontsize),
                min: textInput.getAttribute("min"),
                max: textInput.getAttribute("max"),
                value: textInput.value,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <TextInput
                    mainLabelProps={mainLabelProps}
                    textInputProp={textInputProp}
                  />
                ),
                type: "textinput",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-radiobuttons")) {
              const mainLabel = el.querySelector(".dami-label:first-child");
              const radiobuttons = el.querySelectorAll(
                ".dami-radio-button-container div"
              );

              const radioButtonItems = [];

              for (const radiobutton of radiobuttons) {
                radioButtonItems.push({
                  text: radiobutton.querySelector(".dami-label").innerText,
                  className: radiobutton.querySelector(".dami-label").className,
                  style: radiobutton
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                });
              }
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <RadioButtons
                    mainLabelProps={mainLabelProps}
                    radioButtonItems={radioButtonItems}
                  />
                ),
                type: "checkboxes",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-lsttextinput")) {
              const lstinputs = el.querySelector(".lst-of-text-input");
              const firstLine = lstinputs.querySelector(".dami-textarea-line");
              const mainLabel = el.querySelector(".dami-label:first-child");
              const mainLabelProps = {
                className: mainLabel.className,
                style: mainLabel.getAttribute("style"),
                text: mainLabel.innerText,
              };

              const style = firstLine.getAttribute("style");
              const size = style
                ? style.split("font-size:")[1].split("px")[0]
                : 12;
              const placeholder = firstLine.getAttribute("placeholder");

              const lineProps = {
                nbrLines: lstinputs.querySelectorAll(".dami-textarea-line")
                  .length,
                size: Number(size),
                placeholder: placeholder ? firstLine.placeholder : "",
              };
              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfTextInput
                    mainLabelProps={mainLabelProps}
                    isBlock={lstinputs.classList.contains("block")}
                    lineProps={lineProps}
                  />
                ),
                type: "lsttextinput",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-lstcheckboxes")) {
              const header = el.querySelector(".lst-check-boxes-header");
              const mainLabel = header.querySelector(".dami-label");
              const headerElements = header.querySelectorAll("td div");
              const body = el.querySelector("tbody");
              const lines = body.querySelectorAll("tr");

              const filteredlines = Array.from(lines).filter((row) => {
                return !row.querySelector(".btn-add-checkbox-line");
              });

              const headerItems = [];
              const bodyItems = [];

              for (const item of headerElements) {
                headerItems.push({
                  className: item.querySelector(".dami-label").className,
                  style: item
                    .querySelector(".dami-label")
                    .getAttribute("style"),
                  text: item.querySelector(".dami-label").innerText,
                });
              }

              for (const item of filteredlines) {
                const lineLabel = item.querySelector("td .dami-label");
                const chks = item.querySelectorAll(".dami-check-box");

                let disableds = [];

                for (const item of chks) {
                  disableds.push(item.classList.contains("disabled"));
                }

                bodyItems.push({
                  className: lineLabel && lineLabel.className,
                  style: lineLabel && lineLabel.getAttribute("style"),
                  text: lineLabel && lineLabel.innerText,
                  isSection: item.classList.contains("line-section"),
                  disableds: disableds,
                });
              }

              const headerProps = {
                mainLabelProps: {
                  className: mainLabel.className,
                  style: mainLabel.getAttribute("style"),
                  text: mainLabel.innerText,
                },
                headerItems: headerItems,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfCheckBoxes
                    headerProps={headerProps}
                    bodyItems={bodyItems}
                  />
                ),
                type: "lstcheckboxes",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-lstradiobuttons")) {
              const header = el.querySelector(".lst-check-boxes-header");
              const mainLabel = header.querySelector(
                "td[colspan='100'] .dami-label"
              );
              const headerElements = header.querySelectorAll(
                "td:not([colspan]) .dami-label"
              );
              const body = el.querySelector("tbody");
              const lines = body.querySelectorAll("tr");

              const filteredlines = Array.from(lines).filter((row) => {
                return !row.querySelector(".btn-add-checkbox-line");
              });

              const headerItems = [];
              const bodyItems = [];

              for (const item of headerElements) {
                headerItems.push({
                  className: item.className,
                  style: item.getAttribute("style"),
                  text: item.innerText,
                });
              }

              for (const item of filteredlines) {
                const lineLabel = item.querySelector("td .dami-label");
                const chks = item.querySelectorAll(".dami-radio-button");
                let disableds = [];

                for (const item of chks) {
                  disableds.push(item.classList.contains("disabled"));
                }
                bodyItems.push({
                  className: lineLabel && lineLabel.className,
                  style: lineLabel && lineLabel.getAttribute("style"),
                  text: lineLabel && lineLabel.innerText,
                  isSection: item.classList.contains("line-section"),
                  disableds: disableds,
                });
              }

              const headerProps = {
                mainLabelProps: {
                  className: mainLabel.className,
                  style: mainLabel.getAttribute("style"),
                  text: mainLabel.innerText,
                },
                headerItems: headerItems,
              };

              let obj = {
                id: uuidv4(),
                component: (
                  <ListOfRadiosButtons
                    headerProps={headerProps}
                    bodyItems={bodyItems}
                  />
                ),
                type: "lstradiobuttons",
              };
              children2.push(obj);
            } else if (el.querySelector(".child-type-line")) {
              let obj = {
                id: uuidv4(),
                component: <Line />,
                type: "line",
              };
              children2.push(obj);
            }
          }

          console.log(children1, children2);

          let obj = {
            id: uuidv4(),
            component: <Divider />,
            type: "divider",
            children1: children1,
            children2: children2,
            removeChild1: removeChild1Handler,
            removeChild2: removeChild2Handler,
          };
          nDraggedItems.push(obj);
        }
      }

      setDraggedItems(nDraggedItems);
      setGetUpdatedComponentsLoading(false);
    } catch (error) {
      Toast.open({
        type: "danger",
        message: {
          title: "notifications.error",
          message: "notifications.getUpdatedComponentError"
        }
      });
    }
  };

  const saveContentWorkHandler = () => {
    try {
      if (
        docRef &&
        docRef.current &&
        docRef.current.querySelector("div") &&
        docRef.current.querySelector("div").innerHTML !== "" &&
        String(currentPath.split("/")[1].split("/")[0]) !== "modifier-option"
      ) {
        let options = localStorage.getItem("options")
          ? JSON.parse(localStorage.getItem("options"))
          : null;

        if (options) {
          if (id) {
            let savedOption = options.find(
              (op) => String(op._id) === String(id)
            );
            if (savedOption) {
              options = options && options.map((option) => {
                if (option._id === id) {
                  option.contenu =
                    docRef &&
                    docRef.current &&
                    docRef.current.querySelector("div") &&
                    docRef.current.querySelector("div").innerHTML !== ""
                      ? docRef.current.querySelector("div").innerHTML
                      : "";
                  option.updatedAt = new Date();
                }
                return option;
              });
            }
          } else {
            const savedOption = {
              _id: uuidv4(),
              libelle: "(pas encore enregistré)",
              typeProcessus: "(pas encore enregistré)",
              sousCategorie: { libelle: "(pas encore enregistré)" },
              proprietaireDeDonnees: { libelle: "(pas encore enregistré)" },
              service: { libelle: "(pas encore enregistré)" },
              notSavedYet: true,
              contenu:
                docRef &&
                docRef.current &&
                docRef.current.querySelector("div") &&
                docRef.current.querySelector("div").innerHTML !== ""
                  ? docRef.current.querySelector("div").innerHTML
                  : "",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            options.push(savedOption);
          }
        } else {
          const savedOption = {
            _id: uuidv4(),
            libelle: "(pas encore enregistré)",
            typeProcessus: "(pas encore enregistré)",
            sousCategorie: { libelle: "(pas encore enregistré)" },
            proprietaireDeDonnees: { libelle: "(pas encore enregistré)" },
            service: { libelle: "(pas encore enregistré)" },
            notSavedYet: true,
            contenu:
              docRef &&
              docRef.current &&
              docRef.current.querySelector("div") &&
              docRef.current.querySelector("div").innerHTML !== ""
                ? docRef.current.querySelector("div").innerHTML
                : "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          options = [savedOption];
        }

        localStorage.setItem("options", JSON.stringify(options));
        console.log("##### [ options saved in local ] #####");
      }
    } catch (error) {
      Toast.open({
        type: "danger",
        message: {
          title: "notifications.error",
          message: "notifications.saveContentError"
        }
      });
    }
  };

  const getUserArt = async () => {
    if (userInfo) {
      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/utilisateurs/${typeAtr}/division/${sousCategorieForm.values.typeAtr}`,
        config
      );

      setUsersAtr(data);
    }
  };

  useEffect(() => {
    console.log("##### [use effect from DAMI EDIT PAGE] #####");

    if (!callOnce) {
      dispatch(fetchDirections());
      dispatch(fetchSousCategories());
      dispatch(fetchServices());
      dispatch(fetchDepartements());
      dispatch(resetFetchOptionByID());
      setCallOnce(true);
      
      
      if (!id) {
        autoSwitchToArabic();
      }
    }

    if (option && option.service) {
      
      if (option.service.trim() !== '') {
      dispatch(getByServiceID(option.service));
      }
      
      
      if (option.departement && option.departement.trim() !== '') {
        dispatch(fetchDepartementByID(option.departement));
      }
    }
    if (successOptionCrtOpCreate) {
      setDraggedItems([]);
      dispatch(resetCreateOption());
      docRef.current.innerHTML = "";
      closeCreateOptionModalHandler();
      setOption(null);
      if (id) {
        let stoptions = localStorage.getItem("options")
          ? JSON.parse(localStorage.getItem("options"))
          : null;
        if (stoptions) {
          stoptions = stoptions.filter((op) => String(op._id) !== String(id));
          localStorage.setItem("options", JSON.stringify(stoptions));
          dispatch({ type: OPTION_LIST_REMOVE, payload: id });
        }
      }
      Toast.open({
        type: "success",
        message: {
          title: "notifications.optionCreated",
          message: "notifications.optionCreatedMessage"
        }
      });
    }

    if (successOptionByID && recoveredOption) {
      getUpdatedComponent(recoveredOption);
      setIsUpdateForm(true);

      const hasCreation = recoveredOption && recoveredOption.header && recoveredOption.header.creation;
      const dateCreationString = hasCreation ? new Date(
        recoveredOption.header.creation
      ).toLocaleDateString() : null;
      let formattedCreationDate = "";
      if (dateCreationString) {
        const dateCreationArray = dateCreationString.split("/");
        const cryear = dateCreationArray[2];
        const crmonth = dateCreationArray[0];
        const crday = dateCreationArray[1];
        formattedCreationDate = cryear + "-" + crday + "-" + crmonth;
      }

      const hasMaj = recoveredOption && recoveredOption.header && recoveredOption.header.maj;
      const dateUpdateString = hasMaj ? new Date(
        recoveredOption.header.maj
      ).toLocaleDateString() : null;
      let formattedMajDate = "";
      if (dateUpdateString) {
        const dateMajArray = dateUpdateString.split("/");
        const mjyear = dateMajArray[2];
        const mjmonth = dateMajArray[0];
        const mjday = dateMajArray[1];
        formattedMajDate = mjyear + "-" + mjday + "-" + mjmonth;
      }

      let cds = false;
      let cdd = false;
      let hiq = false;
      let atr = false;
      let pdd = false;
      let dir = false;
      let dg = false;
      let pdg = false;
      let admin = false;

      const signatairesList = Array.isArray(recoveredOption && recoveredOption.signataires)
        ? recoveredOption.signataires
        : [];

      for (const item of signatairesList) {
        if (String(item) === "cds") cds = true;
        if (String(item) === "cdd") cdd = true;
        if (String(item) === "hiq") hiq = true;
        if (String(item) === "atr") atr = true;
        if (String(item) === "pdd") pdd = true;
        if (String(item) === "dir") dir = true;
        if (String(item) === "dg") dg = true;
        if (String(item) === "pdg") pdg = true;
        if (String(item) === "admin") admin = true;
      }

      setCheckValues({
        cds,
        cdd,
        hiq,
        atr,
        pdd,
        dir,
        dg,
        pdg,
        admin,
      });
      setTypePdd("dir");
      setTypeAtr("dir");
      headerForm.setValues({
        libelle: recoveredOption.libelle,
        typeProcessus: recoveredOption.typeProcessus,
        document: recoveredOption.header.document,
        classification: recoveredOption.header.classification.toLowerCase(),
        creation: formattedCreationDate,
        maj: formattedMajDate,
      });
      getUserArt();
      setAtrTitle(
        recoveredOption.autreResponsableTitre
          ? recoveredOption.autreResponsableTitre
          : ""
      );
      setShouldAskAnyTime(recoveredOption.shouldAskAnyTime);
      if (recoveredOption && recoveredOption.proprietaireDeDonnees)
        dispatch(
          fetchUsersByDivision(
            "dir",
            recoveredOption.proprietaireDeDonnees.direction
          )
        );
      setTimeout(() => {
        sousCategorieForm.setValues({
          sousCategorie:
            recoveredOption && recoveredOption.sousCategorie
              ? recoveredOption.sousCategorie
              : "",
          departement: recoveredOption.departement,
          service: recoveredOption.service,
          typePdd:
            recoveredOption && recoveredOption.proprietaireDeDonnees
              ? recoveredOption.proprietaireDeDonnees.direction
              : "",
          proprietaireDeDonnees: recoveredOption.proprietaireDeDonnees
            ? recoveredOption.proprietaireDeDonnees._id
            : "",
          typeAtr: recoveredOption.autreUtilisateur
            ? recoveredOption.autreUtilisateur.direction
            : "",
          autreUtilisateur: recoveredOption.autreUtilisateur
            ? recoveredOption.autreUtilisateur._id
            : "",
        });
      }, 1000);
    }

    if (successoptionCrtOpUpdate) {
      dispatch(resetUpdateOptionCrtOp());
      setActiveStep(0);
      setShowCreateOpModal(false);
      Toast.open({
        type: "success",
        message: {
          title: "notifications.optionUpdated",
          message: "notifications.optionUpdatedMessage"
        }
      });
    }

    return () => {
      dispatch(resetFetchOptionByID());
    };
  }, [
    callOnce,
    dispatch,
    option,
    successOptionCrtOpCreate,
    id,
    successOptionByID,
    recoveredOption,
    isUpdateForm,
    successoptionCrtOpUpdate,
  ]);

  useEffect(() => {
    console.log("##### [use effect from DAMI EDIT PAGE] #####");
    if (!callOptionByIDOnce) {
      if (id) {
        if (
          String(currentPath.split("/")[1].split("/")[0]) === "modifier-option"
        ) {
          if (!loadingOptionByID) {
            console.log("##### [call option by id] #####");
            dispatch(resetFetchOptionByID());
            dispatch(fetchOptionByID(id));
            
          }
        } else {
          let options = localStorage.getItem("options")
            ? JSON.parse(localStorage.getItem("options"))
            : null;

          if (options && options.length > 0) {
            if (docRef && docRef.current) {
              let option = options.find((op) => String(op._id) === String(id));
              if (option) {
                const obj = { contenu: option.contenu };
                getUpdatedComponent(obj);
                
              }
            }
          }
        }
      }
      setCallOptionByIDOnce(true);
    }
  }, [callOptionByIDOnce, currentPath]);

  useEffect(() => {
    let isAlreadySaved = false;
    console.log("##### [use effect from DAMI EDIT PAGE] #####");
    console.log("is alreadey saved value :", isAlreadySaved);
    if (String(currentPath.split("/")[1].split("/")[0]) !== "modifier-option") {
      document.querySelectorAll("a").forEach((element) => {
        element.addEventListener("click", () => {
          if (!isAlreadySaved) {
            saveContentWorkHandler();
            isAlreadySaved = true;
          }
        });
      });
    }
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      if (!isAlreadySaved) {
        saveContentWorkHandler();
        isAlreadySaved = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
    };
  }, [currentPath, option]);
  useEffect(() => {
    if (userInfo && sousCategorieForm.values.typeAtr) {
      getUserArt();
    }
  }, [sousCategorieForm.values.typeAtr]);
  useEffect(() => {
    if (sousCategorieForm.values.typePdd) {
      dispatch(fetchUsersByDivision(typePdd, sousCategorieForm.values.typePdd));
    }
  }, [sousCategorieForm.values.typePdd]);

  return (
    <UltimateErrorSuppressor>
      <ErrorBoundary>
        <div className="dami-edit-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {}

      <Modal
        show={showModal}
        fullscreen={true}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">{t('damiEdit.form.validation.voireContenu', { defaultValue: 'Voire le contenu de dami' })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {draggedItems.length === 0 && (
            <Alert variant="warning">
              <i className="fas fa-exclamation-circle mt-1"></i> {t('damiEdit.form.validation.pasEncoreRempli', { defaultValue: 'vous n\'avez pas encore rempli le document' })}
            </Alert>
          )}
          <Row>
            <Col xl={2} lg={2} md={12} sm={12}></Col>
            <Col xl={8} lg={8} md={12} sm={12}>
              <div
                ref={viewResultDocRef}
                className={`p-2 ${draggedItems.length !== 0 && "border"}`}
                dangerouslySetInnerHTML={{
                  __html: htmlContent,
                }}
              ></div>
            </Col>
            <Col xl={2} lg={2} md={12} sm={12}></Col>
          </Row>
        </Modal.Body>
      </Modal>
      {}

      {}
      <Modal
        show={showCreateOpModal}
        centered
        fullscreen={true}
        size="xl"
        onHide={closeCreateOptionModalHandler}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">{t('sidebar.createur.createOption', 'Créer une option')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StepsProgress activeStep={activeStep} steps={steps} />
          <hr />
          {errorDirectionList && (
            <Message itWillBeHidden={true} type="danger">
              {errorDirectionList}
            </Message>
          )}
          {errorServiceList && (
            <Message itWillBeHidden={true} type="danger">
              {errorServiceList}
            </Message>
          )}
          {errorSousCategorieList && (
            <Message itWillBeHidden={true} type="danger">
              {errorSousCategorieList}
            </Message>
          )}
          {errorDirectionByServiceID && (
            <Message itWillBeHidden={true} type="danger">
              {errorDirectionByServiceID}
            </Message>
          )}
          {errordDepartementList && (
            <Message itWillBeHidden={true} type="danger">
              {errordDepartementList}
            </Message>
          )}
          {errorOptionCrtOpCreate && (
            <Message type="danger" itWillBeHidden={true}>
              {errorOptionCrtOpCreate}
            </Message>
          )}

          {errorDepartementByID && (
            <Message type="danger" itWillBeHidden={true}>
              {errorDepartementByID}
            </Message>
          )}

          {errorServiceByID && (
            <Message type="danger" itWillBeHidden={true}>
              {errorServiceByID}
            </Message>
          )}

          {erroroptionCrtOpUpdate && (
            <Message type="danger" itWillBeHidden={true}>
              {erroroptionCrtOpUpdate}
            </Message>
          )}

          {errorUserByDivision && (
            <Message itWillBeHidden type="danger">
              {errorUserByDivision}
            </Message>
          )}
          <div className="dami-nav-container">
            {activeStep > 0 && (
            <Button
                type="button"
                className="dami-edit-btn dami-edit-btn-light dami-nav-btn"
              onClick={goBackStepsHandler}
            >
                <i className={`fas ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t('damiEdit.form.validation.retour', { defaultValue: 'retour' })}
            </Button>
            )}
            {}
          </div>

          {activeStep === 0 ? (
            <Card className="dami-edit-card dami-fade-in">
              <Card.Header>
                <h5 className="mb-0">{t('damiEdit.steps.header', { defaultValue: 'entête' })}</h5>
              </Card.Header>
              <Card.Body>
                <Form className="dami-edit-form" onSubmit={headerForm.handleSubmit}>
                  <label className="form-label">
                    <small className="text-danger mt-3">*</small> {t('damiEdit.form.libelle', { defaultValue: 'libelle' })}:
              </label>
              <div className="position-relative">
              <Form.Control
                  placeholder={t('damiEdit.form.libellePlaceholder', { defaultValue: 'Exp: access SI, demande material x ...' })}
                name="libelle"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.libelle}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{
                    paddingRight: '12px',
                    paddingLeft: '12px'
                  }}
                />
                {}
                {}
              </div>
              {}
              {}
              {headerForm.touched.libelle && headerForm.errors.libelle && (
                <small className="text-danger d-block">
                  {headerForm.errors.libelle}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small> {t('damiEdit.form.typeProcessus', { defaultValue: 'Type de processsus' })}:
              </label>
              <Form.Control
                placeholder={t('damiEdit.form.typeProcessusPlaceholder', { defaultValue: 'Exp: livraison des services x ...' })}
                name="typeProcessus"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.typeProcessus}
                dir={isRTL ? 'rtl' : 'ltr'}
              />{" "}
              {headerForm.touched.typeProcessus &&
                headerForm.errors.typeProcessus && (
                  <small className="text-danger d-block">
                    {headerForm.errors.typeProcessus}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                {t('damiEdit.form.document', { defaultValue: 'document' })}:
              </label>
              <Form.Control
                placeholder={t('damiEdit.form.documentPlaceholder', { defaultValue: 'Exp: AAA.BBB.000.X ...' })}
                name="document"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.document}
                dir={isRTL ? 'rtl' : 'ltr'}
              />{" "}
              {headerForm.touched.document && headerForm.errors.document && (
                <small className="text-danger d-block">
                  {headerForm.errors.document}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small>
                {t('damiEdit.form.classification', { defaultValue: 'classification' })}:
              </label>
              <Form.Select
                className="mb-3"
                name="classification"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.classification}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="">
                  {t('damiEdit.form.classificationPlaceholder', { defaultValue: '---- veuillez choisire le type de classification ----' })}
                </option>
                <option value="interne">{t('damiEdit.form.classificationInterne', { defaultValue: 'Interne' })}</option>
                <option value="externe">{t('damiEdit.form.classificationExterne', { defaultValue: 'Externe' })}</option>
              </Form.Select>{" "}
              {headerForm.touched.classification &&
                headerForm.errors.classification && (
                  <small className="text-danger d-block">
                    {headerForm.errors.classification}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                {t('damiEdit.form.creation', { defaultValue: 'creation' })} :
              </label>
              <Form.Control
                type="date"
                name="creation"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.creation}
                dir={isRTL ? 'rtl' : 'ltr'}
              />{" "}
              {headerForm.touched.creation && headerForm.errors.creation && (
                <small className="text-danger d-block">
                  {headerForm.errors.creation}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small>
                {t('damiEdit.form.miseAJour', { defaultValue: 'Mise a jour' })} :
              </label>
              <Form.Control
                type="date"
                name="maj"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.maj}
                dir={isRTL ? 'rtl' : 'ltr'}
              />{" "}
              {headerForm.touched.maj && headerForm.errors.maj && (
                <small className="text-danger d-block">
                  {headerForm.errors.maj}
                </small>
              )}
              <Button className="dami-edit-btn dami-edit-btn-primary w-100 mt-3" type="submit">
                {t('damiEdit.form.continue', { defaultValue: 'continue' })} <i className={`fas ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
              </Button>
            </Form>
              </Card.Body>
            </Card>
          ) : activeStep === 1 ? (
            <Card className="dami-edit-card dami-fade-in">
              <Card.Header>
                <h5 className="mb-0">{t('damiEdit.steps.meta', { defaultValue: 'sous-categorie & service & proprietaire de donnees' })}</h5>
              </Card.Header>
              <Card.Body>
                <Form className="dami-edit-form" onSubmit={sousCategorieForm.handleSubmit}>
                  <label className="form-label">
                    <small className="text-danger mt-3">*</small>{t('damiEdit.form.sousCategorie', { defaultValue: 'sous-categorie' })} :
              </label>
              <Form.Select
                className="mb-3"
                name="sousCategorie"
                disabled={loadingSousCategorieList}
                onChange={sousCategorieForm.handleChange}
                onBlur={sousCategorieForm.handleBlur}
                value={sousCategorieForm.values.sousCategorie}
              >
                <option value="">
                  ---- veuillez choisire une categorie ----
                </option>
                {souscategories.length > 0 &&
                  souscategories.map((sousCategorie) => (
                    <option key={sousCategorie._id} value={sousCategorie._id}>
                      {sousCategorie.libelle}
                    </option>
                  ))}
              </Form.Select>{" "}
              {sousCategorieForm.touched.sousCategorie &&
                sousCategorieForm.errors.sousCategorie && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.sousCategorie}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                departement :
              </label>
              <Form.Select
                className="mb-3"
                name="departement"
                disabled={loadingDepartementList}
                onChange={sousCategorieForm.handleChange}
                onBlur={sousCategorieForm.handleBlur}
                value={sousCategorieForm.values.departement}
              >
                <option value="">
                  ---- veuillez choisire un deparatement ----
                </option>
                {departements.length > 0 &&
                  departements.map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.libelle}
                    </option>
                  ))}
              </Form.Select>{" "}
              {sousCategorieForm.touched.departement &&
                sousCategorieForm.errors.departement && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.deparatement}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                service :
              </label>
              <Form.Select
                className="mb-3"
                name="service"
                disabled={loadingServiceList}
                onChange={sousCategorieForm.handleChange}
                onBlur={sousCategorieForm.handleBlur}
                value={sousCategorieForm.values.service}
              >
                <option value="">---- veuillez choisire un service ----</option>
                {services.length > 0 &&
                  services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.libelle}
                    </option>
                  ))}
              </Form.Select>{" "}
              {sousCategorieForm.touched.service &&
                sousCategorieForm.errors.service && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.service}
                  </small>
                )}
              <div>
                <label>
                  autre responsable de cette option (autre signataire)
                </label>
                <div className="d-flex align-items-center">
                  <Form.Check
                    name="ftlAtr"
                    className="mr-1"
                    type="radio"
                    checked={typeAtr === "srv"}
                    onChange={() => {
                      setUsersAtr([]);
                      setTypeAtr("srv");
                    }}
                    label="filtrer par service"
                  />
                  <Form.Check
                    name="ftlAtr"
                    className="mr-1"
                    type="radio"
                    checked={typeAtr === "dep"}
                    value={typeAtr}
                    onChange={() => {
                      setUsersAtr([]);
                      setTypeAtr("dep");
                    }}
                    label="filtrer par departement"
                  />

                  <Form.Check
                    name="ftlAtr"
                    className="mr-1"
                    type="radio"
                    checked={typeAtr === "dir"}
                    value={typeAtr}
                    onChange={() => {
                      setUsersAtr([]);
                      setTypeAtr("dir");
                    }}
                    label="filtrer par direction"
                  />
                </div>
                {typeAtr === "srv" ? (
                  <Form.Select
                    className="mb-3"
                    name="typeAtr"
                    onChange={sousCategorieForm.handleChange}
                    onBlur={sousCategorieForm.handleBlur}
                    value={sousCategorieForm.values.typeAtr}
                    disabled={loadingServiceList}
                  >
                    <option value="">
                      ---- veuillez choisire un service ----
                    </option>
                    {services.length > 0 &&
                      services.map((srv) => (
                        <option key={srv._id} value={srv._id}>
                          {srv.libelle}
                        </option>
                      ))}
                  </Form.Select>
                ) : typeAtr === "dep" ? (
                  <Form.Select
                    className="mb-3"
                    name="typeAtr"
                    onChange={sousCategorieForm.handleChange}
                    onBlur={sousCategorieForm.handleBlur}
                    value={sousCategorieForm.values.typeAtr}
                    disabled={loadingDepartementList}
                  >
                    <option value="">
                      ---- veuillez choisire un departement ----
                    </option>
                    {departements.length > 0 &&
                      departements.map((dep) => (
                        <option key={dep._id} value={dep._id}>
                          {dep.libelle}
                        </option>
                      ))}
                  </Form.Select>
                ) : (
                  <Form.Select
                    className="mb-3"
                    name="typeAtr"
                    onChange={sousCategorieForm.handleChange}
                    onBlur={sousCategorieForm.handleBlur}
                    value={sousCategorieForm.values.typeAtr}
                    disabled={loadingDirectionList}
                  >
                    <option value="">
                      ---- veuillez choisire une direction ----
                    </option>
                    {directions.length > 0 &&
                      directions.map((direction) => (
                        <option key={direction._id} value={direction._id}>
                          {direction.libelle}
                        </option>
                      ))}
                  </Form.Select>
                )}
                {sousCategorieForm.touched.typeAtr &&
                  sousCategorieForm.errors.typeAtr && (
                    <small className="text-danger d-block">
                      {sousCategorieForm.errors.typeAtr}
                    </small>
                  )}

                <Form.Select
                  name="autreUtilisateur"
                  disabled={loadingUserByDivision}
                  value={sousCategorieForm.values.autreUtilisateur}
                  onChange={sousCategorieForm.handleChange}
                  onBlur={sousCategorieForm.handleBlur}
                >
                  <option value="">
                    ----- choisire un responsable (autre signataire) -----
                  </option>
                  {usersAtr &&
                    Array.from(usersAtr).length > 0 &&
                    Array.from(usersAtr).map((user) => (
                      <option value={user._id}>
                        {user.prenom} {user.nom}
                      </option>
                    ))}
                </Form.Select>
                {sousCategorieForm.touched.autreUtilisateur &&
                  sousCategorieForm.errors.autreUtilisateur && (
                    <small className="text-danger d-block">
                      {sousCategorieForm.errors.autreUtilisateur}
                    </small>
                  )}
              </div>
              <label>{t('damiEdit.form.proprietaireDeDonnees', { defaultValue: 'proprietaire de donnees' })} : </label>
                <div className={`d-flex align-items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Form.Check
                  name="fltPdd"
                  className={isRTL ? "ml-1" : "mr-1"}
                  type="radio"
                  checked={typePdd === "srv"}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("srv");
                  }}
                  label={t('damiEdit.form.filtrerParService', { defaultValue: 'filtrer par service' })}
                />
                <Form.Check
                  name="fltPdd"
                  className={isRTL ? "ml-1" : "mr-1"}
                  type="radio"
                  checked={typePdd === "dep"}
                  value={typePdd}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("dep");
                  }}
                  label={t('damiEdit.form.filtrerParDepartement', { defaultValue: 'filtrer par departement' })}
                />
                <Form.Check
                  name="fltPdd"
                  className={isRTL ? "ml-1" : "mr-1"}
                  type="radio"
                  checked={typePdd === "dir"}
                  value={typePdd}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("dir");
                  }}
                  label={t('damiEdit.form.filtrerParDirection', { defaultValue: 'filtrer par direction' })}
                />
              </div>
              {typePdd === "srv" ? (
                <Form.Select
                  className="mb-3"
                  name="typePdd"
                  onChange={sousCategorieForm.handleChange}
                  onBlur={sousCategorieForm.handleBlur}
                  value={sousCategorieForm.values.typePdd}
                  disabled={loadingServiceList}
                >
                  <option value="">
                    ---- veuillez choisire un service ----
                  </option>
                  {services.length > 0 &&
                    services.map((srv) => (
                      <option key={srv._id} value={srv._id}>
                        {srv.libelle}
                      </option>
                    ))}
                </Form.Select>
              ) : typePdd === "dep" ? (
                <Form.Select
                  className="mb-3"
                  name="typePdd"
                  onChange={sousCategorieForm.handleChange}
                  onBlur={sousCategorieForm.handleBlur}
                  value={sousCategorieForm.values.typePdd}
                  disabled={loadingDepartementList}
                >
                  <option value="">
                    ---- veuillez choisire un departement ----
                  </option>
                  {departements.length > 0 &&
                    departements.map((dep) => (
                      <option key={dep._id} value={dep._id}>
                        {dep.libelle}
                      </option>
                    ))}
                </Form.Select>
              ) : (
                <Form.Select
                  className="mb-3"
                  name="typePdd"
                  onChange={sousCategorieForm.handleChange}
                  onBlur={sousCategorieForm.handleBlur}
                  value={sousCategorieForm.values.typePdd}
                  disabled={loadingDirectionList}
                >
                  <option value="">
                    ---- veuillez choisire une direction ----
                  </option>
                  {directions.length > 0 &&
                    directions.map((direction) => (
                      <option key={direction._id} value={direction._id}>
                        {direction.libelle}
                      </option>
                    ))}
                </Form.Select>
              )}
              {sousCategorieForm.touched.typePdd &&
                sousCategorieForm.errors.typePdd && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.typePdd}
                  </small>
                )}
              <Form.Select
                name="proprietaireDeDonnees"
                disabled={loadingUserByDivision}
                value={sousCategorieForm.values.proprietaireDeDonnees}
                onChange={sousCategorieForm.handleChange}
                onBlur={sousCategorieForm.handleBlur}
              >
                <option value="">
                  ----- {t('damiEdit.form.choisirProprietaireDeDonnees', { defaultValue: 'choisire un proprietaire de donnees' })} -----
                </option>
                {users.length > 0 &&
                  users.map((user) => (
                    <option value={user._id}>
                      {user.prenom} {user.nom}
                    </option>
                  ))}
              </Form.Select>
              {sousCategorieForm.touched.proprietaireDeDonnees &&
                sousCategorieForm.errors.proprietaireDeDonnees && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.proprietaireDeDonnees}
                  </small>
                )}
              <Button className="dami-edit-btn dami-edit-btn-primary w-100 mt-3" type="submit">
                {t('damiEdit.form.continue', { defaultValue: 'continue' })} <i className={`fas ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
              </Button>
            </Form>
              </Card.Body>
            </Card>
          ) : activeStep === 2 ? (
            <Card className="dami-edit-card dami-fade-in">
              <Card.Header>
                <h5 className="mb-0">{t('damiEdit.steps.signatories', { defaultValue: 'signataires' })}</h5>
              </Card.Header>
              <Card.Body>
                <div className="dami-signatories-container" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="d-flex justify-content-center mb-3">
                    <h4 className="text-primary">{t('damiEdit.form.signataires', { defaultValue: 'les signataires de cette option' })}</h4>
              </div>
                <div className="dami-message info">
                  <i className="fas fa-info-circle me-2"></i>
                  {t('damiEdit.form.signatairesInfo', { defaultValue: 'Pour choisir qui va signer dans cette option, il faut cocher la case à cocher' })}
                </div>
                <div className="dami-message warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {t('damiEdit.form.signatairesWarning', { defaultValue: 'Le nombre maximum de signataires autorisés est de 5.' })}
                </div>
              <div className="px-1 py-4 mb-3 h-100">
                <div style={{ height: "450px" }}>
                  {(loadingDirectionByServiceID ||
                    loadingServiceByID ||
                    loadingDepartementByID) && <Loader />}
                  {direction && service && (
                    <>
                      <div className="w-100 py-2">
                        <Form.Check
                          id="cds"
                          value={checkValues["cds"]}
                          label={`Chef de service `}
                          className="check-signataire"
                          onChange={sigChangeHandler}
                          checked={checkValues["cds"]}
                        />
                      </div>
                      <div className="w-100 py-2">
                        <Form.Check
                          id="cdd"
                          value={checkValues["cdd"]}
                          label={`Chef de departement `}
                          className="check-signataire"
                          onChange={sigChangeHandler}
                          checked={checkValues["cdd"]}
                        />
                      </div>
                      <div className="w-100 py-2 ">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="hiq"
                          value={checkValues["hiq"]}
                          checked={checkValues["hiq"]}
                          label="Directeur hiarchique"
                          className="d-block mr-2 check-signataire"
                        />

                        <small className="d-block text-warning">
                          <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                          Directeur hiérarchique doit signer toutes les demandes
                        </small>
                      </div>

                      <div className="w-100 py-2">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="pdd"
                          value={checkValues["pdd"]}
                          checked={checkValues["pdd"]}
                          label="proprietaire de donnees"
                          className="d-block mr-2 check-signataire"
                        />
                      </div>

                      <div className="w-100 py-2">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="atr"
                          value={checkValues["atr"]}
                          checked={checkValues["atr"]}
                          label="Autre"
                          className="d-block mr-2 check-signataire"
                        />

                        <div className="w-50">
                          <Form.Control
                            placeholder="veuillez saisir l'intitulé de signataire"
                            value={atrTitle}
                            onChange={(e) => setAtrTitle(e.target.value)}
                            disabled={
                              !sousCategorieForm.values.autreUtilisateur ||
                              !checkValues["atr"]
                            }
                          />
                        </div>
                      </div>
                      <div className="w-100 py-2">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="dir"
                          value={checkValues["dir"]}
                          checked={checkValues["dir"]}
                          label={`Directeur de ${String(
                            direction.libelle
                          ).toLowerCase()}`}
                          className="d-block mr-2 check-signataire"
                        />

                        <small className="d-block text-warning">
                          <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                          {t('damiEdit.form.directeurDirectionWarning', { 
                            defaultValue: `Le directeur de la direction ${String(direction.libelle).toLowerCase()} doit obligatoirement signer dans cette option.`,
                            direction: String(direction.libelle).toLowerCase()
                          })}
                        </small>
                      </div>
                      <div className="w-100 py-2 d-block">
                        <div className="d-flex align-items-center">
                          <Form.Check
                            onChange={sigChangeHandler}
                            id="dg"
                            value={checkValues["dg"]}
                            checked={checkValues["dg"]}
                            label="directeur général"
                            className="d-block mr-2 check-signataire"
                          />
                        </div>
                      </div>
                      <div className="w-100 py-2 d-block">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="pdg"
                          value={checkValues["pdg"]}
                          checked={checkValues["pdg"]}
                          label="président directeur général"
                          className="d-block mr-2 check-signataire"
                        />
                      </div>
                      <div className="w-100 py-2 d-block">
                        <Form.Check
                          onChange={sigChangeHandler}
                          id="admin"
                          value={checkValues["admin"]}
                          checked={checkValues["admin"]}
                          label="Administrateur"
                          className="d-block mr-2 check-signataire"
                        />
                        <small className="d-block text-info">
                          <i className="fa-solid fa-info-circle"></i>{" "}
                          L'administrateur peut traiter toutes les demandes
                        </small>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  className="dami-edit-btn dami-edit-btn-primary w-100 mb-5"
                  onClick={putSignatairesHandler}
                >
                  {t('damiEdit.form.continue', { defaultValue: 'continue' })} <i className={`fas ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                </Button>
              </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <>
              {loadingOptionCrtOpCreate && <Loader />}
              {loadingoptionCrtOpUpdate && <Loader />}
              <Message type="info">
                Voici l'option (DAMI) telle qu'elle sera présentée. Si vous avez
                quelque chose à changer, retournez et modifiez avant de
                confirmer
              </Message>

              <Row>
                <Col xl={2} lg={12} md={12} sm={12}></Col>
                <Col xl={8} lg={12} md={12} sm={12}>
                  <div className="d-block">
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="La DAMI peut-elle être demandée plusieurs fois par un seul demandeur ?"
                      value={shouldAskAnyTime}
                      checked={shouldAskAnyTime}
                      onChange={() => setShouldAskAnyTime(!shouldAskAnyTime)}
                    />
                  </div>

                  <Dami option={option} showAdmin />
                </Col>
                <Col xl={2} lg={12} md={12} sm={12}></Col>
              </Row>

              {isUpdateForm ? (
                <Button
                  className="dami-edit-btn dami-edit-btn-primary w-100"
                  onClick={modifierOptionHandler}
                >
                  {t('damiEdit.form.validation.modifier', { defaultValue: 'Modifier' })}
                </Button>
              ) : (
                <Button
                  className="dami-edit-btn dami-edit-btn-primary w-100"
                  onClick={addOptionHandler}
                >
                  {t('damiEdit.form.validation.ajouter', { defaultValue: 'Ajouter' })}
                </Button>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {errorOptionByID && (
        <Message itWillBeHidden={true} type="danger">
          {errorOptionByID}
        </Message>
      )}

      {/* End Modal Create option */}
      {/* Enhanced Header Section with Visible Icons and Buttons */}
      <Card className="border-0 shadow-sm mb-2">
        <Card.Body className="py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{ gap: 12 }}>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center"
                style={{ 
                  gap: 6, 
                  padding: '6px 16px',
                  border: '1px solid #6c757d',
                  backgroundColor: '#fff',
                  color: '#6c757d',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#6c757d';
                }}
          onClick={() => {
            setIsUpdateForm(false);
            setCallOptionByIDOnce(false);
            dispatch(resetFetchOptionByID());
                  navigate('/createur/options');
                }}
              >
                <i className={`fas ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'}`} style={{ fontSize: '12px', color: '#6c757d' }}></i>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{t('common.back', { defaultValue: 'retour' })}</span>
              </button>
              <div className="vr" style={{ height: '24px', opacity: 0.3 }}></div>
              <div>
                <h5 className="mb-0" style={{ 
                  color: '#2c3e50', 
                  fontWeight: 700, 
                  fontSize: '18px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {isUpdateForm ? t('damiEdit.editTitle', { defaultValue: 'Modifier l\'option (DAMI)' }) : t('damiEdit.createTitle', { defaultValue: 'Créer une option (DAMI)' })}
                </h5>
              </div>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={openModalHandler} 
              size="sm"
              className="d-flex align-items-center"
              style={{ 
                gap: 6, 
                padding: '6px 16px',
                border: '1px solid #007bff',
                backgroundColor: '#fff',
                color: '#007bff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#007bff';
              }}
            >
              <i className="fa-solid fa-maximize" style={{ fontSize: '12px' }}></i>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{t('builder.buttons.view', { defaultValue: 'voir' })}</span>
        </Button>
      </div>
        </Card.Body>
      </Card>

      <Row className="doc-row">
        <Col xl={12} lg={12} md={12} sm={12}></Col>
        <Col xl={9} lg={9} md={12} sm={12}>
          {/* Compact Form Builder Area */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-0" style={{ 
                    color: '#2c3e50', 
                    fontWeight: 700, 
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <i className="fas fa-tools me-2" style={{ color: '#007bff', fontSize: '16px' }}></i>
                    {t('builder.canvas.title', { defaultValue: 'Zone de construction' })}
                  </h6>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <TextStyles />
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-3">
          <div
            ref={docRef}
            className="doc"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
                style={{
                  minHeight: '400px',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
          >
            {loadingOptionByID && <TableLoading />}
            {getUpdatedComponentsLoading && <TableLoading />}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {draggedItems && draggedItems.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div
                              className={`position-relative comp-ui type-${item.type}`}
                              id={`comp-ui-${item.id}`}
                            >
                              {React.createElement(item.component.type, {
                                ...item.component.props,
                                children1: item.children1,
                                children2: item.children2,
                                id: item.id,
                                removeChild1: removeChild1Handler,
                                removeChild2: removeChild2Handler,
                              })}

                              <span
                                className="btn-remove-component"
                                onClick={() => removeComponentHandler(item.id)}
                              >
                                <i className="fas fa-times text-danger"></i>
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={3} md={12} sm={12}>
          <div className="sticky-top" style={{ top: '20px' }}>
            {/* Basic Components */}
            <Card className="border-0 shadow-sm mb-2">
              <Card.Header className="bg-dark text-white py-2">
                <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8, fontSize: '14px', fontWeight: '600' }}>
                  <i className="fas fa-puzzle-piece" style={{ fontSize: '14px' }}></i>
                  <span>{t('builder.sections.basic', { defaultValue: 'Composants de base' })}</span>
                </h6>
              </Card.Header>
              <Card.Body className="p-1">
                <div className="d-grid gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "label", draggedItems.length)}
                  >
                    <i className="fas fa-tag" style={{ fontSize: '14px', color: '#007bff' }}></i>
                    <span>{t('builder.components.label', { defaultValue: 'Label' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "textinput", draggedItems.length)}
                  >
                    <i className="fas fa-keyboard" style={{ fontSize: '14px', color: '#17a2b8' }}></i>
                    <span>{t('builder.components.textinput', { defaultValue: 'Zone de text' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "checkboxes", draggedItems.length)}
                  >
                    <i className="fas fa-check-square" style={{ fontSize: '14px', color: '#28a745' }}></i>
                    <span>{t('builder.components.checkboxes', { defaultValue: 'Case à cocher' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "radiobuttons", draggedItems.length)}
                  >
                    <i className="fas fa-dot-circle" style={{ fontSize: '14px', color: '#ffc107' }}></i>
                    <span>{t('builder.components.radiobuttons', { defaultValue: 'Bouton radio' })}</span>
                  </Button>
                </div>
              </Card.Body>
          </Card>

            {/* List Components */}
            <Card className="border-0 shadow-sm mb-2">
              <Card.Header className="bg-dark text-white py-2">
                <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8, fontSize: '14px', fontWeight: '600' }}>
                  <i className="fas fa-list" style={{ fontSize: '14px' }}></i>
                  <span>{t('builder.sections.lists', { defaultValue: 'Composants de liste' })}</span>
                </h6>
              </Card.Header>
              <Card.Body className="p-1">
                <div className="d-grid gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "lsttextinput", draggedItems.length)}
                  >
                    <i className="fas fa-list-ul" style={{ fontSize: '14px', color: '#17a2b8' }}></i>
                    <span>{t('builder.components.lsttextinput', { defaultValue: 'Liste des zones de textes' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "lstcheckboxes", draggedItems.length)}
                  >
                    <i className="fas fa-tasks" style={{ fontSize: '14px', color: '#28a745' }}></i>
                    <span>{t('builder.components.lstcheckboxes', { defaultValue: 'Liste des cases à cocher' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                    onDragStart={(e) => handleDragStart(e, "lstradiobuttons", draggedItems.length)}
                  >
                    <i className="fas fa-list-ol" style={{ fontSize: '14px', color: '#ffc107' }}></i>
                    <span>{t('builder.components.lstradiobuttons', { defaultValue: 'Liste des boutons radios' })}</span>
                  </Button>
                </div>
              </Card.Body>
          </Card>

            {/* Layout Components */}
            <Card className="border-0 shadow-sm mb-2">
              <Card.Header className="bg-dark text-white py-2">
                <h6 className="mb-0 d-flex align-items-center" style={{ gap: 8, fontSize: '14px', fontWeight: '600' }}>
                  <i className="fas fa-th" style={{ fontSize: '14px' }}></i>
                  <span>{t('builder.sections.layout', { defaultValue: 'Composants de mise en page' })}</span>
                </h6>
              </Card.Header>
              <Card.Body className="p-1">
                <div className="d-grid gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                onDragStart={(e) => handleDragStart(e, "divider")}
              >
                    <i className="fas fa-minus" style={{ fontSize: '14px', color: '#6c757d' }}></i>
                    <span>{t('builder.components.divider', { defaultValue: 'Diviseur' })}</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center justify-content-start text-start"
                    style={{ gap: 8, height: '36px', fontSize: '13px', fontWeight: '500' }}
                draggable
                onDrag={handleDrag}
                onDragStart={(e) => handleDragStart(e, "line")}
              >
                    <i className="fas fa-grip-lines" style={{ fontSize: '14px', color: '#6c757d' }}></i>
                    <span>{t('builder.components.line', { defaultValue: 'Ligne' })}</span>
                  </Button>
                </div>
              </Card.Body>
          </Card>
          </div>


          {/* Compact Action Button */}
          <Card className="border-0 shadow-sm mt-2">
            <Card.Body className="p-2">
          <Button
                className="w-100"
                variant={isUpdateForm ? "warning" : "info"}
                size="sm"
            disabled={loadingOptionByID || getUpdatedComponentsLoading}
            onClick={showCreateOptionModalHandler}
                style={{ 
                  height: '36px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
          >
            {loadingOptionByID || getUpdatedComponentsLoading ? (
                  <div className="d-flex align-items-center justify-content-center" style={{ gap: 6 }}>
                    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                    <span>{t('common.loading', { defaultValue: 'Chargement...' })}</span>
                  </div>
            ) : !isUpdateForm ? (
                  <div className="d-flex align-items-center justify-content-center" style={{ gap: 6 }}>
                    <i className="fa-solid fa-file-circle-plus"></i>
                    <span>{t('builder.buttons.create', { defaultValue: 'créer' })}</span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ gap: 6 }}>
                    <i className="fa-solid fa-file-pen"></i>
                    <span>{t('builder.buttons.modify', { defaultValue: 'modifier' })}</span>
                  </div>
            )}
          </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
      </ErrorBoundary>
    </UltimateErrorSuppressor>
  );
};

export default DamiEditPageCrtOp;

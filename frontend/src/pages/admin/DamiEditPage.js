import React, { useEffect, useRef, useState } from "react";
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
} from "../../components/documentComponents";
import { TextStyles } from "../../components/createDamiComponents";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link, useParams, useLocation } from "react-router-dom";
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
  fetchServicesByDepartementID,
} from "../../redux/service/serviceActions";
import { fetchSousCategories } from "../../redux/sousCategorie/sousCategorieActions";
import { Toast, cssStringToObject } from "../../services";
import {
  createOption,
  fetchOptionByID,
  resetCreateOption,
  resetFetchOptionByID,
  resetUpdateOption,
  updateOption,
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
import SectionCondtion from "../../components/documentComponents/SectionCondtion";

const UICOMPONENTS = {
  label: <Label block />,
  textinput: <TextInput />,
  checkboxes: <CheckBox />,
  radiobuttons: <RadioButtons />,
  lsttextinput: <ListOfTextInput />,
  lstcheckboxes: <ListOfCheckBoxes />,
  lstradiobuttons: <ListOfRadiosButtons />,
  sectionCondtion: <SectionCondtion />,
  line: <Line />,
  divider: <Divider />,
};

const validationHeaderSchema = Yup.object({
  libelle: Yup.string().required(
    "il faut saisire une libelle (nom de l'option)"
  ),
  typeProcessus: Yup.string().required("il faut saisire le type de processsus"),
  document: Yup.string()
    .required("il faut saisire le document")
    .matches(
      /^([A-Z]{3})\.([A-Z&]{0,2}[A-Z]|[0-9]{3})\.([0-9]{3})\.([A-Z])$/,
      "Le document doit être saisi sous cette forme, par exemple : 'ERT.LSI.001.A'"
    ),
  classification: Yup.string().required(
    "il faut saisire le type de classification"
  ),
  creation: Yup.date().required("il faut saisire la date de creation"),
  maj: Yup.date().required("il faut saisire le date de mise a jour"),
});

const validationSousCategorieSchema = Yup.object({
  sousCategorie: Yup.string().required("il faut entrer une sous-categorie"),
  departement: Yup.string(),
  service: Yup.string().required("il faut entrer un service"),
  typePdd: Yup.string(),
  proprietaireDeDonnees: Yup.string(),
  typeAtr: Yup.string(),
  atr: Yup.string(),
});

const DamiEditPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [draggedItems, setDraggedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateOpModal, setShowCreateOpModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  const [steps] = useState([
    "entête",
    "sous-categorie & service & proprietaire de donnees",
    "signataires",
    "confirmation",
  ]);

  const [checkValues, setCheckValues] = useState({
    cds: false,
    cdd: false,
    hiq: true,
    atr: false,
    pdd: false,
    dir: true,
    dg: false,
    pdg: false,
  });

  const [option, setOption] = useState(null);
  const [callOptionByIDOnce, setCallOptionByIDOnce] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [isUpdateForm, setIsUpdateForm] = useState(false);
  const [getUpdatedComponentsLoading, setGetUpdatedComponentsLoading] =
    useState(false);
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
    departement: "",
    service: "",
    proprietaireDeDonnees: "",
    typePdd: "",
    autreUtilisateur: "",
    typeAtr: "",
  });

  const [ids, setIds] = useState([]);
  const [typePdd, setTypePdd] = useState("srv");
  const [typeAtr, setTypeAtr] = useState("srv");
  const [usersAtr, setUsersAtr] = useState([]);
  const [atrTitle, setAtrTitle] = useState("");

  const docRef = useRef(null);
  const btnRef = useRef(null);
  const viewResultDocRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const dispatch = useDispatch();
  const [recoveredConditions, setRecoveredConditions] = useState([]);

  // const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    directions,
  } = directionList;

  const departementList = useSelector((state) => state.departementList);
  const {
    loading: loadingDepartementList,
    error: errordDepartementList,
    departements,
  } = departementList;

  const serviceListByDepartementID = useSelector(
    (state) => state.serviceListByDepartementID
  );
  const {
    loading: loadingserviceListByDepartementID,
    error: errorserviceListByDepartementID,
    services: servicesByDep,
  } = serviceListByDepartementID;

  const serviceList = useSelector((state) => state.serviceList);
  const {
    loading: loadingServiceList,
    error: errorServiceList,
    services,
  } = serviceList;

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

  const optionCreate = useSelector((state) => state.optionCreate);
  const {
    loading: loadingOptionCreate,
    error: errorOptionCreate,
    // option: createdOption,
    success: successOptionCreate,
  } = optionCreate;

  const optionByID = useSelector((state) => state.optionByID);
  const {
    loading: loadingOptionByID,
    error: errorOptionByID,
    option: recoveredOption,
    success: successOptionByID,
  } = optionByID;

  const optionUpdate = useSelector((state) => state.optionUpdate);
  const {
    loading: loadingOptionUpdate,
    error: errorOptionUpdate,
    // option: updatedOption,
    success: successOptionUpdate,
  } = optionUpdate;

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
                // L'élément a été déposé à l'emplacement du diviseur
                let nDraggedItems = draggedItems.map((item) => {
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
                // L'élément a été déposé à l'emplacement du diviseur
                let nDraggedItems = draggedItems.map((item) => {
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
        title: "Error on (drop component)",
        message: String(error),
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
        title: "Error on (remove btn and layouts)",
        message: String(error),
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

  // creation de l'option :
  const showCreateOptionModalHandler = () => {
    if (docRef.current.querySelector("div").innerHTML !== "") {
      setShowCreateOpModal(true);
    } else {
      Toast.open({
        type: "danger",
        title: "Erreur",
        message: "Il faut remplir le contenu de Dami avant de la créer.",
      });
    }
  };

  const goBackStepsHandler = () => {
    if (activeStep !== 0) {
      let n = Number(activeStep) - 1;
      setActiveStep(n);
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
      setOption({ ...option, ...values });
      dispatch(fetchDepartementByID(values.departement));
      dispatch(fetchServiceByID(values.service));

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

    let condition = [];
    const pddIds = Array.from(document.querySelectorAll(".pdd-id input"));
    if (pddIds.findIndex((i) => i.checked) !== -1) {
      condition.push({
        type: "pdd",
        element: pddIds.find((i) => i.checked).getAttribute("id"),
      });
    }
    const dgIds = Array.from(document.querySelectorAll(".dg-id input"));
    if (dgIds.findIndex((i) => i.checked) !== -1) {
      condition.push({
        type: "dg",
        element: dgIds.find((i) => i.checked).getAttribute("id"),
      });
    }

    const pdgIds = Array.from(document.querySelectorAll(".pdg-id input"));
    if (pdgIds.findIndex((i) => i.checked) !== -1) {
      condition.push({
        type: "pdg",
        element: pdgIds.find((i) => i.checked).getAttribute("id"),
      });
    }

    setOption({
      ...option,
      dirLibelle: direction.libelle,
      signataires: signataires,
      autreResponsableTitre: atrTitle,
      conditions: condition,
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
        pdg: false,
        pdg: false,
      });
    }
    setShowCreateOpModal(false);
  };

  const addOptionHandler = () => {
    document.documentElement.scrollTop = 0;
    dispatch(createOption({ ...option, shouldAskAnyTime: shouldAskAnyTime }));
  };

  const modifierOptionHandler = () => {
    if (isUpdateForm) {
      dispatch(updateOption(id, { ...option, shouldAskAnyTime: shouldAskAnyTime }));
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
              dataConditionID:
                checkbox.querySelector(".dami-check-box").dataset.conditionid,
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
        title: "Error on (get Updated Component)",
        message: String(error),
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
              options = options.map((option) => {
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
        title: "Error on (save Content Work)",
        message: String(error),
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
    }

    if (option && option.service && option.departement) {
      dispatch(getByServiceID(option.service));
      dispatch(fetchDepartementByID(option.departement));
    }

    if (successOptionCreate) {
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
          dispatch({
            type: OPTION_LIST_REMOVE,
            payload: id,
          });
        }
      }
      Toast.open({
        type: "success",
        title: "Creation avec success",
        message: "l'option a été ajoutée avec succès",
      });
    }

    if (successOptionByID && recoveredOption) {
      getUpdatedComponent(recoveredOption);
      setIsUpdateForm(true);
      const dateCreationString = new Date(
        recoveredOption.header.creation
      ).toLocaleDateString();

      const dateCreationArray = dateCreationString.split("/");

      const cryear = dateCreationArray[2];
      const crmonth = dateCreationArray[0];
      const crday = dateCreationArray[1];
      const formattedCreationDate = cryear + "-" + crday + "-" + crmonth;

      const dateUpdateString = new Date(
        recoveredOption.header.maj
      ).toLocaleDateString();

      const dateMajArray = dateUpdateString.split("/");

      const mjyear = dateMajArray[2];
      const mjmonth = dateMajArray[0];
      const mjday = dateMajArray[1];
      const formattedMajDate = mjyear + "-" + mjday + "-" + mjmonth;

      let cds = false;
      let cdd = false;
      let hiq = false;
      let atr = false;
      let pdd = false;
      let dir = false;
      let dg = false;
      let pdg = false;

      for (const item of recoveredOption.signataires) {
        if (String(item) === "cds") cds = true;
        if (String(item) === "cdd") cdd = true;
        if (String(item) === "hiq") hiq = true;
        if (String(item) === "atr") atr = true;
        if (String(item) === "pdd") pdd = true;
        if (String(item) === "dir") dir = true;
        if (String(item) === "dg") dg = true;
        if (String(item) === "pdg") pdg = true;
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
      });

      headerForm.setValues({
        libelle: recoveredOption.libelle,
        typeProcessus: recoveredOption.typeProcessus,
        document: recoveredOption.header.document,
        classification: recoveredOption.header.classification.toLowerCase(),
        creation: formattedCreationDate,
        maj: formattedMajDate,
      });
      setTypePdd("dir");
      setTypeAtr("dir");
      if (recoveredOption && recoveredOption.proprietaireDeDonnees)
        dispatch(
          fetchUsersByDivision(
            "dir",
            recoveredOption.proprietaireDeDonnees.direction
          )
        );
      getUserArt();
      setOption({
        ...recoveredOption,
        conditions: recoveredOption.conditions,
      });

      setAtrTitle(recoveredOption.autreResponsableTitre ? recoveredOption.autreResponsableTitre : "")
      setShouldAskAnyTime(recoveredOption.shouldAskAnyTime);
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
          typeAtr: recoveredOption.autreUtilisateur ? recoveredOption.autreUtilisateur.direction : '',
          autreUtilisateur: recoveredOption.autreUtilisateur ? recoveredOption.autreUtilisateur._id : ''

        });
        setRecoveredConditions(recoveredOption.conditions);
      }, 1000);
    }

    if (successOptionUpdate) {
      dispatch(resetUpdateOption());
      setActiveStep(0);
      setShowCreateOpModal(false);
      Toast.open({
        type: "success",
        title: "Modification avec success",
        message: "l'option a été modifée avec succès",
      });
    }

    return () => {
      dispatch(resetFetchOptionByID());
    };
  }, [
    callOnce,
    dispatch,
    option,
    successOptionCreate,
    id,
    successOptionByID,
    recoveredOption,
    isUpdateForm,
    successOptionUpdate,
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
      // setIsAlreadySaved(false);
    };
  }, [currentPath, option]);

  useEffect(() => {
    if (sousCategorieForm.values.departement) {
      dispatch(
        fetchServicesByDepartementID(sousCategorieForm.values.departement)
      );
    }
  }, [sousCategorieForm.values.departement]);

  useEffect(() => {
    if (sousCategorieForm.values.typePdd) {
      dispatch(fetchUsersByDivision(typePdd, sousCategorieForm.values.typePdd));
    }
  }, [sousCategorieForm.values.typePdd]);



  useEffect(() => {
    if (userInfo && sousCategorieForm.values.typeAtr) {
      getUserArt();
    }
  }, [sousCategorieForm.values.typeAtr]);

  useEffect(() => {
    const handleBodyClick = (event) => {
      const popover = document.querySelector(".popover");
      if (
        btnRef &&
        btnRef.current &&
        !btnRef.current.contains(event.target) &&
        popover &&
        !popover.contains(event.target)
      ) {
        setShowPopover(false);
      }
    };
    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (showCreateOpModal) {
      setIds(
        Array.from(document.querySelectorAll("[data-conditionid]"))
          .filter((el) => el && el.dataset && el.dataset.conditionid !== "")
          .map((el) => {
            if (el && el.dataset) {
              return el.dataset.conditionid;
            }
          })
      );
    }
  }, [showCreateOpModal]);

  return (
    <>
      {/* Begin Modal View Result */}

      <Modal
        show={showModal}
        fullscreen={true}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">Voire le contenu de dami</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {draggedItems.length === 0 && (
            <Alert variant="warning">
              <i className="fas fa-exclamation-circle mt-1"></i> vous n'avez pas
              encore rempli le document
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
      {/* End Modal View Result */}

      {/* Begin Modal Create option */}
      <Modal
        show={showCreateOpModal}
        centered
        fullscreen={true}
        size="xl"
        onHide={closeCreateOptionModalHandler}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">créer l'option (dami)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StepsProgress activeStep={activeStep} steps={steps} />
          <hr />
          {errorDirectionList && (
            <Message itWillBeHidden={true} type="danger">
              {errorDirectionList}
            </Message>
          )}
          {errorserviceListByDepartementID && (
            <Message itWillBeHidden={true} type="danger">
              {errorserviceListByDepartementID}
            </Message>
          )}
          {errorDepartementByID && (
            <Message itWillBeHidden={true} type="danger">
              {errorDepartementByID}
            </Message>
          )}
          {errordDepartementList && (
            <Message itWillBeHidden={true} type="danger">
              {errordDepartementList}
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
          {errorOptionCreate && (
            <Message type="danger" itWillBeHidden={true}>
              {errorOptionCreate}
            </Message>
          )}
          {errorServiceByID && (
            <Message type="danger" itWillBeHidden={true}>
              {errorServiceByID}
            </Message>
          )}
          {errorOptionUpdate && (
            <Message type="danger" itWillBeHidden={true}>
              {errorOptionUpdate}
            </Message>
          )}
          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="light"
              className="d-block my-3"
              onClick={goBackStepsHandler}
            >
              <i className="fas fa-arrow-left"></i> retour
            </Button>
          </div>

          {activeStep === 0 ? (
            <Form onSubmit={headerForm.handleSubmit}>
              <label>
                <small className="text-danger mt-3">*</small> libelle:
              </label>
              <Form.Control
                placeholder="Exp: access SI, demande material x ..."
                name="libelle"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.libelle}
              />
              {headerForm.touched.libelle && headerForm.errors.libelle && (
                <small className="text-danger d-block">
                  {headerForm.errors.libelle}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small> Type de
                processsus:
              </label>
              <Form.Control
                placeholder="Exp: livraison des services x ..."
                name="typeProcessus"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.typeProcessus}
              />{" "}
              {headerForm.touched.typeProcessus &&
                headerForm.errors.typeProcessus && (
                  <small className="text-danger d-block">
                    {headerForm.errors.typeProcessus}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                document:
              </label>
              <Form.Control
                placeholder="Exp: AAA.BBB.000.X ..."
                name="document"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.document}
              />{" "}
              {headerForm.touched.document && headerForm.errors.document && (
                <small className="text-danger d-block">
                  {headerForm.errors.document}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small>
                classification:
              </label>
              <Form.Select
                className="mb-3"
                placeholder="Exp: AAA.BBB.000.X ..."
                name="classification"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.classification}
              >
                <option value="">
                  ---- veuillez choisire le type de classification ----
                </option>
                <option value="interne">Interne</option>
                <option value="externe">Externe</option>
              </Form.Select>{" "}
              {headerForm.touched.classification &&
                headerForm.errors.classification && (
                  <small className="text-danger d-block">
                    {headerForm.errors.classification}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                creation :
              </label>
              <Form.Control
                type="date"
                name="creation"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.creation}
              />{" "}
              {headerForm.touched.creation && headerForm.errors.creation && (
                <small className="text-danger d-block">
                  {headerForm.errors.creation}
                </small>
              )}
              <label>
                <small className="text-danger mt-3">*</small>
                Mise a jour :
              </label>
              <Form.Control
                type="date"
                name="maj"
                onChange={headerForm.handleChange}
                onBlur={headerForm.handleBlur}
                value={headerForm.values.maj}
              />{" "}
              {headerForm.touched.maj && headerForm.errors.maj && (
                <small className="text-danger d-block">
                  {headerForm.errors.maj}
                </small>
              )}


              <Button variant="dark" className="w-100 mt-3" type="submit">
                continue <i className="fas fa-arrow-right"></i>
              </Button>
            </Form>
          ) : activeStep === 1 ? (
            <Form onSubmit={sousCategorieForm.handleSubmit}>
              <label>
                <small className="text-danger mt-3">*</small>sous-categorie :
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
                  ---- veuillez choisire un departement ----
                </option>
                {departements.length > 0 &&
                  departements.map((departement) => (
                    <option key={departement._id} value={departement._id}>
                      {departement.libelle}
                    </option>
                  ))}
              </Form.Select>{" "}
              {sousCategorieForm.touched.departement &&
                sousCategorieForm.errors.departement && (
                  <small className="text-danger d-block">
                    {sousCategorieForm.errors.departement}
                  </small>
                )}
              <label>
                <small className="text-danger mt-3">*</small>
                service :
              </label>
              <Form.Select
                className="mb-3"
                name="service"
                disabled={
                  loadingserviceListByDepartementID ||
                  servicesByDep.length === 0
                }
                onChange={sousCategorieForm.handleChange}
                onBlur={sousCategorieForm.handleBlur}
                value={sousCategorieForm.values.service}
              >
                <option value="">---- veuillez choisire un service ----</option>
                {servicesByDep.length > 0 &&
                  servicesByDep.map((serviceByID) => (
                    <option key={serviceByID._id} value={serviceByID._id}>
                      {serviceByID.libelle}
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
                  {usersAtr && Array.from(usersAtr).length > 0 &&
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
              <label>proprietaire de donnees : </label>
              <div className="d-flex align-items-center">
                <Form.Check
                  name="fltPdd"
                  className="mr-1"
                  type="radio"
                  checked={typePdd === "srv"}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("srv");
                  }}
                  label="filtrer par service"
                />
                <Form.Check
                  name="fltPdd"
                  className="mr-1"
                  type="radio"
                  checked={typePdd === "dep"}
                  value={typePdd}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("dep");
                  }}
                  label="filtrer par departement"
                />

                <Form.Check
                  name="fltPdd"
                  className="mr-1"
                  type="radio"
                  checked={typePdd === "dir"}
                  value={typePdd}
                  onChange={() => {
                    dispatch(resetFetchUsersByDivision());
                    setTypePdd("dir");
                  }}
                  label="filtrer par direction"
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
                  ----- choisire un proprietaire de donnees -----
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
              <Button variant="dark" className="w-100 mt-3" type="submit">
                continue <i className="fas fa-arrow-right"></i>
              </Button>
            </Form>
          ) : activeStep === 2 ? (
            <>
              <div className="d-block h-100">
                <div className="d-flex justify-content-center mb-2">
                  <h3>les signataires de cette option</h3>
                </div>
                <Message type="info">
                  Pour choisir qui va signer dans cette option, il faut cocher
                  la case à cocher
                </Message>
                <Message type="warning">
                  Le nombre maximum de signataires autorisés est de 5.
                </Message>

                <div className="px-1 py-4 d-block ">
                  <div>
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
                            disabled
                            readOnly
                          />

                          <small className="d-block text-warning">
                            <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                            Directeur hiérarchique doit signer toutes les
                            demandes
                          </small>
                        </div>

                        <div className="w-100 py-2">
                          <Form.Check
                            onChange={sigChangeHandler}
                            id="pdd"
                            value={checkValues["pdd"]}
                            checked={checkValues["pdd"]}
                            disabled={!option.proprietaireDeDonnees}
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
                            disabled={
                              !sousCategorieForm.values.autreUtilisateur
                            }
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
                            readOnly
                            disabled
                          />

                          <small className="d-block text-warning">
                            <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                            Le directeur de la direction{" "}
                            {String(direction.libelle).toLowerCase()} doit
                            obligatoirement signer dans cette option.
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

                          {ids.length > 0 &&
                            ids.map((id) => (
                              <Form.Check
                                disabled={!checkValues["pdg"]}
                                type="radio"
                                name="pdg-id"
                                className="pdg-id"
                                value={id}
                                label={`id : ${id}`}
                                id={id}
                                checked={
                                  recoveredConditions.length > 0
                                    ? recoveredConditions.find(
                                      (cd) => String(cd.type) === "pdg"
                                    )
                                      ? String(
                                        recoveredConditions.find(
                                          (cd) => String(cd.type) === "pdg"
                                        ).element
                                      ) === String(id)
                                        ? true
                                        : false
                                      : false
                                    : false
                                }
                              />
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="dark"
                className="w-100 mt-3"
                onClick={putSignatairesHandler}
              >
                continue <i className="fas fa-arrow-right"></i>
              </Button>
            </>
          ) : (
            <>
              {loadingOptionCreate && <Loader />}
              {loadingOptionUpdate && <Loader />}
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
                  <br />

                  <Dami option={option} showAdmin />
                </Col>
                <Col xl={2} lg={12} md={12} sm={12}></Col>
              </Row>

              {isUpdateForm ? (
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={modifierOptionHandler}
                >
                  Modifier
                </Button>
              ) : (
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={addOptionHandler}
                >
                  Ajouter
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
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to="/options"
          className="btn btn-sm btn-light"
          onClick={() => {
            setIsUpdateForm(false);
            setCallOptionByIDOnce(false);
            dispatch(resetFetchOptionByID());
          }}
        >
          <i className="fas fa-arrow-left"></i> retour
        </Link>
        <Button variant="dark" onClick={openModalHandler} size="sm">
          <i className="fa-solid fa-maximize"></i> voire
        </Button>
      </div>

      <Row className="doc-row">
        <Col xl={12} lg={12} md={12} sm={12}></Col>
        <Col xl={9} lg={9} md={12} sm={12}>
          <TextStyles />
          <div
            ref={docRef}
            className="doc"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {loadingOptionByID && <TableLoading />}
            {getUpdatedComponentsLoading && <TableLoading />}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {draggedItems.map((item, index) => (
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
        </Col>
        <Col xl={3} lg={3} md={12} sm={12}>
          <Card className="mt-3">
            <ListGroup>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "label", draggedItems.length)
                }
              >
                Label
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "textinput", draggedItems.length)
                }
              >
                Zone de text
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "checkboxes", draggedItems.length)
                }
              >
                Case à cocher
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "radiobuttons", draggedItems.length)
                }
              >
                Bouton radio
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card className="mt-2">
            <ListGroup>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "lsttextinput", draggedItems.length)
                }
              >
                Liste des zones de textes
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "lstcheckboxes", draggedItems.length)
                }
              >
                Liste des cases à cocher
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) =>
                  handleDragStart(e, "lstradiobuttons", draggedItems.length)
                }
              >
                Liste des boutons radios
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card className="mt-2">
            <ListGroup>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) => handleDragStart(e, "sectionCondtion")}
              >
                Section Condtion
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) => handleDragStart(e, "divider")}
              >
                Diviseur
              </ListGroup.Item>
              <ListGroup.Item
                className="cursor-pointer crt-dami-com-item"
                draggable
                onDrag={handleDrag}
                onDragStart={(e) => handleDragStart(e, "line")}
              >
                Ligne
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Button
            className="mt-3 w-100"
            variant="dark"
            disabled={loadingOptionByID || getUpdatedComponentsLoading}
            onClick={showCreateOptionModalHandler}
          >
            {loadingOptionByID || getUpdatedComponentsLoading ? (
              <span>loading ....</span>
            ) : !isUpdateForm ? (
              <>
                <i className="fa-solid fa-file-circle-plus"></i> créer
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-pen"></i> modifier
              </>
            )}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default DamiEditPage;

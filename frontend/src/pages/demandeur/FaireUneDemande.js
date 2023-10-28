import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/categorie/categorieActions";
import {
  fetchSousCategoriesByCategorieID,
  resetFetchSousCategoriesByCategorieID,
} from "../../redux/sousCategorie/sousCategorieActions";
import {
  fetchOptionByID,
  fetchOptionsBySousCategorieID,
  resetFetchOptionByID,
} from "../../redux/option/optionActions";

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import {
  Dami,
  DamiLoading,
  Loader,
  Message,
  WarningMessage,
} from "../../components";
import {
  createDemande,
  resetCreateDemande,
} from "../../redux/demande/demandeActions";
import { Toast } from "../../services";

const FaireUneDemande = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const disptach = useDispatch();

  const categorieList = useSelector(state => state.categorieList);
  const {
    loading: loadingCategorieList,
    error: errorCategorieList,
    categories,
  } = categorieList;

  const souscategorieListByCategorieID = useSelector(
    state => state.souscategorieListByCategorieID
  );

  const {
    loading: loadingSouscategorieListByCategorieID,
    error: errorSouscategorieListByCategorieID,
    souscategories,
  } = souscategorieListByCategorieID;

  const optionListBySousCategorieID = useSelector(
    state => state.optionListBySousCategorieID
  );
  const {
    loading: loadingOptionListBySousCategorieID,
    error: errorOptionListBySousCategorieID,
    options,
  } = optionListBySousCategorieID;

  const optionByID = useSelector(state => state.optionByID);
  const { loading: loadingOptionID, error: errorOptionID, option } = optionByID;

  const demandeCreate = useSelector(state => state.demandeCreate);
  const {
    loading: loadingDemandeCreate,
    error: errorDemandeCreate,
    success: successDemandeCreate,
  } = demandeCreate;

  const getSousCategoriesChangeHandler = event => {
    setSelectedOption(null);
    disptach(fetchSousCategoriesByCategorieID(event.target.value));
    disptach(resetFetchSousCategoriesByCategorieID());
    disptach(resetFetchOptionByID());
  };

  const getOptionsChangeHandler = event => {
    setSelectedOption(null);
    disptach(fetchOptionsBySousCategorieID(event.target.value));
    disptach(resetFetchOptionByID());
  };

  const getOptionHandler = event => {
    setSelectedOption(event.target.value);
    disptach(fetchOptionByID(event.target.value));
  };

  const resetDamiFormHandler = () => {
    document.querySelectorAll(".dami-body input").forEach(input => {
      input.value = "";
      if (
        String(input.getAttribute("type")) === "checkbox" ||
        String(input.getAttribute("type")) === "radio"
      ) {
        input.checked = false;
      }
    });
  };

  const faireUneDemandeHandler = () => {
    if (selectedOption) {
      let isEmpty = true;
      const damiBody = document.querySelector(".dami-body div");
      const damiInputs = damiBody.querySelectorAll(".dami-input");
      for (const damiInput of damiInputs) {
        if (damiInput.value !== "") {
          isEmpty = false;
          break;
        }
      }

      const damiCheckBoxes = damiBody.querySelectorAll(".dami-check-box");
      for (const damiCheckBox of damiCheckBoxes) {
        if (damiCheckBox.checked) {
          isEmpty = false;
          break;
        }
      }

      const damiRadioButtons = damiBody.querySelectorAll(".dami-radio-button");
      for (const damiRadioButton of damiRadioButtons) {
        if (damiRadioButton.checked) {
          isEmpty = false;
          break;
        }
      }
      const damiTextAreaLines = damiBody.querySelectorAll(
        ".dami-textarea-line"
      );
      for (const damiTextAreaLine of damiTextAreaLines) {
        if (damiTextAreaLine.value !== "") {
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) {
        const contenu = damiBody.innerHTML;
        console.log(contenu);
        disptach(createDemande(selectedOption, contenu));
      } else {
        Toast.open({
          type: "danger",
          message: "il faut remplire le formulaire !",
        });
      }
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (!callOnce) {
      disptach(fetchCategories());
      setCallOnce(true);
    }
    if (successDemandeCreate || errorDemandeCreate) {
      window.scrollTo(0, 0);
    }
    if (successDemandeCreate) {
      const damiBody = document.querySelector(".dami-body");

      damiBody.querySelectorAll(".dami-input").forEach(el => {
        el.value = "";
      });
      damiBody.querySelectorAll(".dami-check-box").forEach(el => {
        el.checked = false;
      });
      damiBody.querySelectorAll(".dami-radio-button").forEach(el => {
        el.checked = false;
      });
      damiBody.querySelectorAll(".dami-textarea-line").forEach(el => {
        el.value = "";
      });

      Toast.open({
        type: "success",
        message: "La demande a été effectuée avec succès.",
      });

      disptach(resetCreateDemande());
    }
  }, [callOnce, disptach, successDemandeCreate, errorDemandeCreate]);

  return (
    <>
      {errorCategorieList && (
        <Message type='danger' itWillBeHidden={true}>
          {errorCategorieList}
        </Message>
      )}
      {errorSouscategorieListByCategorieID && (
        <Message type='danger' itWillBeHidden={true}>
          {errorSouscategorieListByCategorieID}
        </Message>
      )}
      {errorOptionListBySousCategorieID && (
        <Message type='danger' itWillBeHidden={true}>
          {errorOptionListBySousCategorieID}
        </Message>
      )}
      {errorOptionID && (
        <Message type='danger' itWillBeHidden={true}>
          {errorOptionID}
        </Message>
      )}
      {errorDemandeCreate && (
        <Message type='danger' itWillBeHidden={true}>
          {errorDemandeCreate}
        </Message>
      )}

      {loadingDemandeCreate && <Loader />}

      <Card>
        <Card.Body>
          <div className='d-flex justify-content-between'>
            <Form.Select
              className='m-1'
              disabled={loadingCategorieList}
              onChange={getSousCategoriesChangeHandler}>
              <option value={""}>
                ----- veuillez selectionne une categorie -----
              </option>
              {categories.length > 0 &&
                categories.map(categorie => (
                  <option value={categorie._id} key={categorie._id}>
                    {categorie.libelle}
                  </option>
                ))}
            </Form.Select>
            <Form.Select
              className='m-1'
              onChange={getOptionsChangeHandler}
              disabled={
                loadingSouscategorieListByCategorieID ||
                souscategories.length === 0
              }>
              <option value={""}>
                ----- veuillez selectionne une sous-categorie -----
              </option>
              {souscategories.length > 0 &&
                souscategories.map(sousCategorie => (
                  <option value={sousCategorie._id} key={sousCategorie._id}>
                    {sousCategorie.libelle}
                  </option>
                ))}
            </Form.Select>
            <Form.Select
              className='m-1'
              disabled={
                loadingSouscategorieListByCategorieID ||
                souscategories.length === 0 ||
                loadingOptionListBySousCategorieID ||
                options.length === 0
              }
              onChange={getOptionHandler}>
              <option value={""}>
                ----- veuillez selectionne une option -----
              </option>
              {options.length > 0 &&
                options.map(option => (
                  <option key={option._id} value={option._id}>
                    {option.libelle}
                  </option>
                ))}
            </Form.Select>
          </div>
        </Card.Body>
      </Card>
      <Card className='mt-3'>
        <Card.Body>
          {selectedOption ? (
            <Row className=' '>
              <Col xl={12} lg={12} md={12} sm={12}>
                {loadingOptionID && <DamiLoading />}
                {option ? (
                  <>
                    <Dami option={option} />
                    <Button
                      className='w-100 mt-2'
                      variant='dark'
                      disabled={loadingDemandeCreate}
                      onClick={faireUneDemandeHandler}>
                      <i className='fa-solid fa-code-pull-request'></i> Demander
                    </Button>
                    <Button
                      className='w-100 mt-1'
                      variant='light'
                      disabled={loadingDemandeCreate}
                      onClick={resetDamiFormHandler}>
                      <i className='fa-solid fa-filter-circle-xmark'></i>{" "}
                      Réinitialiser
                    </Button>
                  </>
                ) : (
                  !loadingOptionID && (
                    <WarningMessage message={"aucune option trouvee"} />
                  )
                )}
              </Col>
            </Row>
          ) : (
            <div className='mt-5'>
              <WarningMessage message={"aucune option selectionne"} />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default FaireUneDemande;

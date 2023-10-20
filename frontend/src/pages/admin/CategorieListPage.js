import React, { useEffect, useState } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader,
  Message,
  Table,
  TableLoading,
  WarningMessage,
} from "../../components";
import {  Dialog, Toast } from "../../services/";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchDirections } from "../../redux/direction/directionActions";
import {
  createCategorie,
  fetchCategories,
  removeCategorie,
  resetCreateCategorie,
  resetRemoveCategorie,
  resetUpdateCategorie,
  updateCategorie,
} from "../../redux/categorie/categorieActions";
import {
  createSousCategorie,
  fetchSousCategoriesByCategorieID,
  removeSousCategorie,
  resetCreateSousCategorie,
  resetFetchSousCategoriesByCategorieID,
  resetRemoveSousCategorie,
  resetUpdateSousCategorie,
  updateSousCategorie,
} from "../../redux/sousCategorie/sousCategorieActions";

const validationCategorieSchema = Yup.object({
  categorieLibelle: Yup.string().required("il faut saisire une libelle"),
  direction: Yup.string().required("il faut choisire une direction"),
});

const validationSousCategorieSchema = Yup.object({
  sousCategorieLibelle: Yup.string().required("il faut saisire une libelle"),
});

const CategorieListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [categorieShow, setCategorieShow] = useState(false);
  const [sousCategorieShow, setSousCategorieShow] = useState(false);
  const [isCategorieUpdateForm, setIsCategorieUpdateForm] = useState(false);
  const [isSousCategorieUpdateForm, setIsSousCategorieUpdateForm] =
    useState(false);

  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [updatedCategorieId, setUpdatedCategorieId] = useState(null);
  const [updatedSousCategorieId, setUpdatedSousCategorieId] = useState(null);
  const [selectedCategorieLibelle, setSelectedCategorieLibelle] =
    useState(null);
  const [categorieInitialValues] = useState({
    categorieLibelle: "",
    direction: "",
  });
  const [sousCategorieInitialValues] = useState({
    sousCategorieLibelle: "",
  });

  const dispatch = useDispatch();

  const directionList = useSelector(state => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    directions,
  } = directionList;

  const categorieList = useSelector(state => state.categorieList);
  const {
    loading: loadingCategorieList,
    error: errorCategorieList,
    success: successCategorieListSuccess,
    categories,
  } = categorieList;

  const souscategorieListByCategorieID = useSelector(
    state => state.souscategorieListByCategorieID
  );

  const {
    loading: loadingSouscategorieListByCategorieID,
    error: errorSouscategorieListByCategorieID,
    success: successSousCategorieListSuccess,
    souscategories,
  } = souscategorieListByCategorieID;

  const categorieCreate = useSelector(state => state.categorieCreate);
  const {
    loading: loadingCreateCategorie,
    error: errorCreateCategorie,
    categorie: createdCategorie,
  } = categorieCreate;

  const categorieUpdate = useSelector(state => state.categorieUpdate);
  const {
    loading: loadingUpdateCategorie,
    error: errorUpdateCategorie,
    success: successUpdateCategorie,
    categorie: updatedCategorie,
  } = categorieUpdate;

  const categorieRemove = useSelector(state => state.categorieRemove);
  const {
    loading: loadingRemoveCategorie,
    error: errorRemoveCategorie,
    success: successRemoveCategorie,
  } = categorieRemove;

  const sousCategorieCreate = useSelector(state => state.sousCategorieCreate);
  const {
    loading: loadingCreateSousCategorie,
    error: errorCreateSousCategorie,
    sousCategorie: createdSousCategorie,
  } = sousCategorieCreate;

  const sousCategorieUpdate = useSelector(state => state.sousCategorieUpdate);
  const {
    loading: loadingUpdateSousCategorie,
    error: errorUpdateSousCategorie,
    success: successUpdateSousCategorie,
    sousCategorie: updatedSousCategorie,
  } = sousCategorieUpdate;

  const sousCategorieRemove = useSelector(state => state.sousCategorieRemove);
  const {
    loading: loadingRemoveSousCategorie,
    error: errorRemoveSousCategorie,
    success: successRemoveSousCategorie,
  } = sousCategorieRemove;

  const categorieForm = useFormik({
    initialValues: categorieInitialValues,
    validationSchema: validationCategorieSchema,
    onSubmit: values => {
      const { categorieLibelle, direction } = values;

      if (!isCategorieUpdateForm) {
        dispatch(
          createCategorie({ libelle: categorieLibelle, direction: direction })
        );
      } else {
        dispatch(
          updateCategorie(updatedCategorieId, {
            libelle: categorieLibelle,
            direction: direction,
          })
        );
      }
    },
  });

  const sousCategorieForm = useFormik({
    initialValues: sousCategorieInitialValues,
    validationSchema: validationSousCategorieSchema,
    onSubmit: values => {
      const { sousCategorieLibelle } = values;

      if (!isSousCategorieUpdateForm) {
        dispatch(
          createSousCategorie({
            libelle: sousCategorieLibelle,
            categorie: selectedCategorie,
          })
        );
      } else {
        dispatch(
          updateSousCategorie(updatedSousCategorieId, {
            libelle: sousCategorieLibelle,
          })
        );
      }
    },
  });

  // categorie :
  const hideCategorieModalHandler = () => {
    setCategorieShow(false);
    setIsCategorieUpdateForm(false);
    categorieForm.resetForm();
  };

  const removeCategorieHandler = id => {
    Dialog.open({
      title: "Confirmation",
      message: "Etes vous sûre de vouloir supprimer cette catégorie ?",
      onYes: () => {
        dispatch(removeCategorie(id));
      },
    });
  };

  const updateCategorieHandler = id => {
    setCategorieShow(true);
    setIsCategorieUpdateForm(true);
    setUpdatedCategorieId(id);
    const upLibelle = categories.find(
      cat => String(cat._id) === String(id)
    ).libelle;
    const upDirection = categories.find(cat => String(cat._id) === String(id))
      .direction._id;
    const categorieObject = {
      categorieLibelle: upLibelle,
      direction: upDirection,
    };

    categorieForm.setValues(categorieObject);
  };

  // sous-categorie :
  const hideSousCategorieModalHandler = () => {
    setSousCategorieShow(false);
    setIsSousCategorieUpdateForm(false);
    sousCategorieForm.resetForm();
  };

  const getSousCategoriesHandler = id => {
    setSelectedCategorie(id);
    const upLibelle = categories.find(
      cat => String(cat._id) === String(id)
    ).libelle;
    setSelectedCategorieLibelle(upLibelle);
    dispatch(fetchSousCategoriesByCategorieID(id));
  };

  const removeSousCategorieHandler = id => {
    Dialog.open({
      title: "Confirmation",
      message: "Etes vous sûre de vouloir supprimer cette sous-catégorie ?",
      onYes: () => {
        dispatch(removeSousCategorie(id));
      },
    });
  };

  const updateSousCategorieHandler = id => {
    setSousCategorieShow(true);
    setIsSousCategorieUpdateForm(true);
    setUpdatedSousCategorieId(id);
    const upLibelle = souscategories.find(
      cat => String(cat._id) === String(id)
    ).libelle;

    const categorieObject = {
      sousCategorieLibelle: upLibelle,
    };

    sousCategorieForm.setValues(categorieObject);
  };

  useEffect(() => {
    if (createdCategorie) {
      dispatch(resetCreateCategorie());
      setCategorieShow(false);
      categorieForm.resetForm();
      Toast.open({
        type: "success",
        title: "Creation avec success",
        message: "la catégorie a été ajoutée avec succès",
      });
    }

    if (successRemoveCategorie) {
      dispatch(resetRemoveCategorie());
      dispatch(resetFetchSousCategoriesByCategorieID());
      setSelectedCategorie(null);
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `la catégorie a été supprimée avec succès`,
      });
    }

    if (successUpdateCategorie) {
      dispatch(resetUpdateCategorie());
      setSelectedCategorieLibelle(updatedCategorie.libelle);
      setCategorieShow(false);
      categorieForm.resetForm();
    }

    if (createdSousCategorie) {
      dispatch(resetCreateSousCategorie());
      setSousCategorieShow(false);
      sousCategorieForm.resetForm();
      Toast.open({
        type: "success",
        title: "Creation avec success",
        message: "la sous-catégorie a été ajoutée avec succès",
      });
    }

    if (successRemoveSousCategorie) {
      dispatch(resetRemoveSousCategorie());

      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `la sous-catégorie a été supprimée avec succès`,
      });
    }

    if (successUpdateSousCategorie) {
      dispatch(resetUpdateSousCategorie());

      setSousCategorieShow(false);
      sousCategorieForm.resetForm();
    }

    if (!callOnce) {
      dispatch(fetchDirections());
      dispatch(fetchCategories());
      setCallOnce(true);
    }
  }, [
    callOnce,
    dispatch,
    createdCategorie,
    successRemoveCategorie,
    successUpdateCategorie,
    updatedCategorie,
    createdSousCategorie,
    successRemoveSousCategorie,
    successUpdateSousCategorie,
    updatedSousCategorie,
  ]);

  return (
    <>
      {/* Begin Add Categorie Modal*/}
      <Modal
        centered
        size='md'
        show={categorieShow}
        onHide={hideCategorieModalHandler}>
        <Modal.Header closeButton>
          <h6>categorie</h6>
        </Modal.Header>
        <Modal.Body>
          {loadingCreateCategorie && (
            <div className='d-flex justify-content-center'>
              <Loader size={"md"} />
            </div>
          )}
          {loadingUpdateCategorie && (
            <div className='d-flex justify-content-center'>
              <Loader size={"md"} />
            </div>
          )}
          {errorCreateCategorie && (
            <Message itWillBeHidden={true} type='danger'>
              {errorCreateCategorie}
            </Message>
          )}
          {errorUpdateCategorie && (
            <Message itWillBeHidden={true} type='danger'>
              {errorUpdateCategorie}
            </Message>
          )}
          <Form onSubmit={categorieForm.handleSubmit}>
            <label>libelle</label>
            <Form.Control
              placeholder='Exp: Informatique,Finance, Rh ...'
              disabled={loadingCreateCategorie}
              name='categorieLibelle'
              onChange={categorieForm.handleChange}
              onBlur={categorieForm.handleBlur}
              value={categorieForm.values.categorieLibelle}
            />
            {categorieForm.touched.categorieLibelle &&
              categorieForm.errors.categorieLibelle && (
                <small className='text-danger d-block'>
                  {categorieForm.errors.categorieLibelle}
                </small>
              )}
            <label className='mt-3'>direction</label>
            <Form.Select
              disabled={loadingDirectionList || loadingCreateCategorie}
              name='direction'
              onChange={categorieForm.handleChange}
              onBlur={categorieForm.handleBlur}
              value={categorieForm.values.direction}>
              <option>---- veuillez selectionner une direction ----</option>
              {directions.length > 0 &&
                directions.map(direction => (
                  <option key={direction._id} value={direction._id}>
                    {direction.libelle}
                  </option>
                ))}
            </Form.Select>
            {categorieForm.touched.direction &&
              categorieForm.errors.direction && (
                <small className='text-danger d-block'>
                  {categorieForm.errors.direction}
                </small>
              )}
            <Button variant='dark' className='mt-3 w-100' type='submit'>
              submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* End Add Categorie Modal*/}

      {/* Begin Add SousCategorie  Modal*/}
      <Modal
        centered
        size='md'
        show={sousCategorieShow}
        onHide={hideSousCategorieModalHandler}>
        <Modal.Header closeButton>
          <h6>sous-sategorie</h6>
        </Modal.Header>
        <Modal.Body>
          {loadingCreateSousCategorie && (
            <div className='d-flex justify-content-center'>
              <Loader size={"md"} />
            </div>
          )}
          {loadingUpdateSousCategorie && (
            <div className='d-flex justify-content-center'>
              <Loader size={"md"} />
            </div>
          )}
          {errorCreateSousCategorie && (
            <Message itWillBeHidden={true} type='danger'>
              {errorCreateSousCategorie}
            </Message>
          )}
          {errorUpdateSousCategorie && (
            <Message itWillBeHidden={true} type='danger'>
              {errorUpdateSousCategorie}
            </Message>
          )}
          <Form onSubmit={sousCategorieForm.handleSubmit}>
            <label>libelle</label>
            <Form.Control
              name='sousCategorieLibelle'
              value={sousCategorieForm.values.sousCategorieLibelle}
              placeholder='Exp: JD Edwards, Poste de travaille ...'
              onChange={sousCategorieForm.handleChange}
              onBlur={sousCategorieForm.handleBlur}
            />
            {sousCategorieForm.touched.sousCategorieLibelle &&
              sousCategorieForm.errors.sousCategorieLibelle && (
                <small className='text-danger d-block'>
                  {sousCategorieForm.errors.sousCategorieLibelle}
                </small>
              )}
            <Button variant='dark' className='mt-3 w-100' type='submit'>
              submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* End Add SousCategorie  Modal*/}

      {errorDirectionList && (
        <Message itWillBeHidden={true} type='danger'>
          {errorDirectionList}
        </Message>
      )}
      {errorCategorieList && (
        <Message itWillBeHidden={true} type='danger'>
          {errorCategorieList}
        </Message>
      )}
      {errorRemoveCategorie && (
        <Message itWillBeHidden={true} type='danger'>
          {errorRemoveCategorie}
        </Message>
      )}

      {errorSouscategorieListByCategorieID && (
        <Message itWillBeHidden={true} type='danger'>
          {errorSouscategorieListByCategorieID}
        </Message>
      )}

      {errorRemoveSousCategorie && (
        <Message itWillBeHidden={true} type='danger'>
          {errorRemoveSousCategorie}
        </Message>
      )}
      <Message variant='info'>
        Pour afficher les enfants d'une ligne (catégorie) vous devez cliquer sur
        la ligne dans le tableau
      </Message>

      <Card className='h-100'>
        <Card.Body>
          <div className='d-flex justify-content-end'>
            <Button
              size='sm'
              variant='dark'
              onClick={e => {
                setIsCategorieUpdateForm(false);
                setCategorieShow(true);
              }}>
              <i className='fas fa-plus'></i> Ajouter une categorie
            </Button>
          </div>
          {loadingCategorieList && <TableLoading />}
          {categories.length > 0 ? (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: "libelle",
                  accessor: "libelle",
                  filter: "libelle",
                },
                {
                  Header: "direction",
                  accessor: "direction.libelle",
                  filter: "direction.libelle",
                },
              ]}
              data={categories}
              loadingRemove={loadingRemoveCategorie}
              removeRow={removeCategorieHandler}
              updateRow={updateCategorieHandler}
              rowClick={getSousCategoriesHandler}
              dropdownFilters={["direction.libelle"]}
            />
          ) : (
            successCategorieListSuccess && (
              <WarningMessage message={"Aucune categorie trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
      <hr />
      {selectedCategorie ? (
        <Card>
          <Card.Body>
            <div className='d-flex justify-content-between align-items-center'>
              <p className='mt-1'>
                <small>catégorie sélectionnée :</small>{" "}
                <span style={{ fontWeight: "bold" }}>
                  {selectedCategorieLibelle}
                </span>
              </p>
              <Button
                size='sm'
                variant='dark'
                onClick={e => {
                  setIsSousCategorieUpdateForm(false);
                  setSousCategorieShow(true);
                }}>
                <i className='fas fa-plus'></i> Ajouter une sous-categorie
              </Button>
            </div>
            {loadingSouscategorieListByCategorieID && <TableLoading />}
            {souscategories.length > 0 ? (
              <Table
                columns={[
                  {
                    Header: "ID",
                    accessor: "_id",
                    show: false,
                  },
                  {
                    Header: "libelle",
                    accessor: "libelle",
                    filter: "libelle",
                  },
                ]}
                data={souscategories}
                loadingRemove={loadingRemoveSousCategorie}
                removeRow={removeSousCategorieHandler}
                updateRow={updateSousCategorieHandler}
              />
            ) : (
              successSousCategorieListSuccess && (
                <WarningMessage message={"Aucune sous-categorie trouvée"} />
              )
            )}
          </Card.Body>
        </Card>
      ) : (
        <WarningMessage message={"Aucune sous-categorie selectionnée"} />
      )}
    </>
  );
};

export default CategorieListPage;

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
import {
  fetchChefServicesUsers,
  fetchDirecteursUsers,
} from "../../redux/user/userActions";

import {
  createDirection,
  fetchDirections,
  removeDirection,
  resetCreateDirection,
  resetRemoveDirection,
  resetUpdateDirection,
  updateDirection,
} from "../../redux/direction/directionActions";
import {
  createService,
  fetchServicesByDirectionID,
  removeService,
  resetCreateService,
  resetFetchServicesByDirectionID,
  resetRemoveService,
  resetUpdateService,
  updateService,
} from "../../redux/service/serviceActions";

const validationDirectionSchema = Yup.object({
  directionLibelle: Yup.string().required(
    "il faut saisire une libelle (nom de direction)"
  ),
  directeur: Yup.string(),
});

const validationServiceSchema = Yup.object({
  serviceLibelle: Yup.string().required(
    "il faut saisire une libelle (nom de service)"
  ),
  chefService: Yup.string(),
});

const DirectionListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [directionShow, setDirectionShow] = useState(false);
  const [serviceShow, setServiceShow] = useState(false);
  const [isDirectionUpdateForm, setIsDirectionUpdateForm] = useState(false);
  const [isServiceUpdateForm, setIsServiceUpdateForm] = useState(false);

  const [selectedDirection, setSelectedDirection] = useState(null);
  const [updatedDirectionId, setUpdatedDirectionId] = useState(null);
  const [updatedServiceId, setUpdatedServiceId] = useState(null);
  const [selectedDirectionLibelle, setSelectedDirectionLibelle] =
    useState(null);

  const [directionInitialValues] = useState({
    directionLibelle: "",
    directeur: "",
  });
  const [serviceInitialValues] = useState({
    serviceLibelle: "",
    chefService: "",
  });

  const dispatch = useDispatch();

  const userDirecteursList = useSelector((state) => state.userDirecteursList);
  const {
    loading: loadingDirecteurList,
    error: errorDirecteurist,
    utilisateurs: directeurs,
  } = userDirecteursList;

  const userChefServiceList = useSelector((state) => state.userChefServiceList);
  const {
    loading: loadingChefServiceList,
    error: errorChefServiceList,
    utilisateurs: chefServices,
  } = userChefServiceList;

  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    success: successDirectionList,
    directions,
  } = directionList;

  const serviceListByDirectionID = useSelector(
    (state) => state.serviceListByDirectionID
  );

  const {
    loading: loadingServiceListByDirectionID,
    error: errorServiceListByDirectionID,
    success: successServiceListByDirectionID,
    services,
  } = serviceListByDirectionID;

  const directionCreate = useSelector((state) => state.directionCreate);
  const {
    loading: loadingDirectionCreate,
    error: errorDirectionCreate,
    direction: createdDirectionCreate,
  } = directionCreate;

  const directionUpdate = useSelector((state) => state.directionUpdate);
  const {
    loading: loadingDirectionUpdate,
    error: errorDirectionUpdate,
    success: successDirectionUpdate,
    direction: updatedDirection,
  } = directionUpdate;

  const directionRemove = useSelector((state) => state.directionRemove);
  const {
    loading: loadingDirectionRemove,
    error: errorDirectionRemove,
    success: successDirectionRemove,
  } = directionRemove;

  const serviceCreate = useSelector((state) => state.serviceCreate);
  const {
    loading: loadingServiceCreate,
    error: errorServiceCreate,
    service: createdService,
  } = serviceCreate;

  const serviceUpdate = useSelector((state) => state.serviceUpdate);
  const {
    loading: loadingServiceUpdate,
    error: errorServiceUpdate,
    success: successServiceUpdate,
    service: updatedService,
  } = serviceUpdate;

  const serviceRemove = useSelector((state) => state.serviceRemove);
  const {
    loading: loadingServiceRemove,
    error: errorServiceRemove,
    success: successServiceRemove,
  } = serviceRemove;

  const directionForm = useFormik({
    initialValues: directionInitialValues,
    validationSchema: validationDirectionSchema,
    onSubmit: (values) => {
      const { directionLibelle, directeur } = values;

      if (!isDirectionUpdateForm) {
        dispatch(
          createDirection({ libelle: directionLibelle, directeur: directeur })
        );
      } else {
        dispatch(
          updateDirection(updatedDirectionId, {
            libelle: directionLibelle,
            directeur: directeur,
          })
        );
      }
    },
  });

  const serviceForm = useFormik({
    initialValues: serviceInitialValues,
    validationSchema: validationServiceSchema,
    onSubmit: (values) => {
      const { serviceLibelle, chefService } = values;

      if (!isServiceUpdateForm) {
        dispatch(
          createService({
            libelle: serviceLibelle,
            direction: selectedDirection,
            chefService: chefService,
          })
        );
      } else {
        dispatch(
          updateService(updatedServiceId, {
            libelle: serviceLibelle,
            chefService: chefService,
          })
        );
      }
    },
  });

  // direction :
  const hideDirectionModalHandler = () => {
    setDirectionShow(false);
    setIsDirectionUpdateForm(false);
    directionForm.resetForm();
  };

  const removeDirectionHandler = (id) => {
    Dialog.open({
      title: "Confirmation",
      message: "Etes vous sûre de vouloir supprimer cette direction ?",
      onYes: () => {
        dispatch(removeDirection(id));
      },
    });
  };

  const updateDirectionHandler = (id) => {
    setDirectionShow(true);
    setIsDirectionUpdateForm(true);
    setUpdatedDirectionId(id);
    console.log(id)
    const upLibelle = directions.find(
      (dir) => String(dir._id) === String(id)
    ).libelle;

    const directeur = directions.find(
      (dir) => String(dir._id) === String(id)
    ).directeur;
    const upDirecteur = directeur ? directeur._id : null;
    const directionObject = {
      directionLibelle: upLibelle,
      directeur: upDirecteur,
    };
    directionForm.setValues(directionObject);
  };

  // sous-categorie :
  const hideServiceModalHandler = () => {
    setServiceShow(false);
    setIsServiceUpdateForm(false);
    serviceForm.resetForm();
    dispatch(resetUpdateService());
    dispatch(resetCreateService());
  };

  const getServicesHandler = (id) => {
    setSelectedDirection(id);
    const upLibelle = directions.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;
    setSelectedDirectionLibelle(upLibelle);
    dispatch(fetchServicesByDirectionID(id));
  };

  const removeServiceHandler = (id) => {
    Dialog.open({
      title: "Confirmation",
      message: "Etes vous sûre de vouloir supprimer ce service ?",
      onYes: () => {
        dispatch(removeService(id));
      },
    });
  };

  const updateServiceHandler = (id) => {
    setServiceShow(true);
    setIsServiceUpdateForm(true);
    setUpdatedServiceId(id);
    const chefService = services.find(
      (srv) => String(srv._id) === String(id)
    ).chefService;
    const upChefService = chefService ? chefService._id : null;
    const upLibelle = services.find(
      (cat) => String(cat._id) === String(id)
    ).libelle;
    const serviceObject = {
      serviceLibelle: upLibelle,
      chefService: upChefService,
    };

    serviceForm.setValues(serviceObject);
  };

  useEffect(() => {
    if (createdDirectionCreate) {
      dispatch(resetCreateDirection());
      setDirectionShow(false);
      directionForm.resetForm();
      Toast.open({
        type: "success",
        title: "Creation avec success",
        message: "la direction a été ajoutée avec succès",
      });
    }

    if (successDirectionRemove) {
      dispatch(resetRemoveDirection());
      dispatch(resetFetchServicesByDirectionID());
      setSelectedDirection(null);
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `la direction a été supprimée avec succès`,
      });
    }

    if (successDirectionUpdate) {
      dispatch(resetUpdateDirection());
      setSelectedDirectionLibelle(updatedDirection.libelle);
      setDirectionShow(false);
      directionForm.resetForm();
    }

    if (createdService) {
      dispatch(resetCreateService());
      setServiceShow(false);
      serviceForm.resetForm();
      Toast.open({
        type: "success",
        title: "Creation avec success",
        message: "le service a été ajoutée avec succès",
      });
    }

    if (successServiceRemove) {
      dispatch(resetRemoveService());

      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `le service a été supprimée avec succès`,
      });
    }

    if (successServiceUpdate) {
      dispatch(resetUpdateService());

      setServiceShow(false);
      serviceForm.resetForm();
    }

    if (!callOnce) {
      dispatch(fetchDirections());
      dispatch(fetchDirecteursUsers());
      dispatch(fetchChefServicesUsers());

      setCallOnce(true);
    }
  }, [
    callOnce,
    dispatch,
    createdDirectionCreate,
    successDirectionRemove,
    successDirectionUpdate,
    updatedDirection,
    createdService,
    successServiceRemove,
    successServiceUpdate,
    updatedService,
  ]);

  return (
    <>
      {/* Begin Add Direction Modal*/}
      <Modal
        centered
        size="md"
        show={directionShow}
        onHide={hideDirectionModalHandler}
      >
        <Modal.Header closeButton>
          <h6>direction</h6>
        </Modal.Header>
        <Modal.Body>
          {loadingDirectionCreate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingDirectionUpdate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorDirectionCreate && (
            <Message itWillBeHidden={true} type="danger">
              {errorDirectionCreate}
            </Message>
          )}
          {errorDirectionUpdate && (
            <Message itWillBeHidden={true} type="danger">
              {errorDirectionUpdate}
            </Message>
          )}
          <Form onSubmit={directionForm.handleSubmit}>
            <label>libelle</label>
            <Form.Control
              placeholder="Exp: Financiere, Infrastructures et système d information ..."
              disabled={loadingDirectionCreate}
              name="directionLibelle"
              onChange={directionForm.handleChange}
              onBlur={directionForm.handleBlur}
              value={directionForm.values.directionLibelle}
            />
            {directionForm.touched.directionLibelle &&
              directionForm.errors.directionLibelle && (
                <small className="text-danger d-block">
                  {directionForm.errors.directionLibelle}
                </small>
              )}
            <label className="mt-3">directeur</label>
            <Form.Select
              disabled={loadingDirecteurList || loadingDirectionCreate}
              name="directeur"
              onChange={directionForm.handleChange}
              onBlur={directionForm.handleBlur}
              value={directionForm.values.directeur}
            >
              <option value={""}>
                ---- veuillez selectionner un utilisateur (directeur) ----
              </option>
              {directeurs.length > 0 &&
                directeurs.map((utilisateur) => (
                  <option key={utilisateur._id} value={utilisateur._id}>
                    {utilisateur.prenom} {utilisateur.nom}
                  </option>
                ))}
            </Form.Select>
            {directionForm.touched.directeur &&
              directionForm.errors.directeur && (
                <small className="text-danger d-block">
                  {directionForm.errors.directeur}
                </small>
              )}
            <Button variant="dark" className="mt-3 w-100" type="submit">
              submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* End Add Direction Modal*/}

      {/* Begin Add Service Modal*/}
      <Modal
        centered
        size="md"
        show={serviceShow}
        onHide={hideServiceModalHandler}
      >
        <Modal.Header closeButton>
          <h6>service</h6>
        </Modal.Header>
        <Modal.Body>
          {loadingServiceCreate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {loadingServiceUpdate && (
            <div className="d-flex justify-content-center">
              <Loader size={"md"} />
            </div>
          )}
          {errorServiceCreate && (
            <Message itWillBeHidden={true} type="danger">
              {errorServiceCreate}
            </Message>
          )}
          {errorServiceUpdate && (
            <Message itWillBeHidden={true} type="danger">
              {errorServiceUpdate}
            </Message>
          )}
          {errorChefServiceList && (
            <Message itWillBeHidden={true} type="danger">
              {errorChefServiceList}
            </Message>
          )}
          <Form onSubmit={serviceForm.handleSubmit}>
            <label>libelle</label>
            <Form.Control
              name="serviceLibelle"
              value={serviceForm.values.serviceLibelle}
              placeholder="Exp: comptabilité, production informatique ..."
              onChange={serviceForm.handleChange}
              onBlur={serviceForm.handleBlur}
            />
            {serviceForm.touched.serviceLibelle &&
              serviceForm.errors.serviceLibelle && (
                <small className="text-danger d-block">
                  {serviceForm.errors.serviceLibelle}
                </small>
              )}
            <label className="mt-3">chef de service</label>
            <Form.Select
              disabled={loadingChefServiceList || loadingServiceCreate}
              name="chefService"
              onChange={serviceForm.handleChange}
              onBlur={serviceForm.handleBlur}
              value={serviceForm.values.chefService}
            >
              <option value={""}>
                ---- veuillez selectionner un utilisateur (chef de service) ----
              </option>
              {chefServices.length > 0 &&
                chefServices.map((utilisateur) => (
                  <option key={utilisateur._id} value={utilisateur._id}>
                    {utilisateur.prenom} {utilisateur.nom}
                  </option>
                ))}
            </Form.Select>
            {serviceForm.touched.chefService &&
              serviceForm.errors.chefService && (
                <small className="text-danger d-block">
                  {serviceForm.errors.chefService}
                </small>
              )}
            <Button variant="dark" className="mt-3 w-100" type="submit">
              submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* End Add Service Modal*/}

      {errorDirecteurist && (
        <Message itWillBeHidden={true} type="danger">
          {errorDirecteurist}
        </Message>
      )}
      {errorDirectionList && (
        <Message itWillBeHidden={true} type="danger">
          {errorDirectionList}
        </Message>
      )}
      {errorDirectionRemove && (
        <Message itWillBeHidden={true} type="danger">
          {errorDirectionRemove}
        </Message>
      )}

      {errorServiceListByDirectionID && (
        <Message itWillBeHidden={true} type="danger">
          {errorServiceListByDirectionID}
        </Message>
      )}

      {errorServiceRemove && (
        <Message itWillBeHidden={true} type="danger">
          {errorServiceRemove}
        </Message>
      )}
      <Message variant="info">
        Pour afficher les enfants d'une ligne (direction) vous devez cliquer sur
        la ligne dans le tableau
      </Message>

      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-end">
            <Button
              size="sm"
              variant="dark"
              onClick={(e) => {
                setIsDirectionUpdateForm(false);
                setDirectionShow(true);
              }}
            >
              <i className="fas fa-plus"></i> Ajouter une direction
            </Button>
          </div>
          {loadingDirectionList && <TableLoading />}
          {directions.length > 0 ? (
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
                  Header: "directeur",
                  accessor: (row) => {
                    const { directeur } = row;
                    if (directeur)
                      return `${directeur.nom} ${directeur.prenom}`;
                  },
                  filter: "directeur",
                  Cell: ({ row }) => {
                    const { directeur } = row.original;
                    if (directeur && directeur.nom) {
                      return `${directeur.nom} ${directeur.prenom || ""}`;
                    }
                    return "";
                  },
                },
              ]}
              data={directions}
              loadingRemove={loadingDirectionRemove}
              // removeRow={removeDirectionHandler}
              updateRow={updateDirectionHandler}
              rowClick={getServicesHandler}
              dropdownFilters={[`directeur`]}
            />
          ) : (
            successDirectionList && (
              <WarningMessage message={"Aucune direction trouvée"} />
            )
          )}
        </Card.Body>
      </Card>
      <hr />
      {selectedDirection ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <p className="mt-1">
                <small>direction sélectionnée :</small>{" "}
                <span style={{ fontWeight: "bold" }}>
                  {selectedDirectionLibelle}
                </span>
              </p>
              <Button
                size="sm"
                variant="dark"
                onClick={(e) => {
                  setIsServiceUpdateForm(false);
                  setServiceShow(true);
                }}
              >
                <i className="fas fa-plus"></i> Ajouter un service
              </Button>
            </div>
            {loadingServiceListByDirectionID && <TableLoading />}
            {services.length > 0 ? (
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
                    Header: "chef de service",
                    accessor: (row) => {
                      const { chefService } = row;
                      if (chefService)
                        return `${chefService.nom} ${chefService.prenom}`;
                    },
                    filter: "chefService",
                    Cell: ({ row }) => {
                      const { chefService } = row.original;
                      if (chefService && chefService.nom) {
                        return `${chefService.nom} ${chefService.prenom || ""}`;
                      }
                      return "";
                    },
                  },
                ]}
                data={services}
                loadingRemove={loadingServiceRemove}
                // removeRow={removeServiceHandler}
                updateRow={updateServiceHandler}
              />
            ) : (
              successServiceListByDirectionID && (
                <WarningMessage message={"Aucune service trouvée"} />
              )
            )}
          </Card.Body>
        </Card>
      ) : (
        <WarningMessage message={"Aucune service selectionnée"} />
      )}
    </>
  );
};

export default DirectionListPage;

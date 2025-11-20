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
import { Dialog, Toast } from "../../services/";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchServices,
  createService,
  updateService,
  removeService,
  resetCreateService,
  resetUpdateService,
  resetRemoveService,
} from "../../redux/service/serviceActions";

const ServiceListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);

  const dispatch = useDispatch();

  const serviceList = useSelector((state) => state.serviceList);
  const {
    loading: loadingServiceList,
    error: errorServiceList,
    success: successServiceList,
    services,
  } = serviceList;

  const serviceCreate = useSelector((state) => state.serviceCreate);
  const {
    loading: loadingServiceCreate,
    error: errorServiceCreate,
    success: successServiceCreate,
  } = serviceCreate;

  const serviceUpdate = useSelector((state) => state.serviceUpdate);
  const {
    loading: loadingServiceUpdate,
    error: errorServiceUpdate,
    success: successServiceUpdate,
  } = serviceUpdate;

  const serviceDelete = useSelector((state) => state.serviceDelete);
  const {
    loading: loadingServiceDelete,
    error: errorServiceDelete,
    success: successServiceDelete,
  } = serviceDelete;

  const validationSchema = Yup.object({
    libelle: Yup.string().required("Le libellé est requis"),
    departement: Yup.string().required("Le département est requis"),
  });

  const formik = useFormik({
    initialValues: {
      libelle: "",
      departement: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (isUpdate && editingService) {
        dispatch(updateService(editingService._id, values));
      } else {
        dispatch(createService(values));
      }
    },
  });

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchServices());
      setCallOnce(true);
    }
  }, [callOnce, dispatch]);

  useEffect(() => {
    if (successServiceCreate) {
      dispatch(resetCreateService());
      setShowModal(false);
      formik.resetForm();
      dispatch(fetchServices());
      Toast.open({
        type: "success",
        title: "Service créé",
        message: "Le service a été créé avec succès",
      });
    }
  }, [successServiceCreate, dispatch]);

  useEffect(() => {
    if (successServiceUpdate) {
      dispatch(resetUpdateService());
      setShowModal(false);
      setEditingService(null);
      setIsUpdate(false);
      formik.resetForm();
      dispatch(fetchServices());
      Toast.open({
        type: "success",
        title: "Service modifié",
        message: "Le service a été modifié avec succès",
      });
    }
  }, [successServiceUpdate, dispatch]);

  useEffect(() => {
    if (successServiceDelete) {
      dispatch(resetRemoveService());
      dispatch(fetchServices());
      Toast.open({
        type: "success",
        title: "Service supprimé",
        message: "Le service a été supprimé avec succès",
      });
    }
  }, [successServiceDelete, dispatch]);

  const handleEdit = (service) => {
    setEditingService(service);
    setIsUpdate(true);
    formik.setValues({
      libelle: service.libelle,
      departement: service.departement?._id || "",
    });
    setShowModal(true);
  };

  const handleDelete = (serviceId) => {
    Dialog.open({
      title: "Confirmation",
      message: "Êtes-vous sûr de vouloir supprimer ce service ?",
      onYes: () => {
        dispatch(removeService(serviceId));
      },
    });
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsUpdate(false);
    formik.resetForm();
    setShowModal(true);
  };

  const columns = [
    {
      Header: "Libellé",
      accessor: "libelle",
    },
    {
      Header: "Département",
      accessor: (row) => row.departement?.libelle || "N/A",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(row.original)}
          >
            <i className="fas fa-edit"></i>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.original._id)}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Gestion des Services</h4>
        <Button variant="primary" onClick={handleAdd}>
          <i className="fas fa-plus"></i> Ajouter un service
        </Button>
      </Card.Header>
      <Card.Body>
        {errorServiceList && (
          <Message type="danger" itWillBeHidden>
            {errorServiceList}
          </Message>
        )}
        {errorServiceCreate && (
          <Message type="danger" itWillBeHidden>
            {errorServiceCreate}
          </Message>
        )}
        {errorServiceUpdate && (
          <Message type="danger" itWillBeHidden>
            {errorServiceUpdate}
          </Message>
        )}
        {errorServiceDelete && (
          <Message type="danger" itWillBeHidden>
            {errorServiceDelete}
          </Message>
        )}

        {loadingServiceList ? (
          <TableLoading />
        ) : services && services.length > 0 ? (
          <Table columns={columns} data={services} />
        ) : (
          <WarningMessage message="Aucun service trouvé" />
        )}
      </Card.Body>

      {}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isUpdate ? "Modifier le service" : "Ajouter un service"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Libellé *</Form.Label>
              <Form.Control
                type="text"
                name="libelle"
                value={formik.values.libelle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.libelle && formik.errors.libelle}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.libelle}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Département *</Form.Label>
              <Form.Control
                type="text"
                name="departement"
                value={formik.values.departement}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.departement && formik.errors.departement}
                placeholder="ID du département"
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.departement}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loadingServiceCreate || loadingServiceUpdate}
            >
              {loadingServiceCreate || loadingServiceUpdate ? (
                <Loader />
              ) : isUpdate ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ServiceListPage;

import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createUser, resetCreateUser } from "../../redux/user/userActions";
import { Loader, Message } from "../../components";
import {

  fetchServicesByDirectionID,
} from "../../redux/service/serviceActions";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../../services";
import { fetchDirections } from "../../redux/direction/directionActions";

const validationSchema = Yup.object({
  matricule: Yup.string("le matricule doit etre un nombre de 7 chiffres")
    .matches(
      /^([1-9]{1})([0-9]{6})$/,
      "le matricule doit être un nombre qui comporte 7 chiffres"
    )
    .required("il faut saisire le matricule"),
  email: Yup.string()
    .email("email invalid !!")
    .required("il fait saisire l'email de l'utilisateur"),
  nom: Yup.string().required("il faut saisire un nom"),
  prenom: Yup.string().required("il faut saisire un prenom"),
  fonction: Yup.string(),
  gsm: Yup.string().matches(/^\+\d{1,4}-\d{1,14}$/, "gsm invalid !!"),
  direction: Yup.string(),
  service: Yup.string(),
  isChefDeService: Yup.boolean(),
  isDirecteur: Yup.boolean(),
  demandeur: Yup.boolean(),
  signataire: Yup.boolean(),
  createur: Yup.boolean(),
  password: Yup.string().required("il faut saisire le mot de passe !"),
  confirmPassword: Yup.string().required(
    "il faut saisire le mot de passe de confirmation !"
  ),
});

const UtilisateurCreatePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const [initialValues] = useState({
    matricule: "",
    email: "",
    nom: "",
    prenom: "",
    fonction: "",
    gsm: "",
    direction: "",
    service: "",
    isChefDeService: false,
    isDirecteur: false,
    demandeur: false,
    signataire: false,
    createur: false,
    password: "",
    confirmPassword: "",
  });

  const serviceListByDirectionID = useSelector(
    (state) => state.serviceListByDirectionID
  );
  const {
    loading: loadingServiceListByDirectionID,
    error: errorServiceListByDirectionID,
    services,
  } = serviceListByDirectionID;

  const userCreate = useSelector((state) => state.userCreate);
  const {
    loading: loadingUserCreate,
    error: errorUserCreate,
    success: successUserCreate,
    user: createdUser,
  } = userCreate;

  const directionList = useSelector((state) => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    // success: successDirectionList,
    directions,
  } = directionList;

  const getServicesHandler = (event) => {
    dispatch(fetchServicesByDirectionID(event.target.value));
  };

  const form = useFormik({
    initialValues,
    validationSchema,
    validate: (values) => {
      const errors = {};
      if (!values.demandeur && !values.signataire && !values.createur)
        errors.atLeastOneChecked = "au moins un de ces champs doit être coché";

      return errors;
    },
    onSubmit: (values) => {
      const {
        email,
        nom,
        prenom,
        matricule,
        fonction,
        gsm,
        service,
        direction,
        isChefDeService,
        isDirecteur,
        demandeur,
        signataire,
        createur,
        password,
        confirmPassword,
      } = values;
      setMessage(null);
      if (isChefDeService && (!service || service === "")) {
        setMessage(
          "un chef de service doit obligatoirement appartenir à un service."
        );
      } else if (String(password) === String(confirmPassword)) {
        const roles = [];
        if (demandeur) roles.push("dmr");
        if (createur) roles.push("crt");
        if (signataire) roles.push("sig");

        const user = {
          matricule,
          email,
          nom,
          prenom,
          fonction,
          gsm,
          direction,
          isChefDeService,
          isDirecteur,
          roles,
          password,
        };
        if (!isDirecteur) {
          user.service = service;
        }

        dispatch(createUser(user));
      } else {
        setMessage(
          "le mot de passe et le mot de passe de confirmation ne correspondent pas"
        );
        setTimeout(() => {
          setMessage(null);
        }, 7000);
      }
      window.scrollTo(0, 0);
    },
  });

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchDirections());
      setCallOnce(true);
    }

    if (successUserCreate && createdUser) {
      if (!errorUserCreate) {
        form.resetForm();
        Toast.open({
          type: "success",
          title: "Creation avec success",
          message: "l'utilisateur a été creer avec succès",
        });
      }
    }
  }, [callOnce, successUserCreate, createdUser, errorUserCreate]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to="/utilisateurs"
          className="btn btn-sm btn-light mb-3"
          onClick={() => {
            dispatch(resetCreateUser());
          }}
        >
          <i className="fas fa-arrow-left"></i> utilisateurs
        </Link>
      </div>

      {errorServiceListByDirectionID && (
        <Message type="danger" itWillBeHidden>
          {errorServiceListByDirectionID}
        </Message>
      )}
      {errorUserCreate && (
        <Message type="danger" itWillBeHidden>
          {errorUserCreate}
        </Message>
      )}

      {errorDirectionList && (
        <Message type="danger" itWillBeHidden>
          {errorDirectionList}
        </Message>
      )}
      {message && <Message type="danger">{message}</Message>}
      {loadingUserCreate && <Loader />}
      <Card>
        <Card.Body>
          <Form onSubmit={form.handleSubmit}>
            <Row>
              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>matricule :</label>
                  <Form.Control
                    placeholder="veuillez saisir le matricule"
                    name="matricule"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.matricule}
                  />
                  <small className="text-warning d-block">
                    <i className="fa-solid fa-triangle-exclamation"></i> le
                    matricule ne doit pas commencer par le chiffre 0
                  </small>
                  {form.touched.matricule && form.errors.matricule && (
                    <small className="text-danger d-block">
                      {form.errors.matricule}
                    </small>
                  )}
                </div>
              </Col>
              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>Email :</label>
                  <Form.Control
                    placeholder="veuillez saisir l'email"
                    name="email"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.email}
                  />
                  {form.touched.email && form.errors.email && (
                    <small className="text-danger d-block">
                      {form.errors.email}
                    </small>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>Nom :</label>
                  <Form.Control
                    placeholder="veuillez saisir le nom"
                    name="nom"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.nom}
                  />
                  {form.touched.nom && form.errors.nom && (
                    <small className="text-danger d-block">
                      {form.errors.nom}
                    </small>
                  )}
                </div>
              </Col>
              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>Prenom :</label>
                  <Form.Control
                    placeholder="veuillez saisir le prenom"
                    name="prenom"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.prenom}
                  />
                  {form.touched.prenom && form.errors.prenom && (
                    <small className="text-danger d-block">
                      {form.errors.prenom}
                    </small>
                  )}
                </div>
              </Col>
            </Row>

            <Row>
              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>Fonction :</label>
                  <Form.Control
                    placeholder="veuillez saisir le fonction"
                    name="fonction"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.fonction}
                  />
                  {form.touched.fonction && form.errors.fonction && (
                    <small className="text-danger d-block">
                      {form.errors.fonction}
                    </small>
                  )}
                </div>
              </Col>

              <Col xl={6} lg={6} md={6} sm={12}>
                <div>
                  <label>GSM :</label>
                  <Form.Control
                    placeholder="veuillez saisir le gsm (numero de telephone)"
                    name="gsm"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.gsm}
                  />
                  {form.touched.gsm && form.errors.gsm && (
                    <small className="text-danger d-block">
                      {form.errors.gsm}
                    </small>
                  )}
                </div>
              </Col>
            </Row>

            <Row>
              <Col xl={12} lg={12} md={12} sm={12}>
                <div>
                  <label>Direction :</label>
                  <Form.Select
                    disabled={loadingDirectionList}
                    name="direction"
                    onChange={(event) => {
                      form.handleChange(event);
                      getServicesHandler(event);
                    }}
                    onBlur={form.handleBlur}
                    value={form.values.direction}
                  >
                    <option value="">
                      ---- veuillez selectionner une direction ----
                    </option>
                    {directions.length > 0 &&
                      directions.map((direction) => (
                        <option key={direction._id} value={direction._id}>
                          {direction.libelle}
                        </option>
                      ))}
                  </Form.Select>
                  {form.touched.direction && form.errors.direction && (
                    <small className="text-danger d-block">
                      {form.errors.direction}
                    </small>
                  )}
                </div>
              </Col>
              {!form.values.isDirecteur && (
                <Col xl={12} lg={12} md={12} sm={12}>
                  <div>
                    <label>Service :</label>
                    <Form.Select
                      disabled={
                        loadingServiceListByDirectionID ||
                        !form.values.direction
                      }
                      name="service"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.service}
                    >
                      <option value="">
                        ---- veuillez selectionner un service ----
                      </option>
                      {services.length > 0 &&
                        services.map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.libelle}
                          </option>
                        ))}
                    </Form.Select>
                    {form.touched.service && form.errors.service && (
                      <small className="text-danger d-block">
                        {form.errors.service}
                      </small>
                    )}
                  </div>
                </Col>
              )}
            </Row>
            <Row>
              <Col xl={12} lg={12} md={12} sm={12}>
                <h5 className="mt-3">Poste de responsabilité :</h5>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12}>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    form.setValues({
                      matricule: form.values.matricule,
                      email: form.values.email,
                      nom: form.values.nom,
                      prenom: form.values.prenom,
                      fonction: form.values.fonction,
                      gsm: form.values.gsm,
                      direction: form.values.direction,
                      service: form.values.service,
                      demandeur: form.values.demandeur,
                      createur: form.values.createur,
                      signataire: form.values.signataire,
                      password: form.values.password,
                      confirmPassword: form.values.confirmPassword,
                      isChefDeService: false,
                      isDirecteur: false,
                    });
                  }}
                >
                  décoche
                </Button>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12}>
                <div className="d-flex align-items-center">
                  <div className="d-flex justify-content-start align-items-center mr-2">
                    <label className="mr-1">Chef de service :</label>
                    <Form.Check
                      name="isChefDeService"
                      onChange={(event) => {
                        form.handleChange(event);
                        form.setValues({
                          matricule: form.values.matricule,
                          email: form.values.email,
                          nom: form.values.nom,
                          prenom: form.values.prenom,
                          fonction: form.values.fonction,
                          gsm: form.values.gsm,
                          direction: form.values.direction,
                          service: form.values.service,
                          demandeur: form.values.demandeur,
                          createur: form.values.createur,
                          signataire: form.values.signataire,
                          confirmPassword: form.values.confirmPassword,
                          password: form.values.password,
                          isDirecteur: false,
                          isChefDeService: true,
                        });
                      }}
                      onBlur={form.handleBlur}
                      value={form.values.isChefDeService}
                      checked={form.values.isChefDeService}
                    />
                    {form.touched.isChefDeService &&
                      form.errors.isChefDeService && (
                        <small className="text-danger d-block">
                          {form.errors.isChefDeService}
                        </small>
                      )}
                  </div>
                  <div className="d-flex justify-content-start align-items-center mr-2">
                    <label className="mr-1">Directeur:</label>
                    <Form.Check
                      name="isDirecteur"
                      onChange={(event) => {
                        form.handleChange(event);
                        form.setValues({
                          matricule: form.values.matricule,
                          email: form.values.email,
                          nom: form.values.nom,
                          prenom: form.values.prenom,
                          fonction: form.values.fonction,
                          gsm: form.values.gsm,
                          direction: form.values.direction,
                          service: form.values.service,
                          demandeur: form.values.demandeur,
                          createur: form.values.createur,
                          signataire: form.values.signataire,
                          password: form.values.password,
                          confirmPassword: form.values.confirmPassword,

                          isChefDeService: false,
                          isDirecteur: true,
                        });
                      }}
                      onBlur={form.handleBlur}
                      value={form.values.isDirecteur}
                      checked={form.values.isDirecteur}
                    />
                    {form.touched.isDirecteur && form.errors.isDirecteur && (
                      <small className="text-danger d-block">
                        {form.errors.isDirecteur}
                      </small>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Row>
              <Col xl={12} lg={12} md={12} sm={12}>
                <h5 className="mt-3">Roles :</h5>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12}>
                <div className="d-flex align-items-center">
                  <div className="d-flex justify-content-start align-items-center mr-2">
                    <label className="mr-1">Demandeur :</label>
                    <Form.Check
                      name="demandeur"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.demandeur}
                      checked={form.values.demandeur}
                    />
                    {form.touched.demandeur && form.errors.demandeur && (
                      <small className="text-danger d-block">
                        {form.errors.demandeur}
                      </small>
                    )}
                  </div>
                  <div className="d-flex justify-content-start align-items-center mr-2">
                    <label className="mr-1">Signataire :</label>
                    <Form.Check
                      name="signataire"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.signataire}
                      checked={form.values.signataire}
                    />
                    {form.touched.signataire && form.errors.signataire && (
                      <small className="text-danger d-block">
                        {form.errors.signataire}
                      </small>
                    )}
                  </div>
                  <div className="d-flex justify-content-start align-items-center mr-2">
                    <label className="mr-1">Createur :</label>
                    <Form.Check
                      name="createur"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.createur}
                      checked={form.values.createur}
                    />
                    {form.touched.createur && form.errors.createur && (
                      <small className="text-danger d-block">
                        {form.errors.createur}
                      </small>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            {form.errors && form.errors["atLeastOneChecked"] && (
              <small className="text-danger d-block">
                {form.errors["atLeastOneChecked"]}
              </small>
            )}
            <Row>
              <Col xl={12} lg={12} md={12} sm={12}>
                <div>
                  <label>Mot de passe :</label>
                  <Form.Control
                    placeholder="veuillez saisir le mot de passe"
                    name="password"
                    type="password"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.password}
                  />
                  {form.touched.password && form.errors.password && (
                    <small className="text-danger d-block">
                      {form.errors.password}
                    </small>
                  )}
                </div>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12}>
                <div>
                  <label>Confirmer le mot de passe :</label>
                  <Form.Control
                    placeholder="veuillez saisir le mot de passe de confirmation"
                    name="confirmPassword"
                    type="password"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.confirmPassword}
                  />
                  {form.touched.confirmPassword &&
                    form.errors.confirmPassword && (
                      <small className="text-danger d-block">
                        {form.errors.confirmPassword}
                      </small>
                    )}
                </div>
              </Col>
            </Row>

            <Button className="w-100 mt-3" type="submit">
              <i className="fa-solid fa-user-plus"></i> creer
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default UtilisateurCreatePage;

import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  fetchUserByID,
  resetFetchUserByID,
  resetUpdateUser,
  resetUpdateUserPassword,
  updateUser,
  updateUserPassword,
} from "../../redux/user/userActions";
import { Loader, Message, WarningMessage } from "../../components";
import { fetchServicesByDirectionID } from "../../redux/service/serviceActions";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../../services";
import { fetchDirections } from "../../redux/direction/directionActions";

const validationSchema = Yup.object({
  matricule: Yup.string("le matricule doit etre un nombre de 6 chiffres")
    .matches(
      /^([1-9]{1})([0-9]{6})$/,
      "le matricule doit être un nombre qui comporte 6 chiffres"
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
  //service: Yup.string(),
  isChefDeService: Yup.boolean(),
  isDirecteur: Yup.boolean(),
  demandeur: Yup.boolean(),
  signataire: Yup.boolean(),
  createur: Yup.boolean(),
  createurOption: Yup.boolean(),

});
const changePasswordvalidationSchema = Yup.object({
  password: Yup.string().required("il faut saisire le mot de passe !"),
  confirmPassword: Yup.string().required(
    "il faut saisire le mot de passe de confirmation !"
  ),
});

const UtilisateurUpdatePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const userByID = useSelector(state => state.userByID);
  const {
    loading: loadingUserByID,
    error: errorUserByID,
    user: recoveredUser,
    success: successUserByID,
  } = userByID;

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
    createurOption: false,
  });

  const userUpdate = useSelector(state => state.userUpdate);
  const {
    loading: loadingUserUpdate,
    error: errorUserUpdate,
    success: successUserUpdate,
    user: updatedUser,
  } = userUpdate;

  const userUpdatePassword = useSelector(state => state.userUpdatePassword);
  const {
    loading: loadingUserUpdatePassword,
    error: errorUserUpdatePassword,
    success: successUserUpdatePassword,
  } = userUpdatePassword;

  const serviceListByDirectionID = useSelector(
    state => state.serviceListByDirectionID
  );
  const {
    loading: loadingServiceListByDirectionID,
    error: errorServiceListByDirectionID,
    services,
  } = serviceListByDirectionID;

  const directionList = useSelector(state => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    // success: successDirectionList,
    directions,
  } = directionList;

  const getServicesHandler = event => {
    dispatch(fetchServicesByDirectionID(event.target.value));
  };

  const form = useFormik({
    initialValues,
    validationSchema,
    validate: values => {
      const errors = {};

      if (!values.demandeur && !values.signataire && !values.createur) {
        errors.atLeastOneChecked = "au moins un de ces champs doit être coché";
      }

      // Add more specific validations if needed

      return errors;
    },
    onSubmit: values => {
      const {
        email,
        nom,
        prenom,
        matricule,
        fonction,
        gsm,
        direction,
        service,
        isChefDeService,
        isDirecteur,
        demandeur,
        signataire,
        createur,
        createurOption
      } = values;

      if (isChefDeService && (!service || service === "")) {
        setMessage(
          "un chef de service doit obligatoirement appartenir à un service."
        );
      } else {
        const roles = [];

        if (demandeur) roles.push("dmr");
        if (createur) roles.push("crt");
        if (signataire) roles.push("sig");
        if (createurOption) roles.push("crt-op");


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
        };
        if (!isDirecteur) user.service = service;

        dispatch(updateUser(id, user));
      }
      window.scrollTo(0, 0);
    },
  });

  const changePasswordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordvalidationSchema,
    onSubmit: values => {
      const { password, confirmPassword } = values;
      if (String(password) === String(confirmPassword)) {
        dispatch(updateUserPassword(id, password));
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
      dispatch(resetFetchUserByID());
      dispatch(resetUpdateUser());
      dispatch(fetchDirections());
      dispatch(fetchUserByID(id));
      setCallOnce(true);
    }

    if (!loadingUserUpdate && successUserByID && recoveredUser) {
      if (!errorUserUpdate) {
        form.setValues({
          matricule: recoveredUser ? recoveredUser.matricule : "",
          email: recoveredUser ? recoveredUser.email : "",
          nom: recoveredUser ? recoveredUser.nom : "",
          prenom: recoveredUser ? recoveredUser.prenom : "",
          fonction: recoveredUser ? recoveredUser.fonction : "",
          gsm: recoveredUser ? recoveredUser.gsm : "",
          direction: recoveredUser
            ? recoveredUser.direction && recoveredUser.direction._id
            : "",
          service: recoveredUser
            ? recoveredUser.service && recoveredUser.service._id
            : "",
          isChefDeService: recoveredUser ? recoveredUser.isChefDeService : "",
          isDirecteur: recoveredUser ? recoveredUser.isDirecteur : "",
          createur:
            recoveredUser &&
              recoveredUser.roles.find(role => String(role.role.code) === "crt")
              ? true
              : false,
          createurOption:
            recoveredUser &&
              recoveredUser.roles.find(role => String(role.role.code) === "crt-op")
              ? true
              : false,
          signataire:
            recoveredUser &&
              recoveredUser.roles.find(role => String(role.role.code) === "sig")
              ? true
              : false,
          demandeur:
            recoveredUser &&
              recoveredUser.roles.find(role => String(role.role.code) === "dmr")
              ? true
              : false,
        });
        if (recoveredUser && recoveredUser.direction) {
          dispatch(fetchServicesByDirectionID(recoveredUser.direction._id));
        }
      }
    }
    if (successUserUpdate && updatedUser) {
      if (!errorUserUpdate) {
        form.setValues({
          matricule: updatedUser ? updatedUser.matricule : "",
          email: updatedUser ? updatedUser.email : "",
          nom: updatedUser ? updatedUser.nom : "",
          prenom: updatedUser ? updatedUser.prenom : "",
          fonction: updatedUser ? updatedUser.fonction : "",
          gsm: updatedUser ? updatedUser.gsm : "",
          direction: updatedUser
            ? updatedUser.direction && updatedUser.direction._id
            : "",
          service: updatedUser
            ? updatedUser.service && updatedUser.service._id
            : "",
          isChefDeService: updatedUser ? updatedUser.isChefDeService : "",
          isDirecteur: updatedUser ? updatedUser.isDirecteur : "",
          createur:
            updatedUser &&
              updatedUser.roles.find(role => String(role.role.code) === "crt")
              ? true
              : false,
          createurOption:
            updatedUser &&
              updatedUser.roles.find(role => String(role.role.code) === "crt-op")
              ? true
              : false,
          signataire:
            updatedUser &&
              updatedUser.roles.find(role => String(role.role.code) === "sig")
              ? true
              : false,
          demandeur:
            updatedUser &&
              updatedUser.roles.find(role => String(role.role.code) === "dmr")
              ? true
              : false,
        });
        Toast.open({
          type: "success",
          title: "Modification avec success",
          message: "l'utilisateur a été modifiée avec succès",
        });
      }
    }
    if (successUserUpdatePassword) {
      Toast.open({
        type: "success",
        title: "Modification avec success",
        message: "le mot de passe a été modifiée avec succès",
      });
      changePasswordForm.resetForm();
      dispatch(resetUpdateUserPassword());
    }
  }, [
    callOnce,
    successUserByID,
    recoveredUser,
    successUserUpdate,
    updatedUser,
    errorUserUpdate,
    loadingUserUpdate,
    successUserUpdatePassword,
  ]);
  return (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <Link
          to='/utilisateurs'
          className='btn btn-sm btn-light mb-3'
          onClick={() => {
            setCallOnce(false);
            dispatch(resetFetchUserByID());
          }}>
          <i className='fas fa-arrow-left'></i> utilisateurs
        </Link>
      </div>
      {errorUserByID && (
        <Message type='danger' itWillBeHidden>
          {errorUserByID}
        </Message>
      )}
      {errorServiceListByDirectionID && (
        <Message type='danger' itWillBeHidden>
          {errorServiceListByDirectionID}
        </Message>
      )}
      {errorUserUpdate && (
        <Message type='danger' itWillBeHidden>
          {errorUserUpdate}
        </Message>
      )}
      {errorUserUpdatePassword && (
        <Message type='danger' itWillBeHidden>
          {errorUserUpdatePassword}
        </Message>
      )}
      {message && <Message type='danger'>{message}</Message>}
      {loadingUserUpdate || (loadingUserUpdatePassword && <Loader />)}
      {errorDirectionList && (
        <Message type='danger' itWillBeHidden>
          {errorDirectionList}
        </Message>
      )}
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey='tab1' id='my-tabs'>
            <Tab eventKey='tab1' title='Modifier les informations'>
              <Form onSubmit={form.handleSubmit}>
                <Row>
                  <Col xl={6} lg={6} md={6} sm={12}>
                    <div>
                      <label>matricule :</label>
                      <Form.Control
                        disabled={loadingUserUpdate}
                        name='matricule'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.matricule}
                      />
                      <small className='text-warning d-block'>
                        <i className='fa-solid fa-triangle-exclamation'></i> le
                        matricule ne doit pas commencer par le chiffre 0
                      </small>
                      {form.touched.matricule && form.errors.matricule && (
                        <small className='text-danger d-block'>
                          {form.errors.matricule}
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col xl={6} lg={6} md={6} sm={12}>
                    <div>
                      <label>Email :</label>
                      <Form.Control
                        disabled={loadingUserUpdate}
                        name='email'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.email}
                      />
                      {form.touched.email && form.errors.email && (
                        <small className='text-danger d-block'>
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
                        disabled={loadingUserUpdate}
                        name='nom'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.nom}
                      />
                      {form.touched.nom && form.errors.nom && (
                        <small className='text-danger d-block'>
                          {form.errors.nom}
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col xl={6} lg={6} md={6} sm={12}>
                    <div>
                      <label>Prenom :</label>
                      <Form.Control
                        disabled={loadingUserUpdate}
                        name='prenom'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.prenom}
                      />
                      {form.touched.prenom && form.errors.prenom && (
                        <small className='text-danger d-block'>
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
                        disabled={loadingUserUpdate}
                        name='fonction'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.fonction}
                      />
                      {form.touched.fonction && form.errors.fonction && (
                        <small className='text-danger d-block'>
                          {form.errors.fonction}
                        </small>
                      )}
                    </div>
                  </Col>

                  <Col xl={6} lg={6} md={6} sm={12}>
                    <div>
                      <label>GSM :</label>
                      <Form.Control
                        disabled={loadingUserUpdate}
                        name='gsm'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.gsm}
                      />
                      {form.touched.gsm && form.errors.gsm && (
                        <small className='text-danger d-block'>
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
                        name='direction'
                        onChange={event => {
                          form.handleChange(event);
                          getServicesHandler(event);
                        }}
                        onBlur={form.handleBlur}
                        value={form.values.direction}>
                        <option value=''>
                          ---- veuillez selectionner une direction ----
                        </option>
                        {directions.length > 0 &&
                          directions.map(direction => (
                            <option key={direction._id} value={direction._id}>
                              {direction.libelle}
                            </option>
                          ))}
                      </Form.Select>
                      {form.touched.direction && form.errors.direction && (
                        <small className='text-danger d-block'>
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
                          name='service'
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          value={form.values.service}>
                          <option value=''>
                            ---- veuillez selectionner un service ----
                          </option>
                          {services.length > 0 &&
                            services.map(service => (
                              <option key={service._id} value={service._id}>
                                {service.libelle}
                              </option>
                            ))}
                        </Form.Select>
                        {form.touched.service && form.errors.service && (
                          <small className='text-danger d-block'>
                            {form.errors.service}
                          </small>
                        )}
                      </div>
                    </Col>
                  )}
                </Row>
                <Row>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <h5 className='mt-3'>Poste de responsabilité :</h5>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <Button
                      variant='light'
                      size='sm'
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
                          isChefDeService: false,
                          isDirecteur: false,
                        });
                      }}>
                      décoche
                    </Button>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <div className='d-flex align-items-center'>
                      <div className='d-flex justify-content-start align-items-center mr-2'>
                        <label className='mr-1'>Chef de service :</label>
                        <Form.Check
                          disabled={loadingUserUpdate}
                          name='isChefDeService'
                          onChange={event => {
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
                              createurOption: form.values.createurOption,
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
                            <small className='text-danger d-block'>
                              {form.errors.isChefDeService}
                            </small>
                          )}
                      </div>
                      <div className='d-flex justify-content-start align-items-center mr-2'>
                        <label className='mr-1'>Directeur:</label>
                        <Form.Check
                          disabled={loadingUserUpdate}
                          name='isDirecteur'
                          onChange={event => {
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
                              createurOption: form.values.createurOption,
                              isChefDeService: false,
                              isDirecteur: true,
                            });
                          }}
                          onBlur={form.handleBlur}
                          value={form.values.isDirecteur}
                          checked={form.values.isDirecteur}
                        />
                        {form.touched.isDirecteur &&
                          form.errors.isDirecteur && (
                            <small className='text-danger d-block'>
                              {form.errors.isDirecteur}
                            </small>
                          )}
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <h5 className='mt-3'>Roles :</h5>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <Row>
                      <Col xl={3} lg={3} md={12} sm={12}>
                        <div className='d-flex justify-content-start align-items-center mr-2'>
                          <label className='mr-1'>Demandeur :</label>
                          <Form.Check
                            disabled={loadingUserUpdate}
                            name='demandeur'
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.demandeur}
                            checked={form.values.demandeur}
                          />
                          {form.touched.demandeur && form.errors.demandeur && (
                            <small className='text-danger d-block'>
                              {form.errors.demandeur}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col xl={3} lg={3} md={12} sm={12}>
                        <div className='d-flex justify-content-start align-items-center mr-2'>
                          <label className='mr-1'>Signataire :</label>
                          <Form.Check
                            disabled={loadingUserUpdate}
                            name='signataire'
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.signataire}
                            checked={form.values.signataire}
                          />
                          {form.touched.signataire &&
                            form.errors.signataire && (
                              <small className='text-danger d-block'>
                                {form.errors.signataire}
                              </small>
                            )}
                        </div>
                      </Col>
                      <Col xl={3} lg={3} md={12} sm={12}>
                        <div className='d-flex justify-content-start align-items-center mr-2'>
                          <label className='mr-1'>Createur :</label>
                          <Form.Check
                            disabled={loadingUserUpdate}
                            name='createur'
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.createur}
                            checked={form.values.createur}
                          />
                          {form.touched.createur && form.errors.createur && (
                            <small className='text-danger d-block'>
                              {form.errors.createur}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col xl={3} lg={3} md={12} sm={12}>
                        <div className='d-flex justify-content-start align-items-center mr-2'>
                          <label className='mr-1'>Createur d'option :</label>
                          <Form.Check
                            disabled={loadingUserUpdate}
                            name='createurOption'
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            value={form.values.createurOption}
                            checked={form.values.createurOption}
                          />
                          {form.touched.createurOption && form.errors.createurOption && (
                            <small className='text-danger d-block'>
                              {form.errors.createurOption}
                            </small>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {form.errors && form.errors["atLeastOneChecked"] && (
                  <small className='text-danger d-block'>
                    {form.errors["atLeastOneChecked"]}
                  </small>
                )}

                <Button className='w-100 mt-3' type='submit' variant='dark'>
                  <i className='fa-solid fa-user-pen'></i> modifier
                </Button>
              </Form>
            </Tab>
            <Tab eventKey='tab2' title='Modifier le mot de passe'>
              <Form className='py-3' onSubmit={changePasswordForm.handleSubmit}>
                <div>
                  <label>Mot de passe :</label>
                  <Form.Control
                    placeholder='veuillez saisir le mot de passe'
                    name='password'
                    type={showPassword ? "text" : "password"}
                    onChange={changePasswordForm.handleChange}
                    onBlur={changePasswordForm.handleBlur}
                    value={changePasswordForm.values.password}
                  />
                  {changePasswordForm.touched.password &&
                    changePasswordForm.errors.password && (
                      <small className='text-danger d-block'>
                        {changePasswordForm.errors.password}
                      </small>
                    )}
                </div>

                <div>
                  <label>Confirmer le mot de passe :</label>
                  <Form.Control
                    placeholder='veuillez saisir le mot de passe de confirmation'
                    name='confirmPassword'
                    type={showPassword ? "text" : "password"}
                    onChange={changePasswordForm.handleChange}
                    onBlur={changePasswordForm.handleBlur}
                    value={changePasswordForm.values.confirmPassword}
                  />
                  {changePasswordForm.touched.confirmPassword &&
                    changePasswordForm.errors.confirmPassword && (
                      <small className='text-danger d-block'>
                        {changePasswordForm.errors.confirmPassword}
                      </small>
                    )}
                </div>
                <Form.Check
                  label='afficher le mot de passe'
                  type='switch'
                  className='mt-1'
                  onChange={() => setShowPassword(!showPassword)}
                />

                <Button className='w-100 mt-3' type='submit' variant='dark'>
                  <i className='fa-solid fa-key'></i> modifier le mot de passe
                </Button>
              </Form>
            </Tab>
          </Tabs>

          {!loadingUserByID && !recoveredUser && (
            <WarningMessage message={"utilisateur introuvable !"} />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default UtilisateurUpdatePage;

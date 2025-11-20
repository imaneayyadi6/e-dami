import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button, Card, Col, Form, Row, Tabs, Tab } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchUserByID,
  resetFetchUserByID,
  resetUpdateUser,
  resetUpdateUserPassword,
  updateUser,
  updateUserPassword,
  fetchUsers,
} from "../../redux/user/userActions";
import { Loader, Message, WarningMessage } from "../../components";
import { fetchServicesByDirectionID } from "../../redux/service/serviceActions";
import { fetchDepartementsByDirectionID } from "../../redux/departement/departementActions";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../../services";
import { fetchDirections } from "../../redux/direction/directionActions";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";
import { FaIdBadge, FaEnvelope, FaUser, FaBriefcase, FaPhone, FaBuilding, FaSitemap, FaUserTie, FaUserCheck, FaKey, FaEye, FaEyeSlash, FaKeyboard, FaEdit } from "react-icons/fa";

const getValidationSchema = (currentLanguage) => Yup.object({
  matricule: Yup.string(
    currentLanguage === "ar" ? "رقم الموظف يجب أن يكون 6 أرقام على الأقل" : "le matricule doit etre un nombre de 6 chiffres au minimum"
  )
    .matches(
      /^([1-9]{1})([0-9]{5,7})$/,
      currentLanguage === "ar" ? "رقم الموظف يجب أن يكون 6 أرقام على الأقل" : "le matricule doit être un nombre qui comporte 6 chiffres au minimum"
    )
    .required(currentLanguage === "ar" ? "يجب إدخال رقم الموظف" : "il faut saisire le matricule"),
  email: Yup.string()
    .email(currentLanguage === "ar" ? "البريد الإلكتروني غير صالح !!" : "email invalid !!")
    .required(currentLanguage === "ar" ? "يجب إدخال البريد الإلكتروني للمستخدم" : "il faut saisire l'email de l'utilisateur"),
  nom: Yup.string().required(currentLanguage === "ar" ? "يجب إدخال الاسم العائلي" : "il faut saisire un nom"),
  prenom: Yup.string().required(currentLanguage === "ar" ? "يجب إدخال الاسم الشخصي" : "il faut saisire un prenom"),
  fonction: Yup.string(),
  gsm: Yup.string()
    .test('gsm-format', currentLanguage === "ar" ? "رقم الهاتف غير صالح !!" : "GSM invalide !!", (value) => {
      if (!value) return true;
      const val = String(value).trim();
      
      const localMatch = /^0(5|6)\d{8}$/.test(val);
      if (localMatch) return true;
      
      if (/^\+/.test(val)) {
        const digits = val.replace(/[^0-9]/g, '');
        return digits.length >= 11 && digits.length <= 13;
      }
      return false;
    }),
  direction: Yup.string(),
  departement: Yup.string(),
  interim: Yup.string(),
  
  isChefDeService: Yup.boolean(),
  isDirecteur: Yup.boolean(),
  demandeur: Yup.boolean(),
  signataire: Yup.boolean(),
  createur: Yup.boolean(),
  createurOption: Yup.boolean(),
});

const getChangePasswordValidationSchema = (currentLanguage) => Yup.object({
  password: Yup.string().required(currentLanguage === "ar" ? "يجب إدخال كلمة المرور !" : "il faut saisire le mot de passe !"),
  confirmPassword: Yup.string().required(
    currentLanguage === "ar" ? "يجب إدخال تأكيد كلمة المرور !" : "il faut saisire le mot de passe de confirmation !"
  ),
});

const UtilisateurUpdatePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const prefilledRef = useRef(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showArKb, setShowArKb] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentLanguage, isRTL } = useLanguageSync();
  const { t } = useTranslation();
  
  
  const validationSchema = useMemo(() => getValidationSchema(currentLanguage), [currentLanguage]);
  const changePasswordValidationSchema = useMemo(() => getChangePasswordValidationSchema(currentLanguage), [currentLanguage]);
  
  
  const arabicKeys = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'ؤ', 'ئ', 'ة'];
  
  const toggleArabicKeyboard = (fieldName) => {
    setShowArKb(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };
  
  const appendArabicChar = (fieldName, char) => {
    form.setFieldValue(fieldName, (form.values[fieldName] || '') + char);
  };
  
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
    departement: "",
    interim: "",
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

  const departementListByDirectionID = useSelector(
    state => state.departementListByDirectionID
  );
  const {
    loading: loadingDepartementListByDirectionID,
    error: errorDepartementListByDirectionID,
    departements,
  } = departementListByDirectionID;

  const directionList = useSelector(state => state.directionList);
  const {
    loading: loadingDirectionList,
    error: errorDirectionList,
    
    directions,
  } = directionList;

  const userList = useSelector(state => state.userList);
  const {
    loading: loadingUserList,
    error: errorUserList,
    users,
  } = userList;





  const getServicesHandler = event => {
    dispatch(fetchServicesByDirectionID(event.target.value));
    dispatch(fetchDepartementsByDirectionID(event.target.value));
  };







  const form = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    validate: values => {
      const errors = {};

      if (!values.demandeur && !values.signataire && !values.createur) {
        errors.atLeastOneChecked = currentLanguage === "ar" ? "يجب تحديد دور واحد على الأقل" : "au moins un de ces champs doit être coché";
      }

      

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
        departement,
        interim,
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
          departement,
          interim,
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
    validationSchema: changePasswordValidationSchema,
    validateOnChange: false,
    validateOnBlur: true,
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

    if (successUserByID && recoveredUser && !prefilledRef.current) {
        
        if (recoveredUser && recoveredUser.direction) {
          dispatch(fetchServicesByDirectionID(recoveredUser.direction._id));
          dispatch(fetchDepartementsByDirectionID(recoveredUser.direction._id));
        }
        
        
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
          departement: "", 
          interim: recoveredUser
            ? recoveredUser.interim && recoveredUser.interim._id
            : "",
          service: recoveredUser
            ? recoveredUser.service && recoveredUser.service._id
            : "",
          isChefDeService: recoveredUser ? !!recoveredUser.isChefDeService : false,
          isDirecteur: recoveredUser ? !!recoveredUser.isDirecteur : false,
          createur:
            recoveredUser &&
              recoveredUser.roles &&
              recoveredUser.roles.find(role => role && role.role && String(role.role.code) === "crt")
              ? true
              : false,
          createurOption:
            recoveredUser &&
              recoveredUser.roles &&
              recoveredUser.roles.find(role => role && role.role && String(role.role.code) === "crt-op")
              ? true
              : false,
          signataire:
            recoveredUser &&
              recoveredUser.roles &&
              recoveredUser.roles.find(role => role && role.role && String(role.role.code) === "sig")
              ? true
              : false,
          demandeur:
            recoveredUser &&
              recoveredUser.roles &&
              recoveredUser.roles.find(role => role && role.role && String(role.role.code) === "dmr")
              ? true
              : false,
        });
      prefilledRef.current = true;
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
          departement: updatedUser
            ? updatedUser.departement && updatedUser.departement._id
            : "",
          interim: updatedUser
            ? updatedUser.interim && updatedUser.interim._id
            : "",
          service: updatedUser
            ? updatedUser.service && updatedUser.service._id
            : "",
          isChefDeService: updatedUser ? !!updatedUser.isChefDeService : false,
          isDirecteur: updatedUser ? !!updatedUser.isDirecteur : false,
          createur:
            updatedUser &&
              updatedUser.roles.find(role => role && role.role && String(role.role.code) === "crt")
              ? true
              : false,
          createurOption:
            updatedUser &&
              updatedUser.roles.find(role => role && role.role && String(role.role.code) === "crt-op")
              ? true
              : false,
          signataire:
            updatedUser &&
              updatedUser.roles.find(role => role && role.role && String(role.role.code) === "sig")
              ? true
              : false,
          demandeur:
            updatedUser &&
              updatedUser.roles.find(role => role && role.role && String(role.role.code) === "dmr")
              ? true
              : false,
        });
        Toast.open({
          type: "success",
          title: "Modification avec success",
          message: "l'utilisateur a été modifiée avec succès",
        });
        navigate('/admin/utilisateurs');
        dispatch(resetUpdateUser());
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


  }, [callOnce, successUserByID, recoveredUser, successUserUpdate, updatedUser, errorUserUpdate]);

  
  useEffect(() => {
    if (recoveredUser && !loadingDepartementListByDirectionID && departements.length > 0) {
      
      if (recoveredUser.departement) {
        form.setFieldValue('departement', recoveredUser.departement._id);
      }
    }
  }, [recoveredUser, loadingDepartementListByDirectionID, departements, form]);



  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '20px' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div className="d-flex align-items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
            {currentLanguage === "ar" ? "تعديل المستخدم" : "Modifier l'utilisateur"}
            <FaEdit style={{ color: '#0d6efd' }} />
          </h2>
          <small className="text-muted">{currentLanguage === "ar" ? "تعديل معلومات المستخدم" : "Modifier les informations de l'utilisateur"}</small>
        </div>
        <Link
          to="/admin/utilisateurs"
          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
          onClick={() => {
            setCallOnce(false);
            dispatch(resetFetchUserByID());
          }}
          style={{
            background: 'transparent',
            border: '1px solid #6c757d',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            padding: '6px 14px',
            gap: 8,
            height: 32,
            color: '#6c757d',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}
        >
          <i className="fas fa-arrow-left"></i>
          <span className={isRTL ? 'me-1' : 'ms-1'}>{currentLanguage === "ar" ? "العودة" : "Retour"}</span>
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
      {errorDepartementListByDirectionID && (
        <Message type='danger' itWillBeHidden>
          {errorDepartementListByDirectionID}
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
      {(loadingUserUpdate || loadingUserUpdatePassword) && <Loader />}
      {errorDirectionList && (
        <Message type='danger' itWillBeHidden>
          {errorDirectionList}
        </Message>
      )}
      {}
      <Card style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-light)', 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginLeft: isRTL ? 'auto' : 0,
        marginRight: isRTL ? 0 : 'auto',
        maxWidth: isRTL ? '100%' : '100%',
        position: isRTL ? 'relative' : 'static',
        top: isRTL ? 0 : 'auto',
        right: isRTL ? 0 : 'auto'
      }}>
        <Card.Body style={{ padding: '24px' }}>
          <Tabs defaultActiveKey='tab1' id='my-tabs'>
            <Tab eventKey='tab1' title={currentLanguage === "ar" ? "تعديل المعلومات" : "Modifier les informations"}>
              <Form onSubmit={form.handleSubmit} style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaIdBadge style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "رقم الموظف" : "Matricule"}
                      </Form.Label>
                      <Form.Control
                        placeholder={currentLanguage === "ar" ? "أدخل رقم الموظف" : "Veuillez saisir le matricule"}
                        name='matricule'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.matricule}
                        style={{ 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          direction: isRTL ? 'rtl' : 'ltr'
                        }}
                      />
                      <small className="text-warning d-flex align-items-center mt-1" style={{ gap: 4, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {currentLanguage === "ar" ? "رقم الموظف لا يجب أن يبدأ بالرقم 0" : "Le matricule ne doit pas commencer par le chiffre 0"}
                      </small>
                      {form.touched.matricule && form.errors.matricule && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.matricule}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaEnvelope style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "البريد الإلكتروني" : "Email"}
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder={currentLanguage === "ar" ? "أدخل البريد الإلكتروني" : "Veuillez saisir l'email"}
                        name='email'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.email}
                        style={{ 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          direction: isRTL ? 'rtl' : 'ltr'
                        }}
                      />
                      {form.touched.email && form.errors.email && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.email}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaUser style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "الاسم العائلي" : "Nom"}
                      </Form.Label>
                      <div className="position-relative">
                      <Form.Control
                          placeholder={currentLanguage === "ar" ? "أدخل الاسم العائلي" : "Veuillez saisir le nom"}
                        name='nom'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.nom}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                        />
                        {isRTL && (
                          <Button 
                            type="button" 
                            variant="light" 
                            size="sm" 
                            className="position-absolute" 
                            style={{ 
                              top: '50%', 
                              transform: 'translateY(-50%)', 
                              right: 8, 
                              border: '1px solid var(--border-light)',
                              borderRadius: 6,
                              padding: '2px 6px'
                            }}
                            onClick={() => toggleArabicKeyboard('nom')}
                          >
                            <FaKeyboard style={{ fontSize: 12 }} />
                          </Button>
                        )}
                      </div>
                      {isRTL && showArKb.nom && (
                        <div className="border rounded p-2 bg-white shadow-sm mt-2" style={{ zIndex: 1060, background: 'var(--bg-secondary)', maxWidth: 350 }} onMouseDown={(e)=>e.preventDefault()}>
                          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                            {arabicKeys.map((k, idx)=> (
                              <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>appendArabicChar('nom', k)}>{k}</Button>
                            ))}
                            <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> form.setFieldValue('nom', (form.values.nom||'').slice(0,-1))}><i className="fa-solid fa-delete-left"></i></Button>
                          </div>
                        </div>
                      )}
                      {form.touched.nom && form.errors.nom && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.nom}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaUser style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "الاسم الشخصي" : "Prénom"}
                      </Form.Label>
                      <div className="position-relative">
                      <Form.Control
                          placeholder={currentLanguage === "ar" ? "أدخل الاسم الشخصي" : "Veuillez saisir le prénom"}
                        name='prenom'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.prenom}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                        />
                        {isRTL && (
                          <Button 
                            type="button" 
                            variant="light" 
                            size="sm" 
                            className="position-absolute" 
                            style={{ 
                              top: '50%', 
                              transform: 'translateY(-50%)', 
                              right: 8, 
                              border: '1px solid var(--border-light)',
                              borderRadius: 6,
                              padding: '2px 6px'
                            }}
                            onClick={() => toggleArabicKeyboard('prenom')}
                          >
                            <FaKeyboard style={{ fontSize: 12 }} />
                          </Button>
                        )}
                      </div>
                      {isRTL && showArKb.prenom && (
                        <div className="border rounded p-2 bg-white shadow-sm mt-2" style={{ zIndex: 1060, background: 'var(--bg-secondary)', maxWidth: 350 }} onMouseDown={(e)=>e.preventDefault()}>
                          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                            {arabicKeys.map((k, idx)=> (
                              <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>appendArabicChar('prenom', k)}>{k}</Button>
                            ))}
                            <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> form.setFieldValue('prenom', (form.values.prenom||'').slice(0,-1))}><i className="fa-solid fa-delete-left"></i></Button>
                          </div>
                        </div>
                      )}
                      {form.touched.prenom && form.errors.prenom && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.prenom}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaBriefcase style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "الوظيفة" : "Fonction"}
                      </Form.Label>
                      <div className="position-relative">
                      <Form.Control
                          placeholder={currentLanguage === "ar" ? "أدخل الوظيفة" : "Veuillez saisir la fonction"}
                        name='fonction'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.fonction}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                        />
                        {isRTL && (
                          <Button 
                            type="button" 
                            variant="light" 
                            size="sm" 
                            className="position-absolute" 
                            style={{ 
                              top: '50%', 
                              transform: 'translateY(-50%)', 
                              right: 8, 
                              border: '1px solid var(--border-light)',
                              borderRadius: 6,
                              padding: '2px 6px'
                            }}
                            onClick={() => toggleArabicKeyboard('fonction')}
                          >
                            <FaKeyboard style={{ fontSize: 12 }} />
                          </Button>
                        )}
                      </div>
                      {isRTL && showArKb.fonction && (
                        <div className="border rounded p-2 bg-white shadow-sm mt-2" style={{ zIndex: 1060, background: 'var(--bg-secondary)', maxWidth: 350 }} onMouseDown={(e)=>e.preventDefault()}>
                          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                            {arabicKeys.map((k, idx)=> (
                              <Button key={idx} variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=>appendArabicChar('fonction', k)}>{k}</Button>
                            ))}
                            <Button variant="light" size="sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={()=> form.setFieldValue('fonction', (form.values.fonction||'').slice(0,-1))}><i className="fa-solid fa-delete-left"></i></Button>
                          </div>
                        </div>
                      )}
                      {form.touched.fonction && form.errors.fonction && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.fonction}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xl={6} lg={6} md={6} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaPhone style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "رقم الهاتف" : "GSM"}
                      </Form.Label>
                      <Form.Control
                        placeholder={currentLanguage === "ar" ? "أدخل رقم الهاتف" : "Veuillez saisir le GSM (numéro de téléphone)"}
                        name='gsm'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.gsm}
                        style={{ 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          direction: isRTL ? 'rtl' : 'ltr'
                        }}
                      />
                      {form.touched.gsm && form.errors.gsm && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.gsm}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaBuilding style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "الإدارة" : "Direction"}
                      </Form.Label>
                      <Form.Select
                        disabled={loadingDirectionList}
                        name='direction'
                        onChange={event => {
                          form.handleChange(event);
                          getServicesHandler(event);
                        }}
                        onBlur={form.handleBlur}
                        value={form.values.direction}
                        style={{ 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          direction: isRTL ? 'rtl' : 'ltr'
                        }}>
                        <option value=''>
                          {currentLanguage === "ar" ? "---- يرجى اختيار إدارة ----" : "---- veuillez selectionner une direction ----"}
                        </option>
                        {directions.length > 0 &&
                          directions.map(direction => (
                            <option key={direction._id} value={direction._id}>
                              {direction.libelle}
                            </option>
                          ))}
                      </Form.Select>
                      {form.touched.direction && form.errors.direction && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.direction}
                        </small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FaSitemap style={{ color: '#0d6efd' }} />
                        {currentLanguage === "ar" ? "القسم" : "Département"}
                      </Form.Label>
                      <Form.Select
                        disabled={loadingDepartementListByDirectionID || !form.values.direction}
                        name='departement'
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.departement}
                        style={{ 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: 8,
                          textAlign: isRTL ? 'right' : 'left',
                          direction: isRTL ? 'rtl' : 'ltr'
                        }}>
                        <option value=''>
                          {currentLanguage === "ar" ? "---- يرجى اختيار قسم ----" : "---- veuillez selectionner un département ----"}
                        </option>
                        {departements.length > 0 &&
                          departements.map(departement => (
                            <option key={departement._id} value={departement._id}>
                              {departement.libelle}
                            </option>
                          ))}
                      </Form.Select>
                      {form.touched.departement && form.errors.departement && (
                        <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {form.errors.departement}
                        </small>
                      )}
                    </Form.Group>
                  </Col>


                  {!form.values.isDirecteur && (
                    <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                          <FaSitemap style={{ color: '#0d6efd' }} />
                          {currentLanguage === "ar" ? "الخدمة" : "Service"}
                        </Form.Label>
                        <Form.Select
                          disabled={loadingServiceListByDirectionID || !form.values.direction}
                          name='service'
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          value={form.values.service}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}>
                          <option value=''>
                            {currentLanguage === "ar" ? "---- يرجى اختيار خدمة ----" : "---- veuillez selectionner un service ----"}
                          </option>
                          {services.length > 0 &&
                            services.map(service => (
                              <option key={service._id} value={service._id}>
                                {service.libelle}
                              </option>
                            ))}
                        </Form.Select>
                        {form.touched.service && form.errors.service && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {form.errors.service}
                          </small>
                        )}
                      </Form.Group>
                    </Col>
                  )}
                </Row>
                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <div className="d-flex align-items-center mb-3" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                      <FaUserTie style={{ color: '#0d6efd', fontSize: '1.2rem' }} />
                      <h5 className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {currentLanguage === "ar" ? "منصب المسؤولية" : "Poste de responsabilité"}
                      </h5>
                    </div>
                    <div className="d-flex justify-content-end mb-3">
                    <Button
                        variant='outline-secondary'
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
                          departement: form.values.departement,
                          interim: form.values.interim,
                          service: form.values.service,
                          demandeur: form.values.demandeur,
                          createur: form.values.createur,
                          signataire: form.values.signataire,
                          isChefDeService: false,
                          isDirecteur: false,
                        });
                        }}
                        className="rounded-pill d-flex align-items-center"
                        style={{ 
                          gap: 6, 
                          fontSize: '0.875rem',
                          padding: '6px 16px',
                          flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}>
                        <i className="fa-solid fa-square-minus"></i>
                        <span>{currentLanguage === "ar" ? "إلغاء التحديد" : "Décocher"}</span>
                    </Button>
                    </div>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <div className="d-flex flex-wrap gap-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                      <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <Form.Check
                          name='isChefDeService'
                          type="checkbox"
                          id="isChefDeService"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            form.setFieldValue('isChefDeService', checked);
                            if (checked) form.setFieldValue('isDirecteur', false);
                          }}
                          onBlur={form.handleBlur}
                          checked={!!form.values.isChefDeService}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <Form.Label htmlFor="isChefDeService" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <FaUserTie style={{ color: '#0d6efd', fontSize: '1rem' }} />
                          {currentLanguage === "ar" ? "رئيس الخدمة" : "Chef de service"}
                        </Form.Label>
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <Form.Check
                          name='isDirecteur'
                          type="checkbox"
                          id="isDirecteur"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            form.setFieldValue('isDirecteur', checked);
                            if (checked) form.setFieldValue('isChefDeService', false);
                          }}
                          onBlur={form.handleBlur}
                          checked={!!form.values.isDirecteur}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <Form.Label htmlFor="isDirecteur" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <FaUserTie style={{ color: '#0d6efd', fontSize: '1rem' }} />
                          {currentLanguage === "ar" ? "المدير" : "Directeur"}
                        </Form.Label>
                      </div>
                    </div>
                    {(form.touched.isChefDeService && form.errors.isChefDeService) && (
                      <small className="text-danger d-block mt-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {form.errors.isChefDeService}
                      </small>
                    )}
                    {(form.touched.isDirecteur && form.errors.isDirecteur) && (
                      <small className="text-danger d-block mt-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              {form.errors.isDirecteur}
                            </small>
                          )}
                  </Col>
                </Row>

                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <div className="d-flex align-items-center mb-3" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                      <FaUserCheck style={{ color: '#0d6efd', fontSize: '1.2rem' }} />
                      <h5 className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                        {currentLanguage === "ar" ? "الأدوار" : "Rôles"}
                      </h5>
                    </div>
                  </Col>
                  <Col xl={12} lg={12} md={12} sm={12}>
                    <Row className="g-3">
                      <Col xl={3} lg={3} md={6} sm={12}>
                        <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <Form.Check
                            name='demandeur'
                            type="checkbox"
                            id="demandeur"
                            onChange={(e) => form.setFieldValue('demandeur', e.target.checked)}
                            onBlur={form.handleBlur}
                            checked={!!form.values.demandeur}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <Form.Label htmlFor="demandeur" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <FaUser style={{ color: '#0d6efd', fontSize: '1rem' }} />
                            {currentLanguage === "ar" ? "مقدم الطلب" : "Demandeur"}
                          </Form.Label>
                        </div>
                          {form.touched.demandeur && form.errors.demandeur && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              {form.errors.demandeur}
                            </small>
                          )}
                      </Col>
                      <Col xl={3} lg={3} md={6} sm={12}>
                        <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <Form.Check
                            name='signataire'
                            type="checkbox"
                            id="signataire"
                            onChange={(e) => form.setFieldValue('signataire', e.target.checked)}
                            onBlur={form.handleBlur}
                            checked={!!form.values.signataire}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <Form.Label htmlFor="signataire" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <FaUserTie style={{ color: '#0d6efd', fontSize: '1rem' }} />
                            {currentLanguage === "ar" ? "الموقع" : "Signataire"}
                          </Form.Label>
                        </div>
                        {form.touched.signataire && form.errors.signataire && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                {form.errors.signataire}
                              </small>
                            )}
                      </Col>
                      <Col xl={3} lg={3} md={6} sm={12}>
                        <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <Form.Check
                            name='createur'
                            type="checkbox"
                            id="createur"
                            onChange={(e) => form.setFieldValue('createur', e.target.checked)}
                            onBlur={form.handleBlur}
                            checked={!!form.values.createur}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <Form.Label htmlFor="createur" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <FaUserCheck style={{ color: '#0d6efd', fontSize: '1rem' }} />
                            {currentLanguage === "ar" ? "المنشئ" : "Créateur"}
                          </Form.Label>
                        </div>
                          {form.touched.createur && form.errors.createur && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              {form.errors.createur}
                            </small>
                          )}
                      </Col>
                      <Col xl={3} lg={3} md={6} sm={12}>
                        <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <Form.Check
                            name='createurOption'
                            type="checkbox"
                            id="createurOption"
                            onChange={(e) => form.setFieldValue('createurOption', e.target.checked)}
                            onBlur={form.handleBlur}
                            checked={!!form.values.createurOption}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <Form.Label htmlFor="createurOption" className="mb-0 fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)', gap: 6, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <FaUserCheck style={{ color: '#0d6efd', fontSize: '1rem' }} />
                            {currentLanguage === "ar" ? "منشئ الخيار" : "Créateur d'option"}
                          </Form.Label>
                        </div>
                          {form.touched.createurOption && form.errors.createurOption && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              {form.errors.createurOption}
                            </small>
                          )}
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {form.errors && form.errors["atLeastOneChecked"] && (
                  <div className="alert alert-warning d-flex align-items-center mt-3" style={{ 
                    background: 'var(--bg-warning)', 
                    border: '1px solid var(--border-warning)', 
                    borderRadius: 8,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    <i className="fa-solid fa-triangle-exclamation me-2" style={{ color: '#856404' }}></i>
                    <small className="mb-0 fw-semibold" style={{ color: '#856404' }}>
                    {form.errors["atLeastOneChecked"]}
                  </small>
                  </div>
                )}



                {}
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    type="submit" 
                    disabled={loadingUserUpdate}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{
                      background: '#0d6efd',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '1rem',
                      padding: '12px 32px',
                      gap: 8,
                      minWidth: 200,
                      flexDirection: isRTL ? 'row-reverse' : 'row'
                    }}
                  >
                    {loadingUserUpdate ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span className={isRTL ? 'me-1' : 'ms-1'}>
                          {currentLanguage === "ar" ? "جاري التحديث..." : "Mise à jour en cours..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaEdit />
                        <span className={isRTL ? 'me-1' : 'ms-1'}>
                          {currentLanguage === "ar" ? "تحديث المستخدم" : "Modifier l'utilisateur"}
                        </span>
                      </>
                    )}
                </Button>
                </div>
              </Form>
            </Tab>
            <Tab eventKey='tab2' title={currentLanguage === "ar" ? "تعديل كلمة المرور" : "Modifier le mot de passe"}>
              <Form className='py-3' onSubmit={changePasswordForm.handleSubmit} style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                {}
                <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <Col xl={6} lg={6} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ color: 'var(--text-primary)', textAlign: isRTL ? 'right' : 'left' }}>
                        {currentLanguage === "ar" ? "كلمة المرور" : "Mot de passe"}
                      </Form.Label>
                      <div className="position-relative">
                  <Form.Control
                          placeholder={currentLanguage === "ar" ? "أدخل كلمة المرور" : "Veuillez saisir le mot de passe"}
                    name='password'
                    type={showPassword ? "text" : "password"}
                    onChange={changePasswordForm.handleChange}
                    onBlur={changePasswordForm.handleBlur}
                    value={changePasswordForm.values.password}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr',
                            paddingRight: isRTL ? 40 : 40
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="light" 
                          size="sm" 
                          className="position-absolute" 
                          style={{ 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            right: 8, 
                            border: '1px solid var(--border-light)',
                            borderRadius: 6,
                            padding: '2px 6px'
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash style={{ fontSize: 12 }} /> : <FaEye style={{ fontSize: 12 }} />}
                        </Button>
                      </div>
                  {changePasswordForm.touched.password &&
                    changePasswordForm.errors.password && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {changePasswordForm.errors.password}
                      </small>
                    )}
                    </Form.Group>
                  </Col>
                  <Col xl={6} lg={6} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ color: 'var(--text-primary)', textAlign: isRTL ? 'right' : 'left' }}>
                        {currentLanguage === "ar" ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}
                      </Form.Label>
                      <div className="position-relative">
                  <Form.Control
                          placeholder={currentLanguage === "ar" ? "أعد إدخال كلمة المرور" : "Veuillez confirmer le mot de passe"}
                    name='confirmPassword'
                          type={showConfirmPassword ? "text" : "password"}
                    onChange={changePasswordForm.handleChange}
                    onBlur={changePasswordForm.handleBlur}
                    value={changePasswordForm.values.confirmPassword}
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: 8,
                            textAlign: isRTL ? 'right' : 'left',
                            direction: isRTL ? 'rtl' : 'ltr',
                            paddingRight: isRTL ? 40 : 40
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="light" 
                          size="sm" 
                          className="position-absolute" 
                          style={{ 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            right: 8, 
                            border: '1px solid var(--border-light)',
                            borderRadius: 6,
                            padding: '2px 6px'
                          }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash style={{ fontSize: 12 }} /> : <FaEye style={{ fontSize: 12 }} />}
                        </Button>
                      </div>
                  {changePasswordForm.touched.confirmPassword &&
                    changePasswordForm.errors.confirmPassword && (
                          <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {changePasswordForm.errors.confirmPassword}
                      </small>
                    )}
                    </Form.Group>
                  </Col>
                </Row>

                {}
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    type="submit" 
                    disabled={loadingUserUpdatePassword}
                    className="rounded-pill d-flex align-items-center justify-content-center"
                    style={{
                      background: '#0d6efd',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '1rem',
                      padding: '12px 32px',
                      gap: 8,
                      minWidth: 200,
                      flexDirection: isRTL ? 'row-reverse' : 'row'
                    }}
                  >
                    {loadingUserUpdatePassword ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span className={isRTL ? 'me-1' : 'ms-1'}>
                          {currentLanguage === "ar" ? "جاري التحديث..." : "Mise à jour en cours..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaKey />
                        <span className={isRTL ? 'me-1' : 'ms-1'}>
                          {currentLanguage === "ar" ? "تحديث كلمة المرور" : "Modifier le mot de passe"}
                        </span>
                      </>
                    )}
                </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>

          {!loadingUserByID && !recoveredUser && (
            <WarningMessage message={"utilisateur introuvable !"} />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UtilisateurUpdatePage;

import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createUser, resetCreateUser } from "../../redux/user/userActions";
import { Loader, Message } from "../../components";
import { fetchServicesByDirectionID } from "../../redux/service/serviceActions";
import { fetchDepartementsByDirectionID } from "../../redux/departement/departementActions";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../../services";
import { fetchDirections } from "../../redux/direction/directionActions";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";
import { FaIdBadge, FaEnvelope, FaUser, FaBriefcase, FaPhone, FaBuilding, FaSitemap, FaUserTie, FaUserCheck, FaKey, FaEye, FaEyeSlash, FaKeyboard } from "react-icons/fa";

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

  
  isChefDeService: Yup.boolean(),
  isDirecteur: Yup.boolean(),
  demandeur: Yup.boolean(),
  signataire: Yup.boolean(),
  createur: Yup.boolean(),
  createurOption: Yup.boolean(),
  password: Yup.string().required(currentLanguage === "ar" ? "يجب إدخال كلمة المرور !" : "il faut saisire le mot de passe !"),
  confirmPassword: Yup.string().required(
    currentLanguage === "ar" ? "يجب إدخال تأكيد كلمة المرور !" : "il faut saisire le mot de passe de confirmation !"
  ),
});

const UtilisateurCreatePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showArKb, setShowArKb] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentLanguage, isRTL } = useLanguageSync();
  const { t } = useTranslation();
  
  
  const validationSchema = useMemo(() => getValidationSchema(currentLanguage), [currentLanguage]);
  
  const [initialValues] = useState({
    matricule: "",
    email: "",
    nom: "",
    prenom: "",
    fonction: "",
    gsm: "",
    direction: "",
    departement: "",

    service: "",
    isChefDeService: false,
    isDirecteur: false,
    demandeur: false,
    signataire: false,
    createur: false,
    createurOption: false,
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

  const departementListByDirectionID = useSelector(
    (state) => state.departementListByDirectionID
  );
  const {
    loading: loadingDepartementListByDirectionID,
    error: errorDepartementListByDirectionID,
    departements,
  } = departementListByDirectionID;

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
    
    directions,
  } = directionList;



  const getServicesHandler = (event) => {
    dispatch(fetchServicesByDirectionID(event.target.value));
    dispatch(fetchDepartementsByDirectionID(event.target.value));
  };

  
  const arabicKeys = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'ة', 'ى', ' '];
  
  const appendArabicChar = (fieldName, char) => {
    const currentValue = form.values[fieldName] || '';
    form.setFieldValue(fieldName, currentValue + char);
  };

  const toggleArabicKeyboard = (fieldName) => {
    setShowArKb(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const form = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    validate: (values) => {
      const errors = {};
      if (!values.demandeur && !values.signataire && !values.createur)
        errors.atLeastOneChecked = currentLanguage === "ar" ? "يجب تحديد دور واحد على الأقل" : "au moins un de ces champs doit être coché";

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
        departement,
        isChefDeService,
        isDirecteur,
        demandeur,
        signataire,
        createur,
        createurOption,
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
          title: currentLanguage === "ar" ? "✅ تم إنشاء المستخدم بنجاح !" : "✅ Utilisateur créé avec succès !",
          message: currentLanguage === "ar" ? "تم إنشاء المستخدم وإضافته بنجاح" : "L'utilisateur a été créé et ajouté avec succès",
        });
        navigate('/admin/utilisateurs');
      }
    }
  }, [callOnce, successUserCreate, createdUser, errorUserCreate]);


  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '20px' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div className="d-flex align-items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
            {currentLanguage === "ar" ? "إنشاء مستخدم جديد" : "Créer un nouvel utilisateur"}
            <FaUserCheck style={{ color: '#0d6efd' }} />
          </h2>
          <small className="text-muted">{currentLanguage === "ar" ? "إضافة مستخدم جديد إلى النظام" : "Ajouter un nouvel utilisateur au système"}</small>
        </div>
        <Link
          to="/admin/utilisateurs"
          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
          onClick={() => {
            dispatch(resetCreateUser());
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

      {}
      {errorServiceListByDirectionID && (
        <Message type="danger" itWillBeHidden>
          {errorServiceListByDirectionID}
        </Message>
      )}
      {errorDepartementListByDirectionID && (
        <Message type="danger" itWillBeHidden>
          {errorDepartementListByDirectionID}
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
                    name="matricule"
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
                    name="email"
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
                    name="nom"
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
                    name="prenom"
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
                    name="fonction"
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
                    name="gsm"
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
                    name="direction"
                    onChange={(event) => {
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
                    }}
                  >
                    <option value="">
                      {currentLanguage === "ar" ? "---- يرجى اختيار إدارة ----" : "---- Veuillez sélectionner une direction ----"}
                    </option>
                    {directions.length > 0 &&
                      directions.map((direction) => (
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
                    disabled={
                      loadingDepartementListByDirectionID ||
                      !form.values.direction
                    }
                    name="departement"
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.departement}
                    style={{ 
                      background: 'var(--bg-primary)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: 8,
                      textAlign: isRTL ? 'right' : 'left',
                      direction: isRTL ? 'rtl' : 'ltr'
                    }}
                  >
                    <option value="">
                      {currentLanguage === "ar" ? "---- يرجى اختيار قسم ----" : "---- Veuillez sélectionner un département ----"}
                    </option>
                    {departements.length > 0 &&
                      departements.map((departement) => (
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
                      disabled={
                        loadingServiceListByDirectionID ||
                        !form.values.direction
                      }
                      name="service"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.service}
                      style={{ 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: 8,
                        textAlign: isRTL ? 'right' : 'left',
                        direction: isRTL ? 'rtl' : 'ltr'
                      }}
                    >
                      <option value="">
                        {currentLanguage === "ar" ? "---- يرجى اختيار خدمة ----" : "---- Veuillez sélectionner un service ----"}
                      </option>
                      {services.length > 0 &&
                        services.map((service) => (
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
                  <h5 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {currentLanguage === "ar" ? "منصب المسؤولية" : "Poste de responsabilité"}
                  </h5>
                  <FaUserTie style={{ color: '#0d6efd' }} />
                </div>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-pill mb-3"
                  onClick={() => {
                    form.setFieldValue('isChefDeService', false);
                    form.setFieldValue('isDirecteur', false);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #6c757d',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    padding: '6px 14px',
                    color: '#6c757d',
                    marginLeft: isRTL ? 0 : 'auto',
                    marginRight: isRTL ? 'auto' : 0
                  }}
                >
                  {currentLanguage === "ar" ? "إلغاء التحديد" : "Décocher"}
                </Button>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="d-flex flex-wrap align-items-center" style={{ gap: 20, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                    <Form.Check
                      name="isChefDeService"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        form.setFieldValue('isChefDeService', checked);
                        if (checked) form.setFieldValue('isDirecteur', false);
                      }}
                      onBlur={form.handleBlur}
                      checked={!!form.values.isChefDeService}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "رئيس الخدمة" : "Chef de service"}
                    </label>
                  </div>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                    <Form.Check
                      name="isDirecteur"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        form.setFieldValue('isDirecteur', checked);
                        if (checked) form.setFieldValue('isChefDeService', false);
                      }}
                      onBlur={form.handleBlur}
                      checked={!!form.values.isDirecteur}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "مدير" : "Directeur"}
                    </label>
                  </div>
                </div>
                {(form.touched.isChefDeService && form.errors.isChefDeService) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {form.errors.isChefDeService}
                  </small>
                )}
                {(form.touched.isDirecteur && form.errors.isDirecteur) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {form.errors.isDirecteur}
                      </small>
                    )}
              </Col>
            </Row>

            {}
            <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
              <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="d-flex align-items-center mb-3" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                  <h5 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {currentLanguage === "ar" ? "الأدوار" : "Rôles"}
                  </h5>
                  <FaUserCheck style={{ color: '#0d6efd' }} />
                </div>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="d-flex flex-wrap align-items-center" style={{ gap: 20, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                      <Form.Check
                        disabled={loadingUserCreate}
                        name="demandeur"
                      onChange={(e) => form.setFieldValue('demandeur', e.target.checked)}
                        onBlur={form.handleBlur}
                      checked={!!form.values.demandeur}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "مقدم الطلب" : "Demandeur"}
                    </label>
                    </div>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                      <Form.Check
                        disabled={loadingUserCreate}
                        name="signataire"
                      onChange={(e) => form.setFieldValue('signataire', e.target.checked)}
                        onBlur={form.handleBlur}
                      checked={!!form.values.signataire}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "الموقع" : "Signataire"}
                    </label>
                    </div>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                      <Form.Check
                        disabled={loadingUserCreate}
                        name="createur"
                      onChange={(e) => form.setFieldValue('createur', e.target.checked)}
                        onBlur={form.handleBlur}
                      checked={!!form.values.createur}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "المنشئ" : "Créateur"}
                    </label>
                    </div>
                  <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', minWidth: 'fit-content' }}>
                      <Form.Check
                        disabled={loadingUserCreate}
                        name="createurOption"
                      onChange={(e) => form.setFieldValue('createurOption', e.target.checked)}
                        onBlur={form.handleBlur}
                      checked={!!form.values.createurOption}
                      style={{ transform: 'scale(1.3)', margin: 0 }}
                    />
                    <label className="fw-semibold" style={{ color: 'var(--text-primary)', margin: 0, pointerEvents: 'auto' }}>
                      {currentLanguage === "ar" ? "منشئ الخيارات" : "Créateur d'option"}
                    </label>
                  </div>
                </div>
                {}
                {(form.touched.demandeur && form.errors.demandeur) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {form.errors.demandeur}
                  </small>
                )}
                {(form.touched.signataire && form.errors.signataire) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {form.errors.signataire}
                  </small>
                )}
                {(form.touched.createur && form.errors.createur) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {form.errors.createur}
                  </small>
                )}
                {(form.touched.createurOption && form.errors.createurOption) && (
                  <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {form.errors.createurOption}
                          </small>
                        )}
              </Col>
            </Row>
            {form.errors && form.errors["atLeastOneChecked"] && (
              <div className="alert alert-warning d-flex align-items-center" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{form.errors["atLeastOneChecked"]}</span>
              </div>
            )}

            {}
            <Row className="mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
              <Col xl={12} lg={12} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="d-flex align-items-center mb-3" style={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                  <h5 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {currentLanguage === "ar" ? "كلمة المرور" : "Mot de passe"}
                  </h5>
                  <FaKey style={{ color: '#0d6efd' }} />
                </div>
              </Col>
              <Col xl={6} lg={6} md={12} sm={12} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: 'var(--text-primary)', textAlign: isRTL ? 'right' : 'left' }}>
                    {currentLanguage === "ar" ? "كلمة المرور" : "Mot de passe"}
                  </Form.Label>
                  <div className="position-relative">
                  <Form.Control
                      placeholder={currentLanguage === "ar" ? "أدخل كلمة المرور" : "Veuillez saisir le mot de passe"}
                    name="password"
                      type={showPassword ? "text" : "password"}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.password}
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
                        border: 'none',
                        background: 'transparent',
                        padding: '2px 6px'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash style={{ fontSize: 14 }} /> : <FaEye style={{ fontSize: 14 }} />}
                    </Button>
                  </div>
                  {form.touched.password && form.errors.password && (
                    <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {form.errors.password}
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
                    name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={form.values.confirmPassword}
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
                        border: 'none',
                        background: 'transparent',
                        padding: '2px 6px'
                      }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash style={{ fontSize: 14 }} /> : <FaEye style={{ fontSize: 14 }} />}
                    </Button>
                  </div>
                  {form.touched.confirmPassword && form.errors.confirmPassword && (
                    <small className="text-danger d-block mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {form.errors.confirmPassword}
                      </small>
                    )}
                </Form.Group>
              </Col>
            </Row>

            {}
            <div className="d-flex justify-content-center mt-4">
              <Button 
                type="submit" 
                disabled={loadingUserCreate}
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
                {loadingUserCreate ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span className={isRTL ? 'me-1' : 'ms-1'}>
                      {currentLanguage === "ar" ? "جاري الإنشاء..." : "Création en cours..."}
                    </span>
                  </>
                ) : (
                  <>
                    <FaUserCheck />
                    <span className={isRTL ? 'me-1' : 'ms-1'}>
                      {currentLanguage === "ar" ? "إنشاء المستخدم" : "Créer l'utilisateur"}
                    </span>
                  </>
                )}
            </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UtilisateurCreatePage;

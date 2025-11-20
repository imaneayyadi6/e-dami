import React, { useEffect, useState } from "react";
import { Button, Card, Form, Container, Row, Col, Alert, InputGroup } from "react-bootstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../services";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Message } from "../components";
import { resetUpdateUserPassword, updateUserPassword } from "../redux/user/userActions";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";
import { FaKey, FaEye, FaEyeSlash, FaLock, FaShieldAlt } from "react-icons/fa";
const ChangePassword = () => {
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  
  const arabicKeys = [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ];

  const insertArabicChar = (currentValue, setValue, char) => {
    if (char === '⌫') {
      setValue(currentValue.slice(0, -1));
    } else if (char === '␣') {
      setValue(currentValue + ' ');
    } else {
      setValue(currentValue + char);
    }
  };

  
  const passwordTranslations = {
    fr: {
      title: "Changer le mot de passe",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      passwordPlaceholder: "Veuillez saisir le mot de passe",
      confirmPasswordPlaceholder: "Veuillez saisir le mot de passe de confirmation",
      showPassword: "Afficher le mot de passe",
      changePassword: "Modifier le mot de passe",
      passwordRequired: "Il faut saisir le mot de passe !",
      confirmPasswordRequired: "Il faut saisir le mot de passe de confirmation !",
      passwordsNotMatch: "Le mot de passe et le mot de passe de confirmation ne correspondent pas",
      successTitle: "Modification avec succès",
      successMessage: "Le mot de passe a été modifié avec succès",
      loading: "Chargement..."
    },
    ar: {
      title: "تغيير كلمة المرور",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      passwordPlaceholder: "يرجى إدخال كلمة المرور",
      confirmPasswordPlaceholder: "يرجى إدخال تأكيد كلمة المرور",
      showPassword: "إظهار كلمة المرور",
      changePassword: "تغيير كلمة المرور",
      passwordRequired: "يجب إدخال كلمة المرور !",
      confirmPasswordRequired: "يجب إدخال تأكيد كلمة المرور !",
      passwordsNotMatch: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
      successTitle: "تم التعديل بنجاح",
      successMessage: "تم تغيير كلمة المرور بنجاح",
      loading: "جاري التحميل..."
    }
  };

  const currentTranslations = passwordTranslations[currentLanguage] || passwordTranslations.fr;

  const changePasswordvalidationSchema = Yup.object({
    password: Yup.string().required(currentTranslations.passwordRequired),
    confirmPassword: Yup.string().required(currentTranslations.confirmPasswordRequired),
  });

  const userUpdatePassword = useSelector((state) => state.userUpdatePassword);
  const {
    loading: loadingUserUpdatePassword,
    error: errorUserUpdatePassword,
    success: successUserUpdatePassword,
  } = userUpdatePassword;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const changePasswordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordvalidationSchema,
    onSubmit: (values) => {
      const { password, confirmPassword } = values;
      if (String(password) === String(confirmPassword)) {
        console.log("");
        if (userInfo) dispatch(updateUserPassword(userInfo.id, password));
      } else {
        setMessage(currentTranslations.passwordsNotMatch);
        setTimeout(() => {
          setMessage(null);
        }, 7000);
      }

      window.scrollTo(0, 0);
    },
  });

  useEffect(() => {
    if (successUserUpdatePassword) {
      console.log("### [SUCCESS] ###");
      Toast.open({
        type: "success",
        title: currentTranslations.successTitle,
        message: currentTranslations.successMessage,
      });
      changePasswordForm.resetForm();
      dispatch(resetUpdateUserPassword());
    }
  }, [successUserUpdatePassword]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            <FaKey className="me-2" style={{ color: '#007bff' }} />
            {currentTranslations.title}
          </h2>
        </div>
      </div>

      <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        {message && (
            <Alert variant="danger" className="mb-3">
            {message}
            </Alert>
        )}
        {errorUserUpdatePassword && (
            <Alert variant="danger" className="mb-3">
            {errorUserUpdatePassword}
            </Alert>
          )}
          {loadingUserUpdatePassword && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{currentTranslations.loading}</span>
              </div>
              <p className="mt-2 text-muted">{currentTranslations.loading}</p>
            </div>
          )}
          
          <Form onSubmit={changePasswordForm.handleSubmit}>
            <div className="mb-3">
              <Form.Label className="fw-semibold small d-flex align-items-center">
                <FaLock className="me-2" style={{ color: '#007bff' }} />
                {currentTranslations.password}
              </Form.Label>
              <InputGroup>
            <Form.Control
                  placeholder={currentTranslations.passwordPlaceholder}
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={changePasswordForm.handleChange}
              onBlur={changePasswordForm.handleBlur}
              value={changePasswordForm.values.password}
              disabled={loadingUserUpdatePassword}
                  size="sm"
                  style={{ textAlign: isRTL ? "right" : "left" }}
                  onFocus={() => currentLanguage === 'ar' && setShowArabicKeyboard(true)}
                />
                <InputGroup.Text 
                  style={{ pointerEvents: "auto", color: "#007bff" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {currentLanguage === 'ar' && showArabicKeyboard && (
                <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Clavier arabe</small>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setShowArabicKeyboard(false)}
                      style={{ fontSize: '0.75rem', height: 24, padding: '0 8px' }}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                    {arabicKeys.map((k) => (
                      <Button 
                        key={k} 
                        size="sm" 
                        variant="light" 
                        onClick={() => insertArabicChar(changePasswordForm.values.password, (value) => changePasswordForm.setFieldValue('password', value), k)}
                        style={{ 
                          minWidth: '32px', 
                          fontSize: '0.875rem',
                          height: 28,
                          background: '#007bff',
                          border: '1px solid #007bff',
                          color: 'white'
                        }}
                      >
                        {k}
                      </Button>
                    ))}
                    <Button 
                      size="sm" 
                      variant="light" 
                      onClick={() => insertArabicChar(changePasswordForm.values.password, (value) => changePasswordForm.setFieldValue('password', value), '␣')}
                      style={{ 
                        fontSize: '0.75rem',
                        height: 28,
                        background: '#007bff',
                        border: '1px solid #007bff',
                        color: 'white'
                      }}
                    >
                      مسافة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      onClick={() => insertArabicChar(changePasswordForm.values.password, (value) => changePasswordForm.setFieldValue('password', value), '⌫')}
                      style={{ 
                        fontSize: '0.75rem',
                        height: 28
                      }}
                    >
                      ⌫
                    </Button>
                  </div>
                </div>
              )}
            {changePasswordForm.touched.password &&
              changePasswordForm.errors.password && (
                  <small className="text-danger d-block mt-1">
                  {changePasswordForm.errors.password}
                </small>
              )}
          </div>

            <div className="mb-3">
              <Form.Label className="fw-semibold small d-flex align-items-center">
                <FaShieldAlt className="me-2" style={{ color: '#007bff' }} />
                {currentTranslations.confirmPassword}
              </Form.Label>
              <InputGroup>
            <Form.Control
                  placeholder={currentTranslations.confirmPasswordPlaceholder}
              name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
              onChange={changePasswordForm.handleChange}
              onBlur={changePasswordForm.handleBlur}
              value={changePasswordForm.values.confirmPassword}
              disabled={loadingUserUpdatePassword}
                  size="sm"
                  style={{ textAlign: isRTL ? "right" : "left" }}
                  onFocus={() => currentLanguage === 'ar' && setShowArabicKeyboard(true)}
                />
                <InputGroup.Text 
                  style={{ pointerEvents: "auto", color: "#007bff" }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {currentLanguage === 'ar' && showArabicKeyboard && (
                <div className="mt-2 p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Clavier arabe</small>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setShowArabicKeyboard(false)}
                      style={{ fontSize: '0.75rem', height: 24, padding: '0 8px' }}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                    {arabicKeys.map((k) => (
                      <Button 
                        key={k} 
                        size="sm" 
                        variant="light" 
                        onClick={() => insertArabicChar(changePasswordForm.values.confirmPassword, (value) => changePasswordForm.setFieldValue('confirmPassword', value), k)}
                        style={{ 
                          minWidth: '32px', 
                          fontSize: '0.875rem',
                          height: 28,
                          background: '#007bff',
                          border: '1px solid #007bff',
                          color: 'white'
                        }}
                      >
                        {k}
                      </Button>
                    ))}
                    <Button 
                      size="sm" 
                      variant="light" 
                      onClick={() => insertArabicChar(changePasswordForm.values.confirmPassword, (value) => changePasswordForm.setFieldValue('confirmPassword', value), '␣')}
                      style={{ 
                        fontSize: '0.75rem',
                        height: 28,
                        background: '#007bff',
                        border: '1px solid #007bff',
                        color: 'white'
                      }}
                    >
                      مسافة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      onClick={() => insertArabicChar(changePasswordForm.values.confirmPassword, (value) => changePasswordForm.setFieldValue('confirmPassword', value), '⌫')}
                      style={{ 
                        fontSize: '0.75rem',
                        height: 28
                      }}
                    >
                      ⌫
                    </Button>
                  </div>
                </div>
              )}
            {changePasswordForm.touched.confirmPassword &&
              changePasswordForm.errors.confirmPassword && (
                  <small className="text-danger d-block mt-1">
                  {changePasswordForm.errors.confirmPassword}
                </small>
              )}
          </div>

          <Form.Check
              label={currentTranslations.showPassword}
            type="switch"
              className="mb-3"
              onChange={() => {
                setShowPassword(!showPassword);
                setShowConfirmPassword(!showConfirmPassword);
              }}
              checked={showPassword}
            />

            <Button 
              className="w-100" 
              type="submit" 
              variant="primary"
              size="sm"
              disabled={loadingUserUpdatePassword}
              style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
            >
              <FaKey className="me-2" />
              {currentTranslations.changePassword}
          </Button>
        </Form>
      </Card.Body>
    </Card>
    </div>
  );
};

export default ChangePassword;

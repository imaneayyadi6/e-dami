import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Loader, Message } from "../components";
import { Button, Card, Form, Row, Col, Container, Alert } from "react-bootstrap";
import { useLanguageSync } from "../hooks/useLanguageSync";
import "animate.css";


const translations = {
  fr: {
    title: "Récupération de compte",
    subtitle: "Récupérez l'accès à votre compte E-Dami",
    labelEmail: "Adresse email",
    placeholderEmail: "Veuillez saisir votre adresse email",
    labelMatricule: "Numéro de matricule",
    placeholderMatricule: "Veuillez saisir votre numéro de matricule",
    infoMessage: "Veuillez saisir votre email et matricule pour récupérer l'accès à votre compte.",
    buttonText: "Récupérer mon compte",
    processing: "Traitement...",
    successTitle: "Demande envoyée !",
    successMessage: "Votre demande de récupération de compte a été envoyée. Vous recevrez un email avec les instructions dans les plus brefs délais.",
    backToLogin: "Retour à la connexion",
    footer: "© 2025 E-Dami. Tous droits réservés.",
  },
  ar: {
    title: "استعادة الحساب",
    subtitle: "استعد الوصول إلى حسابك في E-Dami",
    labelEmail: "عنوان البريد الإلكتروني",
    placeholderEmail: "الرجاء إدخال عنوان بريدك الإلكتروني",
    labelMatricule: "رقم التسجيل",
    placeholderMatricule: "الرجاء إدخال رقم التسجيل الخاص بك",
    infoMessage: "الرجاء إدخال بريدك الإلكتروني ورقم التسجيل لاستعادة الوصول إلى حسابك.",
    buttonText: "استعادة حسابي",
    processing: "...جارٍ المعالجة",
    successTitle: "تم إرسال الطلب!",
    successMessage: "تم إرسال طلب استعادة حسابك. ستتلقى بريداً إلكترونياً مع التعليمات في أقرب وقت ممكن.",
    backToLogin: "العودة إلى تسجيل الدخول",
    footer: "© 2025 E-Dami. جميع الحقوق محفوظة.",
  },
};


const theme = {
  background: "#F5F7FA",
  cardBackground: "white",
  cardShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  textDark: "#1B263B",
  textMuted: "#6C757D",
  inputBorder: "#cfd8dc",
  accentColor: "#3A91CB",
  linkHover: "#1B263B",
  rightPaneBackground: "#1B263B",
  successColor: "#28a745",
};

const AccountRecoveryPage = () => {
  const [email, setEmail] = useState("");
  const [matricule, setMatricule] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isRTL, currentLanguage, toggleLanguage } = useLanguageSync();

  const text = translations[currentLanguage] || translations.fr;

  const submitHandler = (e) => {
    e.preventDefault();
    if (email && matricule) {
      setLoading(true);
      setError("");
      
      
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 2000);
    } else {
      setError(text.errorMessage || "Veuillez remplir tous les champs");
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  return (
    <>
      <div
        className="d-flex flex-column min-vh-100"
        style={{
          background: `linear-gradient(135deg, ${theme.background} 30%, #D6E4F0 100%)`,
          fontFamily: "'Poppins', sans-serif",
          padding: "1rem",
          color: theme.textDark,
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {}
        <header className="d-flex justify-content-start align-items-center mb-4">
          <Link
            to="/login"
            className="btn btn-outline-secondary d-flex align-items-center"
            style={{
              borderRadius: "8px",
              fontSize: "0.9rem",
              padding: "0.5rem 1rem",
            }}
          >
            <i className={`fa-solid fa-arrow-left ${isRTL ? 'ms-2' : 'me-2'}`}></i>
            {text.backToLogin}
          </Link>
        </header>

        {}
        <main className="d-flex justify-content-center align-items-center flex-grow-1">
          <Container>
            <Row className="justify-content-center">
              <Col md={10} lg={9} xl={8}>
                <Card
                  className="shadow-lg border-0 animate__animated animate__fadeIn"
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: theme.cardBackground,
                    boxShadow: theme.cardShadow,
                  }}
                >
                  <Row className="g-0">
                    {}
                    <Col md={6} className="p-4 p-md-5">
                      <div className="mb-4 text-center">
                        <h3 className="fw-bold mb-1" style={{ fontSize: "1.7rem", color: theme.textDark }}>
                          {text.title}
                        </h3>
                        <p className="text-muted" style={{ fontSize: "0.85rem", color: theme.textMuted }}>
                          {text.subtitle}
                        </p>
                      </div>

                      {loading && <Loader size={"md"} />}
                      {error && <Message type="danger" itWillBeHidden>{error}</Message>}

                      {success ? (
                        <Alert variant="success" className="text-center animate__animated animate__fadeIn">
                          <div className="mb-3">
                            <i className="fa-solid fa-circle-check" style={{ fontSize: "3rem", color: theme.successColor }}></i>
                          </div>
                          <h5 className="fw-bold mb-2">{text.successTitle}</h5>
                          <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                            {text.successMessage}
                          </p>
                        </Alert>
                      ) : (
                        <>
                          <Alert variant="info" className="mb-4" style={{ fontSize: "0.85rem" }}>
                            <i className="fa-solid fa-info-circle me-2"></i>
                            {text.infoMessage}
                          </Alert>

                          <Form onSubmit={submitHandler}>
                            <Form.Group controlId="email" className="mb-3">
                              <Form.Label
                                className="fw-semibold"
                                style={{ fontSize: "0.85rem", color: theme.textMuted }}
                              >
                                {text.labelEmail}
                              </Form.Label>
                              <Form.Control
                                type="email"
                                placeholder={text.placeholderEmail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="py-2 shadow-sm"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.9rem",
                                  borderColor: theme.inputBorder,
                                  transition: "border-color 0.3s",
                                  backgroundColor: theme.cardBackground,
                                  color: theme.textDark,
                                }}
                                onFocus={(e) => (e.target.style.borderColor = theme.accentColor)}
                                onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
                              />
                            </Form.Group>

                            <Form.Group controlId="matricule" className="mb-4">
                              <Form.Label
                                className="fw-semibold"
                                style={{ fontSize: "0.85rem", color: theme.textMuted }}
                              >
                                {text.labelMatricule}
                              </Form.Label>
                              <Form.Control
                                type="number"
                                placeholder={text.placeholderMatricule}
                                value={matricule}
                                onChange={(e) => setMatricule(e.target.value)}
                                className="py-2 shadow-sm"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.9rem",
                                  borderColor: theme.inputBorder,
                                  transition: "border-color 0.3s",
                                  backgroundColor: theme.cardBackground,
                                  color: theme.textDark,
                                }}
                                onFocus={(e) => (e.target.style.borderColor = theme.accentColor)}
                                onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
                              />
                            </Form.Group>

                            <Button
                              type="submit"
                              className="w-100 fw-semibold py-2"
                              disabled={loading || !email || !matricule}
                              style={{
                                backgroundColor: theme.accentColor,
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "0.95rem",
                                boxShadow: `0 6px 20px rgba(27, 38, 59, 0.3)`,
                                transition: "transform 0.2s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
                              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  {text.processing}
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-user-shield me-2"></i>
                                  {text.buttonText}
                                </>
                              )}
                            </Button>
                          </Form>
                        </>
                      )}
                    </Col>

                    {}
                    <Col
                      md={6}
                      className="d-none d-md-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: theme.rightPaneBackground,
                        borderRadius: isRTL ? "18px 0 0 18px" : "0 18px 18px 0",
                        flexDirection: "column",
                        color: "white",
                        padding: "2rem",
                        textAlign: "center",
                      }}
                    >
                      <div 
                        style={{
                          pointerEvents: "auto",
                          padding: "1rem",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                          border: "2px solid transparent",
                        }}
                        onClick={() => toggleLanguage()}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.borderColor = "transparent";
                        }}
                      >
                        <img
                          src="/images/logo.png"
                          alt="Logo"
                          style={{
                            width: "70px",
                            height: "70px",
                            marginBottom: "1rem",
                          }}
                          className="animate__animated animate__zoomIn"
                        />
                        <h5 className="fw-bold mb-2 animate__animated animate__fadeInUp" style={{ letterSpacing: "1px" }}>
                          SNRT / E-DAMI
                        </h5>
                        <p className="animate__animated animate__fadeInUp" style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                          {isRTL ? "استعادة الحساب" : "Récupération de compte"}
                        </p>
                        <div 
                          className="animate__animated animate__fadeInUp"
                          style={{
                            fontSize: "0.8rem",
                            opacity: 0.8,
                            marginTop: "0.5rem",
                            padding: "0.3rem 0.8rem",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "20px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          {currentLanguage === 'fr' ? 'FR • Français' : 'AR • العربية'}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>
        
        {}
        <footer className="mt-4 text-center">
          <p className="small" style={{ color: theme.textMuted }}>
            {text.footer}
          </p>
        </footer>
      </div>
    </>
  );
};

export default AccountRecoveryPage;

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../redux/user/userActions";
import { Loader, Message, Toast } from "../components";
import { Button, Card, Form, Row, Col, Container } from "react-bootstrap";
import { useLanguageSync } from "../hooks/useLanguageSync";
import "animate.css";


const translations = {
  fr: {
    title: "Bienvenue",
    subtitle: "Connectez-vous à votre compte E-Dami",
    labelEmail: "Email ou Matricule",
    placeholderEmail: "Veuillez saisir un email ou matricule",
    labelPassword: "Mot de passe",
    placeholderPassword: "Veuillez saisir un mot de passe",
    showPassword: "Afficher le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    rememberMe: "Se souvenir de moi",
    buttonText: "Se connecter",
    loggingIn: "Connexion...",
    recoverAccount: "Récupérer mon compte",
    footer: "© 2025 E-Dami. Tous droits réservés.",
  },
  ar: {
    title: "مرحبا بك",
    subtitle: "تسجيل الدخول إلى حسابك في E-Dami",
    labelEmail: "البريد الإلكتروني أو رقم التسجيل",
    placeholderEmail: "الرجاء إدخال بريد إلكتروني أو رقم تسجيل",
    labelPassword: "كلمة المرور",
    placeholderPassword: "الرجاء إدخال كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    rememberMe: "تذكرني", 
    buttonText: "تسجيل الدخول",
    loggingIn: "...جارٍ تسجيل الدخول",
    recoverAccount: "استعادة حسابي",
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
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;
  const { isRTL, currentLanguage, toggleLanguage } = useLanguageSync();

  const text = translations[currentLanguage] || translations.fr;

  useEffect(() => {
    if (userInfo) {
      navigate("/", { replace: true });
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login(email, password, currentLanguage));
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }
  };

  return (
    <>
      <Toast />
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
        <header className="mb-4" style={{ height: "60px" }}></header>

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

                      <Form onSubmit={submitHandler}>
                        <Form.Group controlId="email" className="mb-3">
                          <Form.Label
                            className="fw-semibold"
                            style={{ fontSize: "0.85rem", color: theme.textMuted }}
                          >
                            {text.labelEmail}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={text.placeholderEmail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleEmailKeyDown}
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

                        <Form.Group controlId="password" className="mb-3">
                          <Form.Label
                            className="fw-semibold"
                            style={{ fontSize: "0.85rem", color: theme.textMuted }}
                          >
                            {text.labelPassword}
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder={text.placeholderPassword}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              ref={passwordRef}
                              className="py-2 shadow-sm"
                              style={{
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                borderColor: theme.inputBorder,
                                transition: "border-color 0.3s",
                                paddingRight: isRTL ? "2.5rem" : "2.5rem",
                                paddingLeft: isRTL ? "2.5rem" : "0.75rem",
                                backgroundColor: theme.cardBackground,
                                color: theme.textDark,
                              }}
                              onFocus={(e) => (e.target.style.borderColor = theme.accentColor)}
                              onBlur={(e) => (e.target.style.borderColor = theme.inputBorder)}
                            />
                            <i
                              className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                              style={{
                                position: "absolute",
                                right: isRTL ? "auto" : "15px",
                                left: isRTL ? "15px" : "auto",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "auto",
                                color: theme.textMuted,
                              }}
                              onClick={() => setShowPassword(!showPassword)}
                            ></i>
                          </div>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Form.Check
                            label={<span style={{ fontSize: "0.8rem", color: theme.textMuted }}>{text.rememberMe}</span>}
                            className="small"
                          />
                          <Link
                            to="/mdp-oublie"
                            className="text-decoration-none fw-semibold small"
                            style={{ color: theme.accentColor, fontSize: "0.85rem" }}
                          >
                            {text.forgotPassword}
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className="w-100 fw-semibold py-2"
                          disabled={loading}
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
                              {text.loggingIn}
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-right-to-bracket me-2"></i>
                              {text.buttonText}
                            </>
                          )}
                        </Button>

                        <div className="text-center mt-3">
                          <Link
                            to="/recupertaion-compte"
                            className="text-decoration-none fw-semibold small"
                            style={{ color: theme.textMuted, fontSize: "0.85rem" }}
                          >
                            <i className="fa-solid fa-rotate-left me-2" style={{ color: theme.accentColor }}></i>
                            {text.recoverAccount}
                          </Link>
                        </div>
                      </Form>
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

export default LoginPage;
  
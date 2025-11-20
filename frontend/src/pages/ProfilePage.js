import React, { useEffect, useState } from "react";
import { Button, Card, Placeholder, Container, Row, Col, Badge, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchUserByID, removeUser } from "../redux/user/userActions";
import { Loader, Message } from "../components/";
import { Toast, Dialog } from "../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaCog, FaKey, FaIdCard, FaUserTie } from "react-icons/fa";

const ProfilePage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  
  const profileTranslations = {
    fr: {
      title: "Votre Profil",
      changePassword: "Changer le mot de passe",
      name: "Nom & Prénom",
      matricule: "Matricule",
      email: "Email",
      function: "Fonction",
      phone: "GSM",
      direction: "Direction",
      service: "Service",
      noDirection: "Cet utilisateur n'est rattaché à aucune direction",
      noService: "Cet utilisateur n'est rattaché à aucun service",
      loading: "Chargement..."
    },
    ar: {
      title: "ملفك الشخصي",
      changePassword: "تغيير كلمة المرور",
      name: "الاسم واللقب",
      matricule: "الرقم التسلسلي",
      email: "البريد الإلكتروني",
      function: "الوظيفة",
      phone: "الهاتف",
      direction: "الاتجاه",
      service: "الخدمة",
      noDirection: "هذا المستخدم غير مرتبط بأي اتجاه",
      noService: "هذا المستخدم غير مرتبط بأي خدمة",
      loading: "جاري التحميل..."
    }
  };

  const currentTranslations = profileTranslations[currentLanguage] || profileTranslations.fr;

  const userByID = useSelector((state) => state.userByID);
  const {
    loading: loadingUserByID,
    error: errorUserByID,
    user: recoveredUser,
    
  } = userByID;

  useEffect(() => {
    if (userInfo) {
      if (!callOnce) {
        dispatch(fetchUserByID(userInfo.id));
      }
      setCallOnce(true);
    }
  }, [callOnce, userInfo, userInfo]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            <FaUser className="me-2" style={{ color: '#007bff' }} />
            {currentTranslations.title}
          </h2>
        </div>
        <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
          <Link to="/changer-mdp" className="btn btn-sm btn-primary" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}>
            <FaKey className="me-2" />
            {currentTranslations.changePassword}
          </Link>
        </div>
      </div>

      {errorUserByID && (
        <Alert variant="danger" className="mb-3">
          {errorUserByID}
        </Alert>
      )}

      {loadingUserByID ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{currentTranslations.loading}</span>
          </div>
          <p className="mt-2 text-muted">{currentTranslations.loading}</p>
              </div>
      ) : (
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body>
            {}
            <div className="text-center mb-4">
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#007bff",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.5rem",
                  margin: "0 auto 1rem auto",
                }}
              >
                {recoveredUser && recoveredUser.prenom && recoveredUser.nom ? (
                  <>
                    {recoveredUser.prenom.charAt(0)}
                    {recoveredUser.nom.charAt(0)}
                  </>
                ) : (
                  <FaUser />
                )}
              </div>
              <h5 className="mb-1">
                {recoveredUser && recoveredUser.prenom} {recoveredUser && recoveredUser.nom}
              </h5>
              <p className="text-muted small mb-3">
                {currentTranslations.matricule}: {recoveredUser && recoveredUser.matricule}
              </p>
            </div>

            <hr className="my-3" />

            {}
            <Row className="g-3">
              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaUser className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.name}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.prenom} {recoveredUser && recoveredUser.nom}
                  </div>
              </div>
              </Col>

              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaIdCard className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.matricule}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.matricule}
              </div>
            </div>
              </Col>

              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaEnvelope className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.email}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.email && recoveredUser.email.toLowerCase()}
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaUserTie className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.function}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.fonction ? (
                      recoveredUser.fonction
                    ) : (
                      <span className="text-muted">
                        {isRTL ? "غير محدد" : "Non spécifié"}
                      </span>
            )}
          </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaPhone className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.phone}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.gsm ? (
                      recoveredUser.gsm
                    ) : (
                      <span className="text-muted">
                        {isRTL ? "غير محدد" : "Non spécifié"}
                      </span>
            )}
          </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaBuilding className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.direction}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.direction ? (
                      <Badge bg="primary" style={{ fontSize: "0.75rem" }}>{recoveredUser.direction.libelle}</Badge>
                    ) : (
                      <span className="text-danger small">
                        {currentTranslations.noDirection}
                      </span>
                    )}
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <div className="p-2 border rounded">
                  <div className="small fw-semibold text-muted d-flex align-items-center mb-1">
                    <FaCog className="me-2" style={{ color: '#007bff' }} />
                    {currentTranslations.service}
                  </div>
                  <div className="small">
                    {recoveredUser && recoveredUser.service ? (
                      <Badge bg="success" style={{ fontSize: "0.75rem" }}>{recoveredUser.service.libelle}</Badge>
                    ) : (
                      <span className="text-danger small">
                        {currentTranslations.noService}
                      </span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
        </Card.Body>
      </Card>
      )}
    </div>
  );
};

export default ProfilePage;

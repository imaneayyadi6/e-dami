import React, { useEffect, useState } from "react";
import { Button, Card, Form, Row, Col, Spinner, Container, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserIntrim,
  getUserIntrim,
  putUserIntrim,
  resetDeleteUserIntrim,
  resetPutUserIntrim,
  fetchUsers,
} from "../../redux/user/userActions";
import { Dialog } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaUserPlus, FaUserMinus, FaUsers, FaIdCard } from "react-icons/fa";

const DefinirInterimePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [matricule, setMatricule] = useState(null);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  
  const interimTranslations = {
    fr: {
      title: "Gestion des Intérims",
      currentInterim: "Intérim actuel",
      addInterim: "Ajouter un Intérim",
      selectUser: "Choisir un utilisateur :",
      selectUserPlaceholder: "Sélectionner un utilisateur...",
      enterMatricule: "Ou saisissez le matricule :",
      matriculePlaceholder: "Ex: 100200",
      defineInterim: "Définir Intérim",
      removeInterim: "Supprimer Intérim",
      removeInterimMessage: "Pour définir un nouvel intérim, supprimez d'abord l'intérim actuel.",
      removeInterimTitle: "Suppression d'intérim",
      removeInterimConfirm: "Êtes-vous sûr de vouloir supprimer cet intérim ?",
      addInterimTitle: "Ajout d'intérim",
      addInterimConfirm: "Êtes-vous sûr de vouloir ajouter cet intérim ?",
      matricule: "Matricule",
      loading: "Chargement..."
    },
    ar: {
      title: "إدارة النيابة",
      currentInterim: "النيابة الحالية",
      addInterim: "إضافة نيابة",
      selectUser: "اختيار مستخدم :",
      selectUserPlaceholder: "اختر مستخدم...",
      enterMatricule: "أو أدخل الرقم التسلسلي :",
      matriculePlaceholder: "مثال: 100200",
      defineInterim: "تحديد النيابة",
      removeInterim: "حذف النيابة",
      removeInterimMessage: "لتحديد نيابة جديدة، يجب حذف النيابة الحالية أولاً.",
      removeInterimTitle: "حذف النيابة",
      removeInterimConfirm: "هل أنت متأكد من حذف هذه النيابة؟",
      addInterimTitle: "إضافة نيابة",
      addInterimConfirm: "هل أنت متأكد من إضافة هذه النيابة؟",
      matricule: "الرقم التسلسلي",
      loading: "جاري التحميل..."
    }
  };

  const currentTranslations = interimTranslations[currentLanguage] || interimTranslations.fr;

  const { loading: loadingUserGetInterim, interim, error: errorUserGetInterim } = useSelector(
    (state) => state.userGetInterim
  );
  const { loading: loadingUserDeleteInterim, success: successUserDeleteInterim } = useSelector(
    (state) => state.userDeleteInterim
  );
  const { loading: loadingUserPutInterim, success: successUserPutInterim } = useSelector(
    (state) => state.userPutInterim
  );
  const { users, loading: loadingUserList } = useSelector((state) => state.userList);

  useEffect(() => {
    if (!callOnce) {
      dispatch(getUserIntrim());
      dispatch(fetchUsers());
      setCallOnce(true);
    }
  }, [callOnce, dispatch]);

  useEffect(() => {
    if (successUserDeleteInterim) {
      dispatch(getUserIntrim());
      dispatch(resetDeleteUserIntrim());
    }
  }, [successUserDeleteInterim, dispatch]);

  useEffect(() => {
    if (successUserPutInterim) {
      setMatricule(null);
      dispatch(getUserIntrim());
      dispatch(resetPutUserIntrim());
    }
  }, [successUserPutInterim, dispatch]);

  const supprimerInterimHandler = () => {
    Dialog.open({
      title: currentTranslations.removeInterimTitle,
      message: currentTranslations.removeInterimConfirm,
      onYes: () => dispatch(deleteUserIntrim()),
    });
  };

  const addInterimHandler = () => {
    Dialog.open({
      title: currentTranslations.addInterimTitle,
      message: currentTranslations.addInterimConfirm,
      onYes: () => {
        if (matricule) {
          dispatch(putUserIntrim(matricule));
        }
      },
    });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            <FaUsers className="me-2" style={{ color: '#007bff' }} />
            {currentTranslations.title}
      </h2>
        </div>
      </div>

      {errorUserGetInterim && (
        <Alert variant="danger" className="mb-3">
          {errorUserGetInterim}
        </Alert>
      )}

      {(loadingUserGetInterim || loadingUserDeleteInterim || loadingUserPutInterim) && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">{currentTranslations.loading}</p>
        </div>
      )}

      {!loadingUserGetInterim && interim && interim.haveInterim ? (
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="mb-3">
              <FaIdCard size={32} className="mb-2" style={{ color: '#007bff' }} />
              <h5 style={{ color: "#007bff", fontWeight: "600" }}>
                {currentTranslations.currentInterim}
              </h5>
            </div>
            <div className="mb-3">
              <p className="h6 mb-1">
                <strong>{interim.prenom} {interim.nom}</strong>
              </p>
              <p className="text-muted small">
                {currentTranslations.matricule}: <strong>{interim.matricule}</strong>
              </p>
            </div>
            <Alert variant="info" className="mb-3" style={{ fontSize: '0.875rem' }}>
              {currentTranslations.removeInterimMessage}
            </Alert>
            <Button
              variant="primary"
              onClick={supprimerInterimHandler}
              size="sm"
              style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
            >
              <FaUserMinus className="me-2" />
              {currentTranslations.removeInterim}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Body>
              <div className="mb-3">
                <FaUserPlus size={20} className="mb-2" style={{ color: '#007bff' }} />
                <h5 style={{ color: "#007bff", fontWeight: "600" }}>
                  {currentTranslations.addInterim}
                </h5>
                <p className="text-muted small">
                  {isRTL ? "اختر مستخدم أو أدخل الرقم التسلسلي مباشرة." : "Choisissez un utilisateur ou saisissez directement le matricule."}
                </p>
              </div>

            <Form>
              <Row className="mb-3">
                <Col md={12}>
                    <Form.Label className="fw-semibold small">
                      {currentTranslations.selectUser}
                    </Form.Label>
                  <Form.Select
                    value={matricule || ""}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="mb-2"
                      size="sm"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                  >
                      <option value="">{currentTranslations.selectUserPlaceholder}</option>
                    {users &&
                      users.map((user) => (
                        <option key={user._id} value={user.matricule}>
                            {user.prenom} {user.nom} ({currentTranslations.matricule}: {user.matricule})
                        </option>
                      ))}
                  </Form.Select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                      <Form.Label className="fw-semibold small">
                        {currentTranslations.enterMatricule}
                      </Form.Label>
                      <Form.Control
                        placeholder={currentTranslations.matriculePlaceholder}
                        type="number"
                        min={10000}
                        max={9999999}
                        value={matricule || ""}
                        onChange={(e) => setMatricule(e.target.value)}
                        size="sm"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                </Col>
              </Row>

              <Button
                  variant="primary"
                onClick={addInterimHandler}
                disabled={!matricule}
                  className="w-100"
                  size="sm"
                  style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                >
                  <FaUserPlus className="me-2" />
                  {currentTranslations.defineInterim}
              </Button>
            </Form>
            </Card.Body>
          </Card>

          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">
                <FaUsers className="me-2" style={{ color: '#007bff' }} />
                {isRTL ? "المستخدمون المتاحون" : "Utilisateurs disponibles"}
              </h6>
              <div className="row g-2">
            {users &&
              users.map((user) => (
                    <div key={user._id} className="col-lg-3 col-md-4 col-sm-6">
                      <div
                        className="p-2 text-center border rounded"
                        style={{ pointerEvents: "auto", transition: "all 0.2s ease" }}
                  onClick={() => setMatricule(user.matricule)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    style={{
                            width: 40,
                            height: 40,
                      borderRadius: "50%",
                            background: "#007bff",
                            color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                            margin: "0 auto 0.5rem auto",
                    }}
                  >
                    {user.prenom.charAt(0)}
                    {user.nom.charAt(0)}
                  </div>
                        <div className="small fw-semibold">
                    {user.prenom} {user.nom}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {currentTranslations.matricule}: {user.matricule}
                        </div>
                      </div>
                    </div>
              ))}
          </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default DefinirInterimePage;

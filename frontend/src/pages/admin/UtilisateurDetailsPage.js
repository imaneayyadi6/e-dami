import React, { useEffect, useState } from "react";
import { Button, Card, Placeholder } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchUserByID, removeUser } from "../../redux/user/userActions";
import { Loader, Message } from "../../components/";
import { Toast, Dialog } from "../../services";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { useTranslation } from "react-i18next";
import { FaUser, FaIdBadge, FaEnvelope, FaBriefcase, FaPhone, FaBuilding, FaSitemap, FaUserTie, FaUserCheck, FaEdit, FaUserTimes, FaUserPlus, FaArrowLeft } from "react-icons/fa";

const UtilisateurDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  
  
  const { currentLanguage, isRTL } = useLanguageSync();
  const { t } = useTranslation();
  const userByID = useSelector((state) => state.userByID);
  const {
    loading: loadingUserByID,
    error: errorUserByID,
    user: recoveredUser,
  } = userByID;

  const userRemove = useSelector((state) => state.userRemove);
  const {
    loading: loadingUserRemove,
    error: errorUserRemove,
    success: successUserRemove,
  } = userRemove;

  const deleteUserHandler = () => {
    let message = "";
    if (!recoveredUser.isActive) {
      message =
        "Êtes-vous sûr(e) de vouloir activer le compte de cet utilisateur ?";
    } else {
      message =
        "Êtes-vous sûr(e) de vouloir désactiver le compte de cet utilisateur ?";
    }

    Dialog.open({
      title: "Confirmation",
      message,
      onYes: () => {
        dispatch(removeUser(recoveredUser._id));
      },
    });
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchUserByID(id));
      setCallOnce(true);
    }
    if (successUserRemove) {
      Toast.open({
        type: "success",
        message: `le compte de cet utilisateur a été ${
          !recoveredUser.isActive ? "désactiver" : "activer"
        } avec succès`,
      });
    }
  }, [successUserRemove, recoveredUser]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-3">
        <Link
          to="/admin/utilisateurs"
          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
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
        <Message type="danger" itWillBeHidden>
          {errorUserByID}
        </Message>
      )}
      {errorUserRemove && (
        <Message type="danger" itWillBeHidden>
          {errorUserRemove}
        </Message>
      )}

      {loadingUserRemove && <Loader />}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            {isRTL ? (
              
              <>
                <div className="d-flex gap-1" style={{ flexDirection: 'row' }}>
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/admin/modifier-utilisateur/${recoveredUser && recoveredUser._id}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <FaEdit className="me-1" style={{ fontSize: '0.65rem' }} />
                    تعديل المستخدم
                  </Link>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={loadingUserByID || !recoveredUser || loadingUserRemove}
                    onClick={deleteUserHandler}
                    style={{ 
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      color: recoveredUser && !recoveredUser.isActive ? '#198754' : '#dc3545',
                      borderColor: recoveredUser && !recoveredUser.isActive ? '#198754' : '#dc3545'
                    }}
                  >
                    {loadingUserRemove ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : recoveredUser && !recoveredUser.isActive ? (
                      <FaUserPlus className="me-1" style={{ fontSize: '0.65rem' }} />
                    ) : (
                      <FaUserTimes className="me-1" style={{ fontSize: '0.65rem' }} />
                    )}
                    {loadingUserRemove ? (
                      "جاري المعالجة..."
                    ) : recoveredUser && !recoveredUser.isActive ? (
                      "تفعيل الحساب"
                    ) : (
                      "تعطيل الحساب"
                    )}
                  </Button>
                </div>
                <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: 'row-reverse' }}>
                  {recoveredUser && recoveredUser.isActive ? (
                    <span className="text-success d-flex align-items-center" style={{ gap: 6, flexDirection: 'row-reverse' }}>
                      <FaUserCheck style={{ fontSize: '0.875rem' }} />
                      حساب المستخدم مفعل
                    </span>
                  ) : (
                    <span className="text-danger d-flex align-items-center" style={{ gap: 6, flexDirection: 'row-reverse' }}>
                      <FaUserTimes style={{ fontSize: '0.875rem' }} />
                      حساب المستخدم معطل
                    </span>
                  )}
                </div>
              </>
            ) : (
              
              <>
                <div className="d-flex align-items-center" style={{ gap: 8, flexDirection: 'row' }}>
                  {recoveredUser && recoveredUser.isActive ? (
                    <span className="text-success d-flex align-items-center" style={{ gap: 6, flexDirection: 'row' }}>
                      <FaUserCheck style={{ fontSize: '0.875rem' }} />
                      compte utilisateur activer
                    </span>
                  ) : (
                    <span className="text-danger d-flex align-items-center" style={{ gap: 6, flexDirection: 'row' }}>
                      <FaUserTimes style={{ fontSize: '0.875rem' }} />
                      compte utilisateur desactiver
                    </span>
                  )}
                </div>
                <div className="d-flex gap-1" style={{ flexDirection: 'row' }}>
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/admin/modifier-utilisateur/${recoveredUser && recoveredUser._id}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <FaEdit className="me-1" style={{ fontSize: '0.65rem' }} />
                    Modifier cet utilisateur
                  </Link>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={loadingUserByID || !recoveredUser || loadingUserRemove}
                    onClick={deleteUserHandler}
                    style={{ 
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      color: recoveredUser && !recoveredUser.isActive ? '#198754' : '#dc3545',
                      borderColor: recoveredUser && !recoveredUser.isActive ? '#198754' : '#dc3545'
                    }}
                  >
                    {loadingUserRemove ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : recoveredUser && !recoveredUser.isActive ? (
                      <FaUserPlus className="me-1" style={{ fontSize: '0.65rem' }} />
                    ) : (
                      <FaUserTimes className="me-1" style={{ fontSize: '0.65rem' }} />
                    )}
                    {loadingUserRemove ? (
                      "Traitement..."
                    ) : recoveredUser && !recoveredUser.isActive ? (
                      "activer le compte"
                    ) : (
                      "desactiver le compte"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          <hr />

          <div className="d-flex justify-content-between align-items-start" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? (
                
                <>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaBriefcase style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                      الوظيفة :
                    </label>
                    {loadingUserByID ? (
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'right' }}>
                        {recoveredUser && recoveredUser.fonction ? recoveredUser.fonction : "غير محدد"}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaPhone style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                      رقم الهاتف :
                    </label>
                    {loadingUserByID ? (
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'right' }}>
                        {recoveredUser && recoveredUser.gsm ? recoveredUser.gsm : "غير محدد"}
                      </small>
                    )}
                  </div>
                </>
              ) : (
                
                <>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaUser style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                  Nom & prenom :
                </label>
                    {loadingUserByID ? (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'left' }}>
                        {recoveredUser && recoveredUser.prenom} {recoveredUser && recoveredUser.nom}
                      </small>
                )}
              </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaIdBadge style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                  Matricule :
                </label>
                    {loadingUserByID ? (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'left' }}>
                  {recoveredUser && recoveredUser.matricule}
                </small>
                    )}
              </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaEnvelope style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                  Email :
                </label>
                    {loadingUserByID ? (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'left' }}>
                  {recoveredUser && recoveredUser.email}
                </small>
                    )}
              </div>
                </>
              )}
            </div>

            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? (
                
                <>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaUser style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                      الاسم الكامل :
                    </label>
                    {loadingUserByID ? (
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'right' }}>
                        {recoveredUser && recoveredUser.prenom} {recoveredUser && recoveredUser.nom}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaIdBadge style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                      رقم الموظف :
                    </label>
                    {loadingUserByID ? (
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'right' }}>
                        {recoveredUser && recoveredUser.matricule}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaEnvelope style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                      البريد الإلكتروني :
                    </label>
                    {loadingUserByID ? (
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'right' }}>
                        {recoveredUser && recoveredUser.email}
                      </small>
                    )}
                  </div>
                </>
              ) : (
                
                <>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaBriefcase style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                  Fonction :
                </label>
                    {loadingUserByID ? (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'left' }}>
                        {recoveredUser && recoveredUser.fonction ? recoveredUser.fonction : "Non spécifié"}
                      </small>
                )}
              </div>
                  <div className="mb-3">
                    <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: 'row' }}>
                      <FaPhone style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
                  GSM :
                </label>
                    {loadingUserByID ? (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                    ) : (
                      <small className="d-block text-muted" style={{ textAlign: 'left' }}>
                        {recoveredUser && recoveredUser.gsm ? recoveredUser.gsm : "Non spécifié"}
                      </small>
                )}
              </div>
                </>
              )}
            </div>
          </div>

          <hr />

          <div className="mb-3">
            <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: isRTL ? 'row' : 'row' }}>
              <FaBuilding style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
              {currentLanguage === "ar" ? "الإدارة" : "Direction"} :
            </label>
            {loadingUserByID ? (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            ) : (
              <small className={recoveredUser && recoveredUser.direction ? "d-block text-muted" : "d-block text-danger"} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {recoveredUser && recoveredUser.direction ? (
                  currentLanguage === "ar" ? `إدارة ${recoveredUser.direction.libelle}` : `Direction ${recoveredUser.direction.libelle}`
                ) : (
                  currentLanguage === "ar" ? "هذا المستخدم غير مرتبط بأي إدارة" : "Cet utilisateur n'est rattaché à aucune direction"
                )}
              </small>
            )}
          </div>
          <div className="mb-3">
            <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: isRTL ? 'row' : 'row' }}>
              <FaSitemap style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
              {currentLanguage === "ar" ? "الخدمة" : "Service"} :
            </label>
            {loadingUserByID ? (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            ) : (
              <small className={recoveredUser && recoveredUser.service ? "d-block text-muted" : "d-block text-danger"} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {recoveredUser && recoveredUser.service ? (
                  currentLanguage === "ar" ? `خدمة ${recoveredUser.service.libelle}` : `Service ${recoveredUser.service.libelle}`
                ) : (
                  currentLanguage === "ar" ? "هذا المستخدم غير مرتبط بأي خدمة" : "Cet utilisateur n'est rattaché à aucun service"
                )}
              </small>
            )}
          </div>
          <hr />

          <div className="mb-3">
            <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: isRTL ? 'row' : 'row' }}>
              <FaUserTie style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
              {currentLanguage === "ar" ? "منصب المسؤولية" : "Responsabilité"} :
            </label>
            {loadingUserByID ? (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            ) : (
              <small className={recoveredUser && (recoveredUser.isDirecteur || recoveredUser.isChefDeService) ? "d-block text-muted" : "d-block text-danger"} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {recoveredUser && recoveredUser.isDirecteur ? (
                  currentLanguage === "ar" ? "مدير" : "Directeur"
                ) : recoveredUser && recoveredUser.isChefDeService ? (
                  currentLanguage === "ar" ? "رئيس الخدمة" : "Chef de service"
                ) : (
                  currentLanguage === "ar" ? "هذا المستخدم ليس له منصب مسؤولية" : "Cet utilisateur n'a pas de poste de responsabilité"
                )}
              </small>
            )}
          </div>

          <hr />

          <div className="mb-3">
            <label className="d-flex align-items-center text-bold mb-1" style={{ fontWeight: "bold", gap: 8, flexDirection: isRTL ? 'row' : 'row' }}>
              <FaUserCheck style={{ color: '#0d6efd', fontSize: '0.875rem' }} />
              {currentLanguage === "ar" ? "الأدوار" : "Roles"} :
            </label>
            {loadingUserByID ? (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            ) : (
              <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {recoveredUser && recoveredUser.roles && recoveredUser.roles.length > 0 ? (
                  recoveredUser.roles.map((role) => (
                    <small key={role._id} className="d-block text-muted">
                      {role.role.libelle}
                    </small>
                  ))
                ) : (
                  <small className="text-danger">
                    {currentLanguage === "ar" ? "هذا المستخدم ليس له أدوار محددة" : "Cet utilisateur n'a pas de rôles assignés"}
                  </small>
                )}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UtilisateurDetailsPage;

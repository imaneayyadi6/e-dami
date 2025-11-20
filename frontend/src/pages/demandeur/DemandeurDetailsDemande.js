import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getDemandeurDemandeByID } from "../../redux/demande/demandeActions";
import {
  DamiDemande,
  DamiLoading,
  Message,
  WarningMessage,
} from "../../components";
import { Alert, Button, Card, Badge, Row, Col } from "react-bootstrap";
import { getTypeApprobation } from "../../services";
import { getFileUrl } from "../../services/fileService";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaArrowLeft, FaDownload, FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaFileAlt, FaCalendarAlt, FaHistory } from "react-icons/fa";

const STATUS = {
  encours: "warning",
  approuve: "success",
  refuse: "danger",
};

const getCv = (gender) => {
  return gender === "M" ? "Mr. " : gender === "F" ? "Mme. " : ""
}

const DemandeurDetailsDemande = () => {
  const [callOnce, setCallOnce] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
  const demandeDemandeurById = useSelector(
    (state) => state.demandeDemandeurById
  );
  const {
    loading: loadingDemandeByID,
    error: errorDemandeByID,
    demande: recoveredDemande,
  } = demandeDemandeurById;

  
  const translations = {
    fr: {
      backToDemandes: "Retour aux demandes",
      downloadPDF: "Télécharger PDF",
      globalStatus: "Statut global de la demande",
      chronology: "Chronologie",
      requestDetails: t('dami.requestDetails', { defaultValue: 'Détails de la demande' }),
      approvedBy: "Votre demande a été approuvée par",
      rejectedBy: "Votre demande a été refusée par",
      sentTo: "Votre demande a été envoyée à",
      inProgress: "en cours",
      approved: "approuvée",
      rejected: "refusée",
      admin: "administrateur",
      signatory: "signataire",
      approvalReason: "Motif d'approbation",
      rejectionReason: "Motif de refus",
      attachedFile: "Fichier joint",
      viewFile: "Voir le fichier",
      on: "le",
      at: "à",
      notYet: "pas encore",
      andForThat: "et pour cela, elle a été finalisée et traitée avec succès",
      interim: "intérim",
      requestNotFound: "demande introuvable !"
    },
    ar: {
      backToDemandes: "العودة إلى الطلبات",
      downloadPDF: "تحميل PDF",
      globalStatus: "الحالة العامة للطلب",
      chronology: "التسلسل الزمني",
      requestDetails: t('dami.requestDetails', { defaultValue: 'تفاصيل الطلب' }),
      approvedBy: "تمت الموافقة على طلبك من قبل",
      rejectedBy: "تم رفض طلبك من قبل",
      sentTo: "تم إرسال طلبك إلى",
      inProgress: "قيد التنفيذ",
      approved: "موافق عليه",
      rejected: "مرفوض",
      admin: "مدير",
      signatory: "مُوقّع",
      approvalReason: "سبب الموافقة",
      rejectionReason: "سبب الرفض",
      attachedFile: "ملف مرفق",
      viewFile: "عرض الملف",
      on: "في",
      at: "في الساعة",
      notYet: "ليس بعد",
      andForThat: "ولهذا، تم إنهاؤها ومعالجتها بنجاح",
      interim: "مؤقت",
      requestNotFound: "الطلب غير موجود!"
    }
  };

  const currentTranslations = translations[currentLanguage] || translations.fr;

  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandeurDemandeByID(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link 
          className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center"
          to="/mes-demandes"
          style={{ 
            gap: 6,
            height: 32,
            background: 'transparent',
            border: '1px solid #dee2e6',
            color: '#6c757d',
            padding: '4px 12px'
          }}
        >
          <FaArrowLeft className={isRTL ? 'ms-1' : 'me-1'} />
          {currentTranslations.backToDemandes}
        </Link>
        
        {recoveredDemande && recoveredDemande.status === 'approuvée' && (
          <Button
            variant="success"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={async () => {
              try {
                const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
                
                
                const response = await fetch(`/api/demandes/${recoveredDemande._id}/pdf?token=${token}&lang=${currentLanguage}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (response.ok) {
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `demande_${recoveredDemande.option?.libelle?.replace(/\s+/g, '_')}_${recoveredDemande?.demandeur?.nom || 'unknown'}_${recoveredDemande?.demandeur?.prenom || 'unknown'}_${currentLanguage}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } else {
                  const errorData = await response.text();
                  console.error('Erreur PDF:', errorData);
                  alert('Erreur lors du téléchargement du PDF');
                }
                
              } catch (error) {
                console.error('Erreur téléchargement PDF:', error);
                alert('Erreur lors du téléchargement du PDF');
              }
            }}
            style={{ 
              gap: 6,
              height: 32,
              background: '#198754',
              border: 'none',
              color: '#fff',
              padding: '4px 12px'
            }}
          >
            <FaDownload />
            {currentTranslations.downloadPDF}
          </Button>
        )}
      </div>
      
      <div className="mt-1">
        {errorDemandeByID && (
          <Message type="danger" itWillBeHidden>
            {errorDemandeByID}
          </Message>
        )}
      </div>
      
      {loadingDemandeByID ? (
        <DamiLoading />
      ) : (
        recoveredDemande && (
          <div>
            {}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div 
                      className="d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 12, 
                        background: recoveredDemande.status === 'approuvée' ? '#d1e7dd' : 
                                   recoveredDemande.status === 'refusée' ? '#f8d7da' : '#fff3cd'
                      }}
                    >
                      {recoveredDemande.status === 'approuvée' ? (
                        <FaCheckCircle style={{ color: '#198754', fontSize: 24 }} />
                      ) : recoveredDemande.status === 'refusée' ? (
                        <FaTimesCircle style={{ color: '#dc3545', fontSize: 24 }} />
                      ) : (
                        <FaClock style={{ color: '#ffc107', fontSize: 24 }} />
                      )}
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {currentTranslations.globalStatus}
            </h5>
                      <Badge 
                        bg={recoveredDemande.status === 'approuvée' ? 'success' : 
                            recoveredDemande.status === 'refusée' ? 'danger' : 'warning'}
                        className="text-white"
                        style={{ fontSize: '0.875rem', padding: '6px 12px' }}
                      >
                        {recoveredDemande.status === 'approuvée' ? currentTranslations.approved :
                         recoveredDemande.status === 'refusée' ? currentTranslations.rejected :
                         currentTranslations.inProgress}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-flex align-items-center">
                      <FaCalendarAlt className={isRTL ? 'ms-1' : 'me-1'} />
                      {new Date(recoveredDemande.dateDemande).toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Row className="g-4">
                {}
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 1rem' }}>
                    <h6 className="mb-0 d-flex align-items-center" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      <FaHistory className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd', fontSize: '1rem' }} />
                      {currentTranslations.chronology}
                    </h6>
                  </Card.Header>
                  <Card.Body className="p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <div className="timline-container">
                      <span className="timeline-bar"></span>
                      <div className="timline-content">
                        {recoveredDemande.traitement && recoveredDemande.traitement.map((tr, index) => (
                          <div key={index}>
                            {tr.status !== "en cours" && (
                              <div className="timline-item mb-2">
                                <div className="d-flex align-items-start">
                                  <div 
                                    className="d-flex align-items-center justify-content-center me-2"
                                    style={{ 
                                      width: 28, 
                                      height: 28, 
                                      borderRadius: 6, 
                                      background: tr.status === 'approuve' ? '#d1e7dd' : '#f8d7da',
                                      flexShrink: 0
                                    }}
                                  >
                                    {tr.status === 'approuve' ? (
                                      <FaCheckCircle style={{ color: '#198754', fontSize: 14 }} />
                                    ) : (
                                      <FaTimesCircle style={{ color: '#dc3545', fontSize: 14 }} />
                                    )}
                                  </div>
                                  <div className="flex-grow-1">
                                <Alert
                                      variant={STATUS[String(tr.status).replace(/\s/g, "")]}
                                      className="mb-0"
                                      style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                >
                                  {tr.status === "approuve" && (
                                        <div>
                                          <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                            {currentTranslations.approvedBy} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                      <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                        " " +
                                        (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                            {tr.interim && <span> ({currentTranslations.interim})</span>} en tant que{" "}
                                      {tr.type === 'admin' ? (
                                              <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{currentTranslations.admin}</span>
                                      ) : tr && tr.code && tr.code !== "atr" ? (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: getTypeApprobation(tr.code),
                                          }}
                                        ></span>
                                      ) : (
                                              <span style={{ fontWeight: 'bold' }}>{currentTranslations.signatory}</span>
                                      )}
                                      {Number(index) === 0 && (
                                              <span>, {currentTranslations.andForThat}</span>
                                            )}
                                          </p>
                                          {tr.motifValidation && (
                                            <div className="mt-1 p-1" style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
                                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                <strong>{currentTranslations.approvalReason}:</strong> {tr.motifValidation}
                                              </small>
                                            </div>
                                          )}
                                        </div>
                                  )}
                                  {tr.status === "refuse" && (
                                        <div>
                                          <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                            {currentTranslations.rejectedBy} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                      <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                        " " +
                                        (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                            {tr.interim && <span> ({currentTranslations.interim})</span>} en tant que{" "}
                                      {tr.type === 'admin' ? (
                                              <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{currentTranslations.admin}</span>
                                      ) : tr && tr.code && tr.code !== "atr" ? (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: getTypeApprobation(tr.code),
                                          }}
                                        ></span>
                                      ) : (
                                              <span style={{ fontWeight: 'bold' }}>{currentTranslations.signatory}</span>
                                            )}.
                                          </p>
                                          {tr.motifRefus && (
                                            <div className="mt-1 p-1" style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
                                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                <strong>{currentTranslations.rejectionReason}:</strong> {tr.motifRefus}
                                              </small>
                                            </div>
                                          )}
                                      {tr.fichierMotifRefus && (
                                            <div className="mt-1">
                                          <a 
                                            href={getFileUrl(tr.fichierMotifRefus)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                                style={{ gap: 4, fontSize: '0.7rem', padding: '2px 6px' }}
                                              >
                                                <FaFileAlt style={{ fontSize: '0.7rem' }} />
                                                {currentTranslations.viewFile}
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <div className="d-flex justify-content-end mt-1">
                                        <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                          <FaCalendarAlt className={isRTL ? 'ms-1' : 'me-1'} style={{ fontSize: '0.7rem' }} />
                                          {tr.dateTraitement ? (
                                            <>
                                              {currentTranslations.on}{" "}
                                              {new Date(tr.dateTraitement).toLocaleDateString('fr-FR')}{" "}
                                              {currentTranslations.at}{" "}
                                              {new Date(tr.dateTraitement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </>
                                          ) : (
                                            currentTranslations.notYet
                                          )}
                                        </small>
                                      </div>
                                </Alert>
                                  </div>
                                </div>
                              </div>
                            )}

                            {tr.status === "en cours" && (
                              <div className="timline-item mb-2">
                                <div className="d-flex align-items-start">
                                  <div 
                                    className="d-flex align-items-center justify-content-center me-2"
                                    style={{ 
                                      width: 28, 
                                      height: 28, 
                                      borderRadius: 6, 
                                      background: '#fff3cd',
                                      flexShrink: 0
                                    }}
                                  >
                                    <FaClock style={{ color: '#ffc107', fontSize: 14 }} />
                                  </div>
                                  <div className="flex-grow-1">
                                    <Alert variant="warning" className="mb-0" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                                      <div>
                                        <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                          {currentTranslations.sentTo} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                          <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                            " " +
                                            (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                          {tr.interim && <span> ({currentTranslations.interim})</span>} pour la traiter en tant que{" "}
                                          {tr.type === 'admin' ? (
                                            <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{currentTranslations.admin}</span>
                                          ) : tr && tr.code && tr.code !== "atr" ? (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: getTypeApprobation(tr.code),
                                              }}
                                            ></span>
                                          ) : (
                                            <span style={{ fontWeight: 'bold' }}>{currentTranslations.signatory}</span>
                                          )}
                                        </p>
                                        <div className="d-flex justify-content-end">
                                          <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                            <FaCalendarAlt className={isRTL ? 'ms-1' : 'me-1'} style={{ fontSize: '0.7rem' }} />
                                            {currentTranslations.on} {new Date(tr.dateEnvoi).toLocaleDateString('fr-FR')}{" "}
                                            {currentTranslations.at} {new Date(tr.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                          </small>
                                        </div>
                                      </div>
                                    </Alert>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

                {}
              <Col md={9}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '1rem 1.5rem' }}>
                    <h5 className="mb-0 d-flex align-items-center" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      <FaFileAlt className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd', fontSize: '1.2rem' }} />
                      {currentTranslations.requestDetails}
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0" style={{ minHeight: '500px' }}>
                    <div style={{ padding: '1.5rem', fontSize: isRTL ? '1rem' : '0.95rem', lineHeight: '1.6' }}>
                    <DamiDemande demande={recoveredDemande} />
                  </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )
      )}
      {!loadingDemandeByID && !recoveredDemande && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)' }}>
              <FaFileAlt style={{ color: '#dc3545', fontSize: 28 }} />
            </div>
            <h5 className="text-muted mb-2">{currentTranslations.requestNotFound}</h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              {currentLanguage === 'ar' ? 'الطلب المطلوب غير موجود أو تم حذفه' : 'La demande demandée n\'existe pas ou a été supprimée'}
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DemandeurDetailsDemande;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDemandesPreviewDetailsTeam,
  resetGetDemandesPreviewDetailsTeam,
} from "../../redux/demande/demandeActions";
import {
  DamiDemande,
  DamiLoading,
  Message,
  WarningMessage,
} from "../../components";
import { Placeholder, Alert, Button, Card, Badge, Row, Col } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getTypeApprobation } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaArrowLeft, FaDownload, FaClock, FaCheckCircle, FaTimesCircle, FaFileAlt, FaCalendarAlt, FaHistory } from "react-icons/fa";

const STATUS = {
  encours: "warning",
  approuve: "success",
  refuse: "danger",
};

const getCv = (gender) => {
  return gender === "M" ? "Mr. " : gender === "F" ? "Mme. " : ""
}

const DemandesPreviewDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  
  const { currentLanguage, isRTL } = useLanguageSync();
  const { t } = useTranslation();

  const demandePreviewTeamDetails = useSelector(
    (state) => state.demandePreviewTeamDetails
  );

  const {
    loading: demandePreviewTeamDetailsLoading,
    success: demandePreviewTeamDetailsSuccess,
    error: demandePreviewTeamDetailsError,
    demande,
  } = demandePreviewTeamDetails;

  const { id, idTraitement } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!callOnce) {
      
      dispatch(getDemandesPreviewDetailsTeam(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link 
          className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center"
          to={`${
            userInfo &&
            userInfo.roles.findIndex((r) => r && r.role && r.role.code === "admin") !== -1
              ? "/demandes/all/apercu"
              : "/demandes/apercu"
          }`}
          onClick={() => {
            dispatch(resetGetDemandesPreviewDetailsTeam());
          }}
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
          {t('details.backToRequests', { defaultValue: 'demandes' })}
        </Link>
        
        {demande && demande.status === 'approuvée' && (
          <Button
            variant="success"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={async () => {
              try {
                const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
                
                
                const response = await fetch(`/api/demandes/${demande._id}/pdf?token=${token}&lang=${currentLanguage}`, {
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
                  link.download = `demande_${demande.option?.libelle?.replace(/\s+/g, '_')}_${demande?.demandeur?.nom || 'unknown'}_${demande?.demandeur?.prenom || 'unknown'}_${currentLanguage}.pdf`;
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
            {t('details.downloadPDF', { defaultValue: 'Télécharger PDF' })}
          </Button>
        )}
      </div>

      {demandePreviewTeamDetailsError && !demandePreviewTeamDetailsSuccess && (
        <Message type="danger" itWillBeHidden>
          {demandePreviewTeamDetailsError}
        </Message>
      )}
      
      {!demandePreviewTeamDetailsLoading && !demandePreviewTeamDetailsError && demande && (
        
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
                    background: demande.status === 'approuvée' ? '#d1e7dd' : 
                               demande.status === 'refusée' ? '#f8d7da' : '#fff3cd'
                  }}
                >
                  {demande.status === 'approuvée' ? (
                    <FaCheckCircle style={{ color: '#198754', fontSize: 24 }} />
                  ) : demande.status === 'refusée' ? (
                    <FaTimesCircle style={{ color: '#dc3545', fontSize: 24 }} />
                  ) : (
                    <FaClock style={{ color: '#ffc107', fontSize: 24 }} />
                  )}
                </div>
                <div>
                  <h5 className="mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {t('details.globalStatus', { defaultValue: 'Status global la demande' })}
                  </h5>
                  <Badge 
                    bg={demande.status === 'approuvée' ? 'success' : 
                        demande.status === 'refusée' ? 'danger' : 'warning'}
                    className="text-white"
                    style={{ fontSize: '0.875rem', padding: '6px 12px' }}
                  >
                    {demande.status === 'approuvée' ? t('details.approved', { defaultValue: 'approuvée' }) :
                     demande.status === 'refusée' ? t('details.rejected', { defaultValue: 'refusée' }) :
                     t('details.inProgress', { defaultValue: 'en cours' })}
                  </Badge>
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted d-flex align-items-center">
                  <FaCalendarAlt className={isRTL ? 'ms-1' : 'me-1'} />
                  {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {demandePreviewTeamDetailsLoading ? (
        <div className="dami-page-container">
          <DamiLoading />
        </div>
      ) : demande ? (
        <Row className="g-4">
          {}
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 1rem' }}>
                <h6 className="mb-0 d-flex align-items-center" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  <FaHistory className={isRTL ? "ms-2" : "me-2"} style={{ color: '#0d6efd', fontSize: '1rem' }} />
                  {t('details.chronologie', { defaultValue: 'CHRONOLOGIE' })}
                </h6>
              </Card.Header>
              <Card.Body className="p-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <div className="timline-container">
                  <span className="timeline-bar"></span>
                  <div className="timline-content">
                    {demande.traitement && demande.traitement.map((tr, index) => (
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
                                        {t('details.approvedBy', { defaultValue: 'La demande a été approuvée par' })} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                        <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                          " " +
                                          (String(tr.utilisateur?.nom || '').toLowerCase()) : t('details.unknownUser', { defaultValue: 'Utilisateur inconnu' })}</strong>{" "}
                                        {tr.interim && <span> ({t('details.interim', { defaultValue: 'interim' })})</span>} {t('details.as', { defaultValue: 'en tant que' })}{" "}
                                        {tr.type === 'admin' ? (
                                          <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{t('details.administrator', { defaultValue: 'administrateur' })}</span>
                                        ) : tr && tr.code && tr.code !== "atr" ? (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: getTypeApprobation(tr.code),
                                            }}
                                          ></span>
                                        ) : (
                                          <span style={{ fontWeight: 'bold' }}>{t('details.signatory', { defaultValue: 'signataire' })}</span>
                                        )}
                                        {Number(index) === 0 && (
                                          <span>, {t('details.finalizedSuccessfully', { defaultValue: 'et pour cela, elle a été finalisée et traitée avec succès' })}</span>
                                        )}
                                      </p>
                                      {tr.motifValidation && (
                                        <div className="mt-1 p-1" style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
                                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            <strong>{t('details.approvalReason', { defaultValue: 'Motif d\'approbation' })}:</strong> {tr.motifValidation}
                                          </small>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {tr.status === "refuse" && (
                                    <div>
                                      <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                        {t('details.refusedBy', { defaultValue: 'La demande a été refusée par' })} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                        <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                          " " +
                                          (String(tr.utilisateur?.nom || '').toLowerCase()) : t('details.unknownUser', { defaultValue: 'Utilisateur inconnu' })}</strong>{" "}
                                        {tr.interim && <span> ({t('details.interim', { defaultValue: 'interim' })})</span>} {t('details.as', { defaultValue: 'en tant que' })}{" "}
                                        {tr.type === 'admin' ? (
                                          <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{t('details.administrator', { defaultValue: 'administrateur' })}</span>
                                        ) : tr && tr.code && tr.code !== "atr" ? (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: getTypeApprobation(tr.code),
                                            }}
                                          ></span>
                                        ) : (
                                          <span style={{ fontWeight: 'bold' }}>{t('details.signatory', { defaultValue: 'signataire' })}</span>
                                        )}
                                      </p>
                                      {tr.motifRefus && (
                                        <div className="mt-1 p-1" style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
                                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            <strong>{t('details.refusalReason', { defaultValue: 'Motif de refus' })}:</strong> {tr.motifRefus}
                                          </small>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="mt-1 d-flex align-items-center" style={{ gap: 4 }}>
                                    <FaCalendarAlt style={{ fontSize: 10, color: '#6c757d' }} />
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                      {tr.dateTraitement ? (
                                        <>
                                          {t('details.on', { defaultValue: 'le' })}{" "}
                                          {new Date(tr.dateTraitement).toLocaleDateString('fr-FR')}{" "}
                                          {t('details.at', { defaultValue: 'à' })}{" "}
                                          {new Date(tr.dateTraitement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </>
                                      ) : (
                                        t('details.notYet', { defaultValue: 'pas encore' })
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
                                  <p className="mb-1" style={{ lineHeight: '1.4' }}>
                                    {t('details.sentTo', { defaultValue: 'La demande a été envoyée à' })} {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                    <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                      " " +
                                      (String(tr.utilisateur?.nom || '').toLowerCase()) : t('details.unknownUser', { defaultValue: 'Utilisateur inconnu' })}</strong>{" "}
                                    {tr.interim && <span> ({t('details.interim', { defaultValue: 'interim' })})</span>} {t('details.toProcessAs', { defaultValue: 'pour la traiter en tant que' })}{" "}
                                    {tr.type === 'admin' ? (
                                      <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{t('details.administrator', { defaultValue: 'administrateur' })}</span>
                                    ) : tr && tr.code && tr.code !== "atr" ? (
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: getTypeApprobation(tr.code),
                                        }}
                                      ></span>
                                    ) : (
                                      <span style={{ fontWeight: 'bold' }}>{t('details.signatory', { defaultValue: 'signataire' })}</span>
                                    )}
                                  </p>
                                  <div className="mt-1 d-flex align-items-center" style={{ gap: 4 }}>
                                    <FaCalendarAlt style={{ fontSize: 10, color: '#6c757d' }} />
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                      {t('details.on', { defaultValue: 'le' })} {new Date(tr.dateEnvoi).toLocaleDateString('fr-FR')}{" "}
                                      {t('details.at', { defaultValue: 'à' })} {new Date(tr.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </small>
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
                  {t('details.requestDetails', { defaultValue: 'Détails de la demande' })}
                </h5>
              </Card.Header>
              <Card.Body className="p-0" style={{ minHeight: '500px' }}>
                <div style={{ padding: '1.5rem', fontSize: isRTL ? '1rem' : '0.95rem', lineHeight: '1.6' }}>
                  <DamiDemande demande={demande} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        !demandePreviewTeamDetailsLoading &&
        !demande && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)' }}>
                <FaFileAlt style={{ color: '#dc3545', fontSize: 28 }} />
              </div>
              <h5 className="text-muted mb-2">{t('details.notFound', { defaultValue: 'demande introuvable !' })}</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                {currentLanguage === 'ar' ? 'الطلب المطلوب غير موجود أو تم حذفه' : 'La demande demandée n\'existe pas ou a été supprimée'}
              </p>
            </Card.Body>
          </Card>
        )
      )}
    </div>
  );
};

export default DemandesPreviewDetailsPage;
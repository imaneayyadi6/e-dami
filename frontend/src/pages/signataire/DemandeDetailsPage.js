import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { Button, Form, Modal, Placeholder, Alert, Row, Col } from "react-bootstrap";
import {
  DamiDemande,
  DamiLoading,
  Loader,
  Message,
  WarningMessage,
} from "../../components";
import {
  approuveTraitement,
  getDemandeByID,
  getDemandeTraitementStatus,
  refuseTraitement,
  resetApprouveTraitement,
  resetGetDemandeByID,
  resetRefuseTraitement,
} from "../../redux/demande/demandeActions";

import { Dialog, Toast } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";


const getCv = (civilite) => {
  return civilite === "F" ? "Mme. " : "M. ";
};

const STATUS = {
  approuve: "success",
  refuse: "danger",
  "en cours": "warning",
  "en attente": "info",
  termine: "info"
};

const getTypeApprobation = (code) => {
  const types = {
    'chef': 'chef de service',
    'dir': 'directeur',
    'admin': 'administrateur',
    'atr': 'autre responsable'
  };
  return types[code] || 'signataire';
};

const DemandeDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [motif, setMotif] = useState("");
  const [motifErrMsg, setMotifErrMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [motifValidation, setMotifValidation] = useState("");
  const [motifValidationErrMsg, setMotifValidationErrMsg] = useState("");
  const [showArKb, setShowArKb] = useState(false);
  const [showArKbValidation, setShowArKbValidation] = useState(false);

  const { id, idTraitement } = useParams();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const demandeById = useSelector((state) => state.demandeById);
  const {
    loading: loadingDemandeByID,
    error: errorDemandeByID,
    demande: recoveredDemande,
    success: successDemandeByID,
  } = demandeById;

  const demandeGetTraitementStatus = useSelector(
    (state) => state.demandeGetTraitementStatus
  );
  const {
    loading: loadingDemandeGetTraitementStatus,
    error: errorDemandeGetTraitementStatus,
    statusResult,
    
  } = demandeGetTraitementStatus;

  const demandeApprouveTraitement = useSelector(
    (state) => state.demandeApprouveTraitement
  );
  const {
    loading: demandeApprouveTraitementLoading,
    success: demandeApprouveTraitementSuccess,
    error: demandeApprouveTraitementError,
  } = demandeApprouveTraitement;

  const demandeRefuseTraitement = useSelector(
    (state) => state.demandeRefuseTraitement
  );
  const {
    loading: demandeRefuseTraitementLoading,
    success: demandeRefuseTraitementSuccess,
    error: demandeRefuseTraitementError,
  } = demandeRefuseTraitement;

  const isSpecialService = userInfo.service?.libelle === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || userInfo.service?.libelle === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT";

  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  
  const arabicKeys = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
    ['ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', '؛', '(', ')', '$', '&', '@', '"'],
    ['ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
    ['ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', '؛', '(', ')', '$', '&', '@', '"'],
    ['ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  ];

  const toggleArabicKeyboard = (type) => {
    if (type === 'refuse') {
      setShowArKb(!showArKb);
    } else if (type === 'validation') {
      setShowArKbValidation(!showArKbValidation);
    }
  };

  const appendArabicChar = (char, type) => {
    if (type === 'refuse') {
      setMotif(prev => prev + char);
    } else if (type === 'validation') {
      setMotifValidation(prev => prev + char);
    }
  };

  const approveeHandler = () => {
    if (isSpecialService) {
      setShowApproveModal(true);
      setMotifValidation("");
      setMotifValidationErrMsg("");
      return;
    }
    Dialog.open({
      title: t('details.confirmation', { defaultValue: 'Confirmation' }),
      message: t('details.confirmApprove', { defaultValue: 'Êtes vous sûr de vouloir approuver cette demande ?' }),
      onYes: () => {
        setTimeout(() => {
          window.scrollTo(-1000000, -100000);
        }, 200);
        const damiBody = document.querySelector(".dami-body div");
        const clone = damiBody.cloneNode(true);
        const originalInputs = damiBody.querySelectorAll("input");
        const cloneInputs = clone.querySelectorAll("input");
        originalInputs.forEach((input, index) => {
          const clonedInput = cloneInputs[index];
          if (input.type === "checkbox" || input.type === "radio") {
            clonedInput.checked = input.checked;
            if (clonedInput.checked) {
              clonedInput.setAttribute("checked", "checked");
            } else {
              clonedInput.removeAttribute("checked");
            }
          } else {
            clonedInput.value = input.value;
            clonedInput.setAttribute("value", input.value);
          }
        });
        const contenu = clone.outerHTML;
        dispatch(approuveTraitement(id, idTraitement, contenu));
      },
    });
  };

  const handleApproveWithMotif = () => {
    if (!motifValidation || motifValidation.trim() === "") {
      setMotifValidationErrMsg(t('details.validationReasonRequired', { defaultValue: 'Motif de validation requis !' }));
      return;
    }
    setMotifValidationErrMsg("");
    setShowApproveModal(false);
    setTimeout(() => {
      window.scrollTo(-1000000, -100000);
    }, 200);
    const damiBody = document.querySelector(".dami-body div");
    const clone = damiBody.cloneNode(true);
    const originalInputs = damiBody.querySelectorAll("input");
    const cloneInputs = clone.querySelectorAll("input");
    originalInputs.forEach((input, index) => {
      const clonedInput = cloneInputs[index];
      if (input.type === "checkbox" || input.type === "radio") {
        clonedInput.checked = input.checked;
        if (clonedInput.checked) {
          clonedInput.setAttribute("checked", "checked");
        } else {
          clonedInput.removeAttribute("checked");
        }
      } else {
        clonedInput.value = input.value;
        clonedInput.setAttribute("value", input.value);
      }
    });
    const contenu = clone.outerHTML;
    dispatch(approuveTraitement(id, idTraitement, contenu, motifValidation));
  };

  const refuseeHandler = () => {
    setTimeout(() => {
      window.scrollTo(-1000000, -100000);
    }, 200);
    
    
    setMotifErrMsg("");
    setFileError("");
    
    if (motif !== "") {
      
      const formData = new FormData();
      formData.append("motif", motif);
      
      if (selectedFile) {
        formData.append("fichierMotifRefus", selectedFile);
      }
      
      dispatch(refuseTraitement(id, idTraitement, formData));
      setShowRefuseModal(false);
      setSelectedFile(null);
    } else {
      setMotifErrMsg(t('details.refuseReasonRequired', { defaultValue: 'Motif du refus requis !' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      if (file.size > 10 * 1024 * 1024) {
        setFileError(t('details.fileTooLarge', { defaultValue: 'Le fichier est trop volumineux. Taille maximale : 10MB' }));
        setSelectedFile(null);
        return;
      }
      
      
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setFileError(t('details.fileTypeNotAllowed', { defaultValue: 'Type de fichier non autorisé. Seuls les fichiers PDF, DOC, DOCX et images sont acceptés.' }));
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setFileError("");
    }
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(resetApprouveTraitement());
      dispatch(getDemandeByID(id, idTraitement));
      setCallOnce(true);
    }
    if (successDemandeByID) {
      dispatch(getDemandeTraitementStatus(id, idTraitement));
    }

    if (demandeApprouveTraitementSuccess) {
      document.querySelectorAll(`.chk-app-${userInfo.id}`).forEach((chk) => {
        chk.classList.add("checked");
      });
      Toast.open({
        type: "success",
        message: t('details.approveSuccess', { defaultValue: 'Demande approuvée avec succès.' }),
      });
      setTimeout(() => {
        dispatch(resetApprouveTraitement());
      }, 5000);
    }

    if (demandeRefuseTraitementSuccess) {
      document.querySelectorAll(`.chk-rfs-${userInfo.id}`).forEach((chk) => {
        chk.classList.add("checked");
      });
      Toast.open({ type: "success", message: t('details.refuseSuccess', { defaultValue: 'Demande refusée avec succès.' }) });
      setTimeout(() => {
        dispatch(resetRefuseTraitement());
      }, 5000);
    }
  }, [
    callOnce,
    successDemandeByID,
    demandeApprouveTraitementSuccess,
    demandeRefuseTraitementSuccess,
  ]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-3">
        <Link
          to="/demandes"
          className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
          onClick={() => {
            dispatch(resetGetDemandeByID());
            dispatch(resetApprouveTraitement());
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
          <span className={isRTL ? 'me-1' : 'ms-1'}>{t('details.backToRequests', { defaultValue: 'demandes' })}</span>
        </Link>
      </div>
      {errorDemandeByID && (
        <Message type="danger" itWillBeHidden>
          {errorDemandeByID}
        </Message>
      )}
      {errorDemandeGetTraitementStatus && (
        <Message type="danger" itWillBeHidden>
          {errorDemandeGetTraitementStatus}
        </Message>
      )}
      {demandeApprouveTraitementError && (
        <Message type="danger" itWillBeHidden>
          {demandeApprouveTraitementError}
        </Message>
      )}
      {demandeRefuseTraitementError && (
        <Message type="danger" itWillBeHidden>
          {demandeRefuseTraitementError}
        </Message>
      )}
      <Modal
        show={showRefuseModal}
        size="xm"
        centered
        onHide={() => {
          setMotif("");
          setMotifErrMsg("");
          setFileError("");
          setSelectedFile(null);
          setShowRefuseModal(false);
        }}
      >
        <Modal.Header closeButton>
          <h6>{t('details.refuseReason', { defaultValue: 'motif de refus' })}</h6>
        </Modal.Header>
        <Modal.Body>
          {motifErrMsg && <Message type="danger">{motifErrMsg}</Message>}
          {fileError && <Message type="danger">{fileError}</Message>}
          <div className="d-flex justify-content-between align-items-center mb-2">
          <label>{t('details.reason', { defaultValue: 'motif:' })}</label>
            {currentLanguage === "ar" && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => toggleArabicKeyboard('refuse')}
                className="d-flex align-items-center"
                style={{ gap: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <i className="fas fa-keyboard"></i>
                {showArKb ? t('details.hideKeyboard', { defaultValue: 'Masquer clavier' }) : t('details.showKeyboard', { defaultValue: 'Afficher clavier' })}
              </Button>
            )}
          </div>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="form-control"
            placeholder={t('details.refuseReasonPlaceholder', { defaultValue: 'veuiller saisire un motif de refus ..' })}
            style={{ height: 150, resize: "none", textAlign: isRTL ? 'right' : 'left' }}
          ></textarea>
          
          {}
          {currentLanguage === "ar" && showArKb && (
            <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="mb-2">
                <small className="text-muted">{t('details.arabicKeyboard', { defaultValue: 'Clavier arabe' })}</small>
              </div>
              <div className="arabic-keyboard">
                {arabicKeys.map((row, rowIndex) => (
                  <div key={rowIndex} className="d-flex justify-content-center mb-1">
                    {row.map((key, keyIndex) => (
                      <button
                        key={keyIndex}
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        style={{ 
                          minWidth: '30px', 
                          height: '30px', 
                          fontSize: '12px',
                          padding: '2px 6px'
                        }}
                        onClick={() => appendArabicChar(key, 'refuse')}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {}
          {(userInfo.service?.libelle === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || 
            userInfo.service?.libelle === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT") && (
            <div className="mt-3">
              <label>{t('details.attachmentOptional', { defaultValue: 'Fichier joint (optionnel):' })}</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              />
              <small className="text-muted">
                {t('details.allowedTypes', { defaultValue: 'Types autorisés : PDF, DOC, DOCX, images. Taille max : 10MB' })}
              </small>
              {selectedFile && (
                <div className="mt-2">
                  <small className="text-success">
                    {t('details.selectedFile', { defaultValue: 'Fichier sélectionné :' })} {selectedFile.name}
                  </small>
                </div>
              )}
            </div>
          )}
          
          <Button
            className="mt-3 w-100"
            variant="dark"
            onClick={refuseeHandler}
          >
            <i className="fa-solid fa-file-circle-xmark"></i> {t('details.refuse', { defaultValue: 'refuser' })}
          </Button>
        </Modal.Body>
      </Modal>
      {}
      <Modal
        show={showApproveModal}
        size="xm"
        centered
        onHide={() => {
          setMotifValidation("");
          setMotifValidationErrMsg("");
          setShowApproveModal(false);
        }}
      >
        <Modal.Header closeButton>
          <h6>{t('details.validationReason', { defaultValue: 'Motif de validation' })}</h6>
        </Modal.Header>
        <Modal.Body>
          {motifValidationErrMsg && <Message type="danger">{motifValidationErrMsg}</Message>}
          <div className="d-flex justify-content-between align-items-center mb-2">
          <label>{t('details.reasonLabel', { defaultValue: 'Motif :' })}</label>
            {currentLanguage === "ar" && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => toggleArabicKeyboard('validation')}
                className="d-flex align-items-center"
                style={{ gap: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <i className="fas fa-keyboard"></i>
                {showArKbValidation ? t('details.hideKeyboard', { defaultValue: 'Masquer clavier' }) : t('details.showKeyboard', { defaultValue: 'Afficher clavier' })}
              </Button>
            )}
          </div>
          <textarea
            value={motifValidation}
            onChange={(e) => setMotifValidation(e.target.value)}
            className="form-control"
            placeholder={t('details.validationReasonPlaceholder', { defaultValue: 'Veuillez saisir un motif de validation ..' })}
            style={{ height: 150, resize: "none", textAlign: isRTL ? 'right' : 'left' }}
          ></textarea>
          
          {}
          {currentLanguage === "ar" && showArKbValidation && (
            <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="mb-2">
                <small className="text-muted">{t('details.arabicKeyboard', { defaultValue: 'Clavier arabe' })}</small>
              </div>
              <div className="arabic-keyboard">
                {arabicKeys.map((row, rowIndex) => (
                  <div key={rowIndex} className="d-flex justify-content-center mb-1">
                    {row.map((key, keyIndex) => (
                      <button
                        key={keyIndex}
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        style={{ 
                          minWidth: '30px', 
                          height: '30px', 
                          fontSize: '12px',
                          padding: '2px 6px'
                        }}
                        onClick={() => appendArabicChar(key, 'validation')}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button
            className="mt-3 w-100"
            variant="dark"
            onClick={handleApproveWithMotif}
          >
            <i className="fa-solid fa-file-pen"></i> {t('details.validate', { defaultValue: 'valider' })}
          </Button>
        </Modal.Body>
      </Modal>
      <>
        <>
          {demandeApprouveTraitementLoading && <Loader />}
          {demandeRefuseTraitementLoading && <Loader />}
          {loadingDemandeByID ? (
            <div className="dami-page-container">
              <DamiLoading />
            </div>
          ) : (
            recoveredDemande &&
            (!recoveredDemande.not ? (
              <>
                <h5 className="mb-5 d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  {t('requests.statusOfRequestProcessing', 'Status de traitement de la demande :')}{" "}
                  {statusResult && (() => {
                    const raw = String(statusResult.status || '').toLowerCase().trim();
                    
                    let s = raw.replace(/_/g, ' ')
                      .normalize('NFD')
                      .replace(/\p{Diacritic}/gu, '');
                    if (s.includes('approuv')) s = 'approuve';
                    else if (s.includes('refus')) s = 'refuse';
                    else if (s.replace(/\s+/g, '') === 'encours' || s === 'en cours') s = 'en cours';
                    else if (s.includes('attent')) s = 'en_attente';
                    else if (s.includes('term')) s = 'termine';

                    let colorClass = 'text-bg-secondary';
                    if (s === 'approuve') colorClass = 'text-bg-success';
                    else if (s === 'refuse') colorClass = 'text-bg-danger';
                    else if (s === 'en cours') colorClass = 'text-bg-warning';
                    else if (s === 'en_attente' || s === 'termine') colorClass = 'text-bg-info';

                    const i18nKey = `requests.${s.replace(/\s/g, '_')}`;
                    return (
                      <span
                        className={`badge rounded-pill px-3 py-2 ${colorClass}`}
                        style={{ 
                          marginInlineStart: isRTL ? 0 : 8, 
                          marginInlineEnd: isRTL ? 8 : 0,
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        {t(i18nKey, statusResult.status)}
                      </span>
                    );
                  })()}
                  {loadingDemandeGetTraitementStatus && (
                    <Placeholder animation="glow">
                      <Placeholder xs={1} />
                    </Placeholder>
                  )}
                </h5>

                <div className="details-dami-dm">
                  {}
                  <Row>
                    {}
                    <Col md={4}>
                      <div className="chronologie-section">
                        <h5 className="mb-3 d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <i className="fa-solid fa-timeline" style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}></i>
                          {t('details.chronologie', { defaultValue: 'CHRONOLOGIE' })}
                        </h5>
                        <div className="timline-container">
                          <span className="timeline-bar"></span>
                          <div className="timline-content">
                            {recoveredDemande.traitement && recoveredDemande.traitement.map((tr, index) => (
                              <div key={index}>
                                {tr.status !== "en cours" && (
                                  <div className="timline-item">
                                    <span className="timline-item-line"></span>
                                    <Alert variant={STATUS[String(tr.status).replace(/\s/g, "")]}>
                                      {tr.status === "approuve" && (
                                        <p className="w-100">
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
                                          ) : tr && tr.code && tr.code === "atr" ? (
                                            <span>
                                              ({String(recoveredDemande?.option?.autreResponsableTitre || '').toLowerCase()})
                                            </span>
                                          ) : (
                                            <span style={{ fontWeight: 'bold' }}>{t('details.signatory', { defaultValue: 'signataire' })}</span>
                                          )}
                                          {tr.motifValidation && (
                                            <>
                                              <br />
                                              <span style={{ fontWeight: "bold" }}>
                                                {t('details.approvalReason', { defaultValue: 'Motif d\'approbation' })} :
                                              </span>{" "}
                                              {tr.motifValidation}
                                            </>
                                          )}
                                          {Number(index) === 0 && (
                                            <span>
                                              , {t('details.finalizedSuccessfully', { defaultValue: 'et pour cela, elle a été finalisée et traitée avec succès' })}
                                            </span>
                                          )}
                                        </p>
                                      )}
                                      {tr.status === "refuse" && (
                                        <p className="w-100">
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
                                          ) : tr && tr.code && tr.code === "atr" ? (
                                            <span>
                                              ({String(recoveredDemande?.option?.autreResponsableTitre || '').toLowerCase()})
                                            </span>
                                          ) : (
                                            <span style={{ fontWeight: 'bold' }}>{t('details.signatory', { defaultValue: 'signataire' })}</span>
                                          )}
                                          . <br />{" "}
                                          <span style={{ fontWeight: "bold" }}>
                                            {t('details.refusalReason', { defaultValue: 'Motif de refus' })} :
                                          </span>{" "}
                                          {tr.motifRefus}
                                        </p>
                                      )}
                                      <div className="d-flex justify-content-end">
                                        <small>
                                          {tr.dateTraitement ? (
                                            <>
                                              {t('details.on', { defaultValue: 'le' })}{" "}
                                              {new Date(tr.dateTraitement).toLocaleDateString()}{" "}
                                              {t('details.at', { defaultValue: 'à' })}{" "}
                                              {new Date(tr.dateTraitement).toLocaleTimeString()}
                                            </>
                                          ) : (
                                            <>
                                              {t('details.on', { defaultValue: 'le' })}{" "}
                                              {new Date(tr.dateEnvoi).toLocaleDateString()}{" "}
                                              {t('details.at', { defaultValue: 'à' })}{" "}
                                              {new Date(tr.dateEnvoi).toLocaleTimeString()}
                                            </>
                                          )}
                                        </small>
                                      </div>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Col>

                    {}
                    <Col md={8}>
                      <div className="details-dami-dm-demande">
                  <DamiDemande demande={recoveredDemande} />
                      </div>
                    </Col>
                  </Row>
                </div>

                {!demandeApprouveTraitementSuccess &&
                  statusResult &&
                  statusResult.status &&
                  statusResult.status === "en cours" && (
                    <div className="d-flex justify-content-center mt-4 gap-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <Button
                        variant="primary"
                        className="btn rounded-pill d-flex align-items-center"
                        onClick={approveeHandler}
                        style={{
                          padding: '0.5rem 1.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          gap: 8,
                          flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}
                      >
                        <i className="fa-solid fa-check-circle"></i>
                        {t('details.validate', { defaultValue: 'valider' })}
                      </Button>
                      <Button
                        variant="outline-danger"
                        className="btn rounded-pill d-flex align-items-center"
                        onClick={() => setShowRefuseModal(true)}
                        style={{
                          padding: '0.5rem 1.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          gap: 8,
                          flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}
                      >
                        <i className="fa-solid fa-times-circle"></i>
                        {t('details.refuse', { defaultValue: 'refuser' })}
                      </Button>
                    </div>
                  )}
              </>
            ) : (
              <Message type="danger">{recoveredDemande.message}</Message>
            ))
          )}
          {!loadingDemandeByID && !recoveredDemande && (
            <WarningMessage message={t('details.notFound', { defaultValue: 'demande introuvable !' })} />
          )}
        </>
      </>
    </div>
  );
};

export default DemandeDetailsPage;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { Button, Form, Modal, Placeholder } from "react-bootstrap";
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
    // success: successdemandeGetTraitementStatus,
  } = demandeGetTraitementStatus;

  const demandeApprouveTraitement = useSelector(
    (state) => state.demandeApprouveTraitement
  );
  const {
    loading: demandeApprouveTraitementLoading,
    success: demandeApprouveTraitementSuccess,
    error: demandeApprouveTraitementError,
  } = demandeApprouveTraitement;

  const demanderRefuseTraitement = useSelector(
    (state) => state.demanderRefuseTraitement
  );
  const {
    loading: demanderRefuseTraitementLoading,
    success: demanderRefuseTraitementSuccess,
    error: demanderRefuseTraitementError,
  } = demanderRefuseTraitement;

  const isSpecialService = userInfo.service?.libelle === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || userInfo.service?.libelle === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT";

  const approveeHandler = () => {
    if (isSpecialService) {
      setShowApproveModal(true);
      setMotifValidation("");
      setMotifValidationErrMsg("");
      return;
    }
    Dialog.open({
      title: "Confirmation",
      message: "Êtes vous sûr de vouloir approuver cette demande ?",
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
      setMotifValidationErrMsg("Motif de validation requis !");
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
    
    // Réinitialiser les erreurs
    setMotifErrMsg("");
    setFileError("");
    
    if (motif !== "") {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("motif", motif);
      
      if (selectedFile) {
        formData.append("fichierMotifRefus", selectedFile);
      }
      
      dispatch(refuseTraitement(id, idTraitement, formData));
      setShowRefuseModal(false);
      setSelectedFile(null);
    } else {
      setMotifErrMsg("Motif du refus requis !");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("Le fichier est trop volumineux. Taille maximale : 10MB");
        setSelectedFile(null);
        return;
      }
      
      // Vérifier le type de fichier
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
        setFileError("Type de fichier non autorisé. Seuls les fichiers PDF, DOC, DOCX et images sont acceptés.");
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
        message: "Demande approuvée avec succès.",
      });
      setTimeout(() => {
        dispatch(resetApprouveTraitement());
      }, 5000);
    }

    if (demanderRefuseTraitementSuccess) {
      document.querySelectorAll(`.chk-rfs-${userInfo.id}`).forEach((chk) => {
        chk.classList.add("checked");
      });
      Toast.open({ type: "success", message: "Demande refusée avec succès." });
      setTimeout(() => {
        dispatch(resetRefuseTraitement());
      }, 5000);
    }
  }, [
    callOnce,
    successDemandeByID,
    demandeApprouveTraitementSuccess,
    demanderRefuseTraitementSuccess,
  ]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to="/demandes"
          className="btn btn-sm btn-light mb-3"
          onClick={() => {
            dispatch(resetGetDemandeByID());
            dispatch(resetApprouveTraitement());
          }}
        >
          <i className="fas fa-arrow-left"></i> demandes
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
      {demanderRefuseTraitementError && (
        <Message type="danger" itWillBeHidden>
          {demanderRefuseTraitementError}
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
          <h6>motif de refus </h6>
        </Modal.Header>
        <Modal.Body>
          {motifErrMsg && <Message type="danger">{motifErrMsg}</Message>}
          {fileError && <Message type="danger">{fileError}</Message>}
          <label>motif:</label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="form-control"
            placeholder="veuiller saisire un motif de refus .."
            style={{ height: 150, resize: "none" }}
          ></textarea>
          
          {/* Champ de fichier - affiché seulement pour les services autorisés */}
          {(userInfo.service?.libelle === "SERVICE MAINTENANCE ASSISTANCE ET FORMATION" || 
            userInfo.service?.libelle === "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT") && (
            <div className="mt-3">
              <label>Fichier joint (optionnel):</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              />
              <small className="text-muted">
                Types autorisés : PDF, DOC, DOCX, images. Taille max : 10MB
              </small>
              {selectedFile && (
                <div className="mt-2">
                  <small className="text-success">
                    Fichier sélectionné : {selectedFile.name}
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
            <i className="fa-solid fa-file-circle-xmark"></i> refuser
          </Button>
        </Modal.Body>
      </Modal>
      {/* Modal d'approbation pour les services spéciaux */}
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
          <h6>Motif de validation</h6>
        </Modal.Header>
        <Modal.Body>
          {motifValidationErrMsg && <Message type="danger">{motifValidationErrMsg}</Message>}
          <label>Motif :</label>
          <textarea
            value={motifValidation}
            onChange={(e) => setMotifValidation(e.target.value)}
            className="form-control"
            placeholder="Veuillez saisir un motif de validation .."
            style={{ height: 150, resize: "none" }}
          ></textarea>
          <Button
            className="mt-3 w-100"
            variant="dark"
            onClick={handleApproveWithMotif}
          >
            <i className="fa-solid fa-file-pen"></i> valider
          </Button>
        </Modal.Body>
      </Modal>
      <>
        <>
          {demandeApprouveTraitementLoading && <Loader />}
          {demanderRefuseTraitementLoading && <Loader />}
          {loadingDemandeByID ? (
            <div className="dami-page-container">
              <DamiLoading />
            </div>
          ) : (
            recoveredDemande &&
            (!recoveredDemande.not ? (
              <>
                <h5 className="mb-5 d-flex align-items-center">
                  Status de traitement de la demande :{" "}
                  {statusResult && (
                    <span
                      className={`ml-2 title-text-status-${String(
                        statusResult.status
                      ).replace(/\s/g, "")}`}
                    >
                      {statusResult.status}
                    </span>
                  )}
                  {loadingDemandeGetTraitementStatus && (
                    <Placeholder animation="glow">
                      <Placeholder xs={1} />
                    </Placeholder>
                  )}
                </h5>

                <div className="dami-page-container">
                  <DamiDemande demande={recoveredDemande} />
                </div>

                {!demandeApprouveTraitementSuccess &&
                  statusResult &&
                  statusResult.status &&
                  statusResult.status === "en cours" && (
                    <div className="d-flex justify-content-center mt-2">
                      <Button
                        variant="dark"
                        className="mr-1"
                        onClick={approveeHandler}
                      >
                        <i className="fa-solid fa-file-pen"></i> valider
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => setShowRefuseModal(true)}
                      >
                        <i className="fa-solid fa-file-circle-xmark"></i>{" "}
                        refuser
                      </Button>
                    </div>
                  )}
              </>
            ) : (
              <Message type="danger">{recoveredDemande.message}</Message>
            ))
          )}
          {!loadingDemandeByID && !recoveredDemande && (
            <WarningMessage message={"demande introuvable !"} />
          )}
        </>
      </>
    </>
  );
};

export default DemandeDetailsPage;

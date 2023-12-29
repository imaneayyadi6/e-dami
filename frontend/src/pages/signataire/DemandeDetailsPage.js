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


  const { id, idTraitement } = useParams();
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin


  const demandeById = useSelector(state => state.demandeById);
  const {
    loading: loadingDemandeByID,
    error: errorDemandeByID,
    demande: recoveredDemande,
    success: successDemandeByID,
  } = demandeById;

  const demandeGetTraitementStatus = useSelector(state => state.demandeGetTraitementStatus);
  const {
    loading: loadingDemandeGetTraitementStatus,
    error: errorDemandeGetTraitementStatus,
    statusResult,
    // success: successdemandeGetTraitementStatus,
  } = demandeGetTraitementStatus;


  const demandeApprouveTraitement = useSelector(state => state.demandeApprouveTraitement);
  const {
    loading: demandeApprouveTraitementLoading,
    success: demandeApprouveTraitementSuccess,
    error: demandeApprouveTraitementError,
  } = demandeApprouveTraitement;

  const demanderRefuseTraitement = useSelector(state => state.demanderRefuseTraitement);
  const {
    loading: demanderRefuseTraitementLoading,
    success: demanderRefuseTraitementSuccess,
    error: demanderRefuseTraitementError,
  } = demanderRefuseTraitement;


  const approveeHandler = () => {
    Dialog.open({
      title: "Confirmation",
      message: "Êtes vous sûr de vouloir approuver cette demande ?",
      onYes: () => {
        window.scrollTo(-1000000, -100000);
        dispatch(approuveTraitement(id, idTraitement));
      }
    })
  }

  const refuseeHandler = () => {
    window.scrollTo(-1000000, -100000);
    if (motif !== "") {
      dispatch(refuseTraitement(id, idTraitement, motif));
      setShowRefuseModal(false);
    }
    else {
      setMotifErrMsg("Motif du refus requis !")
    }
  }


  useEffect(() => {
    if (!callOnce) {
      dispatch(resetApprouveTraitement())
      dispatch(getDemandeByID(id, idTraitement));
      setCallOnce(true);
    }
    if (successDemandeByID) {
      dispatch(getDemandeTraitementStatus(id, idTraitement))
    }

    if (demandeApprouveTraitementSuccess) {
      document.querySelectorAll(`.chk-app-${userInfo.id}`).forEach(chk => {
        chk.classList.add("checked");
      })
      Toast.open({ type: "success", message: "Demande approuvée avec succès." });
      setTimeout(() => {
        dispatch(resetApprouveTraitement())
      }, 5000)


    }

    if (demanderRefuseTraitementSuccess) {
      document.querySelectorAll(`.chk-rfs-${userInfo.id}`).forEach(chk => {
        chk.classList.add("checked");
      })
      Toast.open({ type: "success", message: "Demande refusée avec succès." });
      setTimeout(() => {
        dispatch(resetRefuseTraitement())
      }, 5000)

    }
  }, [
    callOnce,
    successDemandeByID,
    demandeApprouveTraitementSuccess,
    demanderRefuseTraitementSuccess
  ]);

  return (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <Link
          to='/demandes'
          className='btn btn-sm btn-light mb-3'
          onClick={() => {
            dispatch(resetGetDemandeByID());
            dispatch(resetApprouveTraitement());
          }}>
          <i className='fas fa-arrow-left'></i> demandes
        </Link>
      </div>
      {errorDemandeByID && (
        <Message type='danger' itWillBeHidden>
          {errorDemandeByID}
        </Message>
      )}
      {errorDemandeGetTraitementStatus && (
        <Message type='danger' itWillBeHidden>
          {errorDemandeGetTraitementStatus}
        </Message>
      )}
      {demandeApprouveTraitementError && (
        <Message type='danger' itWillBeHidden>
          {demandeApprouveTraitementError}
        </Message>
      )}
      {demanderRefuseTraitementError && (
        <Message type='danger' itWillBeHidden>
          {demanderRefuseTraitementError}
        </Message>
      )}
      <Modal show={showRefuseModal} size="xm" centered onHide={() => {
        setMotif("");
        setMotifErrMsg("")
        setShowRefuseModal(false)
      }} >
        <Modal.Header closeButton >
          <h6 >motif de refus </h6>
        </Modal.Header>
        <Modal.Body>
          {motifErrMsg &&
            (<Message type="danger">{motifErrMsg}</Message>)
          }
          <lable>motif:</lable>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="form-control"
            placeholder="veuiller saisire un motif de refus .."
            style={{ height: 250, resize: "none" }}
          ></textarea>
          <Button className="mt-1 w-100" variant="dark" onClick={refuseeHandler}>
            <i className="fa-solid fa-file-circle-xmark"></i>{" "}
            refuser</Button>
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
            recoveredDemande && (
              !recoveredDemande.not ? (
                <>
                  <h5 className="mb-5">
                    Status de traitement de la demande :{" "}
                    {statusResult && <span className={`table-text-status-${String(statusResult.status).replace(/\s/g, "")}`}>{statusResult.status}</span>}
                    {loadingDemandeGetTraitementStatus && (
                      <Placeholder animation="glow">
                        <Placeholder xs={1} />
                      </Placeholder>
                    )}
                  </h5>

                  <div className="dami-page-container">
                    <DamiDemande demande={recoveredDemande} />
                  </div>


                  {!demandeApprouveTraitementSuccess && statusResult && statusResult.status && statusResult.status === 'en cours' && (
                    <div className="d-flex justify-content-center mt-2">
                      <Button variant='dark' className="mr-1" onClick={approveeHandler}>
                        <i className='fa-solid fa-file-pen'></i> valider
                      </Button>
                      <Button variant="outline-danger" onClick={() => setShowRefuseModal(true)}>
                        <i className='fa-solid fa-file-circle-xmark'></i> refuser
                      </Button>
                    </div>
                  )}

                </>
              ) :
                (
                  <Message type='danger'>{recoveredDemande.message}</Message>
                )

            )
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

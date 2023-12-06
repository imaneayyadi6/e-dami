import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { Button, Placeholder } from "react-bootstrap";
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
  resetApprouveTraitement,
  resetGetDemandeByID,
} from "../../redux/demande/demandeActions";

import { Dialog, Toast } from "../../services";


const DemandeDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const { id, idTraitement } = useParams();
  const dispatch = useDispatch();
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


  const approveeHandler = () => {
    Dialog.open({
      title: "Confirmation",
      message: "Êtes vous sûr de vouloir approuver cette demande ?",
      onYes: () => {
        window.scrollTo(0, 0);
        dispatch(approuveTraitement(id, idTraitement));
      }
    })
  }

  const refuseeHandler = () => {
    Dialog.open({
      title: "Confirmation",
      message: "Êtes vous sûr de vouloir refuser cette demande ?",

    })
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
      Toast.open({ type: "success", message: "Demande approuvée avec succès." });
      setTimeout(() => {
        dispatch(resetApprouveTraitement())
      }, 5000)
    }
  }, [callOnce, successDemandeByID, demandeApprouveTraitementSuccess]);

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
      <>
        <>
          {demandeApprouveTraitementLoading && <Loader />}
          {loadingDemandeByID ? (
            <DamiLoading />
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

                  <DamiDemande demande={recoveredDemande} />


                  {!demandeApprouveTraitementSuccess && statusResult && statusResult.status && statusResult.status === 'en cours' && (
                    <div className="d-flex justify-content-center mt-2">
                      <Button variant='dark' className="mr-1" onClick={approveeHandler}>
                        <i className='fa-solid fa-file-pen'></i> valider
                      </Button>
                      <Button variant="outline-danger" onClick={refuseeHandler}>
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

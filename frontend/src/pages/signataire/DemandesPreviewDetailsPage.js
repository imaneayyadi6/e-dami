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
import { Placeholder } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

const DemandesPreviewDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const demandePreviewTeamDetails = useSelector(
    (state) => state.demandePreviewTeamDetails
  );
  const {
    loading: demandePreviewTeamDetailsLoading,
    success: demandePreviewTeamDetailsSuccess,
    error: demandePreviewTeamDetailsError,
    demande,
  } = demandePreviewTeamDetails;
  const { id } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandesPreviewDetailsTeam(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to="/demandes/apercu"
          className="btn btn-sm btn-light mb-3"
          onClick={() => {
            dispatch(resetGetDemandesPreviewDetailsTeam());
          }}
        >
          <i className="fas fa-arrow-left"></i> demandes
        </Link>
      </div>

      {demandePreviewTeamDetailsError && (
        <Message type="danger" itWillBeHidden>
          {demandePreviewTeamDetailsError}
        </Message>
      )}
      {!demandePreviewTeamDetailsLoading && !demandePreviewTeamDetailsError ? (
        <h5 className="mb-5 d-flex align-items-center w-100">
          Status de global de la demande :{" "}
          <span
            className={`ml-2 title-text-status-${String(
              demande && demande.status
            ).replace(/\s/g, "")}`}
          >
            {demande && demande.status}
          </span>
        </h5>
      ) : (
        demandePreviewTeamDetailsLoading && (
          <Placeholder animation="glow">
            <Placeholder xs={2} />
          </Placeholder>
        )
      )}

      {demandePreviewTeamDetailsLoading ? (
        <div className="dami-page-container">
          <DamiLoading />
        </div>
      ) : demande ? (
        <div className="dami-page-container">
          <DamiDemande demande={demande} />
        </div>
      ) : (
        !demandePreviewTeamDetailsLoading &&
        !demande && <WarningMessage message={"demande introuvable !"} />
      )}
    </>
  );
};

export default DemandesPreviewDetailsPage;

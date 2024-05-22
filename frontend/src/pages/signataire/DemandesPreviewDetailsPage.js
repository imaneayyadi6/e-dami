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
import { Placeholder, Alert, Modal, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getTypeApprobation } from "../../services";
const STATUS = {
  encours: "warning",
  approuve: "success",
  refuse: "danger",
};

const DemandesPreviewDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [showTimeLine, setShowTimeLine] = useState(false);
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
        <div className="details-dami-dm">
          <div className="d-flex justify-content-end">
            <Button
              className="details-dami-dm-timline-button-show mb-3"
              variant="dark"
              onClick={() => setShowTimeLine(true)}
            >
              <i className="fa-solid fa-timeline"></i> CHRONOLOGIE
            </Button>
            <Modal
              show={showTimeLine}
              size="xl"
              onHide={() => setShowTimeLine(false)}
              fullscreen
            >
              <Modal.Header closeButton>
                <h5>
                  <i className="fa-solid fa-timeline"></i> CHRONOLOGIE{" "}
                </h5>
              </Modal.Header>
              <Modal.Body>
                <h3>
                  <i className="fa-solid fa-timeline"></i> CHRONOLOGIE{" "}
                </h3>
                <div className="timline-container">
                  <span className="timeline-bar"></span>
                  <div className="timeline-content">
                    {demande.traitement.map((tr, index) => (
                      <>
                        {tr.status !== "en cours" && (
                          <div className="timline-item">
                            <span className="timline-item-line"></span>
                            <Alert
                              variant={
                                STATUS[String(tr.status).replace(/\s/g, "")]
                              }
                            >
                              {tr.status === "approuve" && (
                                <p className="w-100">
                                  la demande a ete approuver par M.
                                  {tr.utilisateur.prenom.toLowerCase() +
                                    " " +
                                    tr.utilisateur.nom.toLowerCase()}{" "}
                                  en tant que {getTypeApprobation(tr.code)}
                                  {Number(index) === 0 && (
                                    <span>
                                      , et pour cela, elle a été finalisée et
                                      traitée avec succès
                                    </span>
                                  )}
                                </p>
                              )}
                              {tr.status === "refuse" && (
                                <p className="w-100">
                                  la demande a ete refusee par M.
                                  {tr.utilisateur.prenom.toLowerCase() +
                                    " " +
                                    tr.utilisateur.nom.toLowerCase()}{" "}
                                  en tant que {getTypeApprobation(tr.code)}.{" "}
                                  <br />{" "}
                                  <span style={{ fontWeight: "bold" }}>
                                    Motifi de refus :
                                  </span>{" "}
                                  {tr.motifRefus}
                                </p>
                              )}
                              <div className="d-flex justify-content-end">
                                <small>
                                  le{" "}
                                  {new Date(
                                    tr.dateTraitement
                                  ).toLocaleDateString()}{" "}
                                  a{" "}
                                  {new Date(
                                    tr.dateTraitement
                                  ).toLocaleTimeString()}
                                </small>
                              </div>
                            </Alert>
                          </div>
                        )}

                        <div className="timline-item">
                          <span className="timline-item-line"></span>
                          <Alert variant={"warning"}>
                            <p className="w-100">
                              la demande a ete envoyer M.
                              {tr.utilisateur.prenom.toLowerCase() +
                                " " +
                                tr.utilisateur.nom.toLowerCase()}{" "}
                              pour la traiter en tant que{" "}
                              {getTypeApprobation(tr.code)}
                            </p>

                            <div className="d-flex justify-content-end">
                              <small>
                                le {new Date(tr.dateEnvoi).toLocaleDateString()}{" "}
                                a {new Date(tr.dateEnvoi).toLocaleTimeString()}
                              </small>
                            </div>
                          </Alert>
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
          <div className="details-dami-dm-timline">
            <h3>
              <i className="fa-solid fa-timeline"></i> CHRONOLOGIE{" "}
            </h3>
            <div className="timline-container">
              <span className="timeline-bar"></span>
              <div className="timeline-content">
                {demande.traitement.map((tr, index) => (
                  <>
                    {tr.status !== "en cours" && (
                      <div className="timline-item">
                        <span className="timline-item-line"></span>
                        <Alert
                          variant={STATUS[String(tr.status).replace(/\s/g, "")]}
                        >
                          {tr.status === "approuve" && (
                            <p className="w-100">
                              la demande a ete approuver par M.
                              {tr.utilisateur.prenom.toLowerCase() +
                                " " +
                                tr.utilisateur.nom.toLowerCase()}{" "}
                              en tant que {getTypeApprobation(tr.code)}
                              {Number(index) === 0 && (
                                <span>
                                  , et pour cela, elle a été finalisée et
                                  traitée avec succès
                                </span>
                              )}
                            </p>
                          )}
                          {tr.status === "refuse" && (
                            <p className="w-100">
                              la demande a ete refusee par M.
                              {tr.utilisateur.prenom.toLowerCase() +
                                " " +
                                tr.utilisateur.nom.toLowerCase()}{" "}
                              en tant que {getTypeApprobation(tr.code)}. <br />{" "}
                              <span style={{ fontWeight: "bold" }}>
                                Motifi de refus :
                              </span>{" "}
                              {tr.motifRefus}
                            </p>
                          )}
                          <div className="d-flex justify-content-end">
                            <small>
                              le{" "}
                              {new Date(tr.dateTraitement).toLocaleDateString()}{" "}
                              a{" "}
                              {new Date(tr.dateTraitement).toLocaleTimeString()}
                            </small>
                          </div>
                        </Alert>
                      </div>
                    )}

                    <div className="timline-item">
                      <span className="timline-item-line"></span>
                      <Alert variant={"warning"}>
                        <p className="w-100">
                          la demande a ete envoyer M.
                          {tr.utilisateur.prenom.toLowerCase() +
                            " " +
                            tr.utilisateur.nom.toLowerCase()}{" "}
                          pour la traiter en tant que{" "}
                          {getTypeApprobation(tr.code)}
                        </p>

                        <div className="d-flex justify-content-end">
                          <small>
                            le {new Date(tr.dateEnvoi).toLocaleDateString()} a{" "}
                            {new Date(tr.dateEnvoi).toLocaleTimeString()}
                          </small>
                        </div>
                      </Alert>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="details-dami-dm-demande">
            <DamiDemande demande={demande} />
          </div>
        </div>
      ) : (
        !demandePreviewTeamDetailsLoading &&
        !demande && <WarningMessage message={"demande introuvable !"} />
      )}
    </>
  );
};

export default DemandesPreviewDetailsPage;

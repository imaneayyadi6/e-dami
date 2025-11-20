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
import { Placeholder, Alert, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getTypeApprobation } from "../../services";

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
    <>
      <div className="d-flex justify-content-between align-items-center">
        <Link
          to={`${
            userInfo &&
            userInfo.roles.findIndex((r) => r && r.role && r.role.code === "admin") !== -1
              ? "/demandes/all/apercu"
              : "/demandes/apercu"
          } `}
          className="btn btn-light"
          onClick={() => {
            dispatch(resetGetDemandesPreviewDetailsTeam());
          }}
        >
          <i className="fas fa-arrow-left"></i> demandes
        </Link>
        
        {demande && demande.status === 'approuvée' && (
          <Button
            variant="success"
            size="sm"
            onClick={async () => {
              try {
                const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
                
                
                const response = await fetch(`/api/demandes/${demande._id}/pdf?token=${token}`, {
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
                  link.download = `demande_${demande.option?.libelle?.replace(/\s+/g, '_')}_${demande?.demandeur?.nom || 'unknown'}_${demande?.demandeur?.prenom || 'unknown'}.pdf`;
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
          >
            <i className="fas fa-download"></i> Télécharger PDF
          </Button>
        )}
      </div>

      {demandePreviewTeamDetailsError && !demandePreviewTeamDetailsSuccess && (
        <Message type="danger" itWillBeHidden>
          {demandePreviewTeamDetailsError}
        </Message>
      )}
      
      {!demandePreviewTeamDetailsLoading && !demandePreviewTeamDetailsError ? (
        <h5 className="mb-5 mt-3 d-flex align-items-center w-100">
          Status global la demande :{" "}
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
          {}
          <div className="row">
            {}
            <div className="col-md-4">
              <div className="chronologie-section">
                <h5 className="mb-3">
                  <i className="fa-solid fa-timeline"></i> CHRONOLOGIE
                </h5>
                <div className="timline-container">
                  <span className="timeline-bar"></span>
                  <div className="timline-content">
                    {demande.traitement && demande.traitement.map((tr, index) => (
                      <div key={index}>
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
                                  La demande a été approuvée par {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                  <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                    " " +
                                    (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                  {tr.interim && <span> (interim)</span>} en tant que{" "}
                                  {tr.type === 'admin' ? (
                                    <span style={{ fontWeight: 'bold', color: '#dc3545' }}>administrateur</span>
                                  ) : tr && tr.code && tr.code !== "atr" ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: getTypeApprobation(tr.code),
                                      }}
                                    ></span>
                                  ) : (
                                    <span style={{ fontWeight: 'bold' }}>signataire</span>
                                  )}
                                  {tr.motifValidation && (
                                    <>
                                      <br />
                                      <span style={{ fontWeight: "bold" }}>
                                        Motif d'approbation :
                                      </span>{" "}
                                      {tr.motifValidation}
                                    </>
                                  )}
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
                                  La demande a été refusée par {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                  <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                    " " +
                                    (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                  {tr.interim && <span> (interim)</span>} en tant que{" "}
                                  {tr.type === 'admin' ? (
                                    <span style={{ fontWeight: 'bold', color: '#dc3545' }}>administrateur</span>
                                  ) : tr && tr.code && tr.code !== "atr" ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: getTypeApprobation(tr.code),
                                      }}
                                    ></span>
                                  ) : (
                                    <span style={{ fontWeight: 'bold' }}>signataire</span>
                                  )}
                                  . <br />{" "}
                                  <span style={{ fontWeight: "bold" }}>
                                    Motif de refus :
                                  </span>{" "}
                                  {tr.motifRefus}
                                </p>
                              )}
                              <div className="d-flex justify-content-end">
                                <small>
                                  {tr.dateTraitement ? (
                                    <>
                                      le{" "}
                                      {new Date(
                                        tr.dateTraitement
                                      ).toLocaleDateString()}{" "}
                                      à{" "}
                                      {new Date(
                                        tr.dateTraitement
                                      ).toLocaleTimeString()}
                                    </>
                                  ) : (
                                    "pas encore"
                                  )}
                                </small>
                              </div>
                            </Alert>
                          </div>
                        )}

                        {tr.status === "en cours" && (
                          <div className="timline-item">
                            <span className="timline-item-line"></span>
                            <Alert variant={"warning"}>
                              <p className="w-100">
                                La demande a été envoyée à {tr.utilisateur ? getCv(tr.utilisateur.civilite) : ""}
                                <strong> {tr.utilisateur ? (String(tr.utilisateur?.prenom || '').toLowerCase()) +
                                  " " +
                                  (String(tr.utilisateur?.nom || '').toLowerCase()) : "Utilisateur inconnu"}</strong>{" "}
                                {tr.interim && <span> (interim)</span>} pour la traiter en tant que{" "}
                                {tr.type === 'admin' ? (
                                  <span style={{ fontWeight: 'bold', color: '#dc3545' }}>administrateur</span>
                                ) : tr && tr.code && tr.code !== "atr" ? (
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: getTypeApprobation(tr.code),
                                    }}
                                  ></span>
                                ) : (
                                  <span style={{ fontWeight: 'bold' }}>signataire</span>
                                )}
                              </p>

                              <div className="d-flex justify-content-end">
                                <small>
                                  le {new Date(tr.dateEnvoi).toLocaleDateString()}{" "}
                                  à {new Date(tr.dateEnvoi).toLocaleTimeString()}
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
            </div>
            {/* Colonne droite - Détails de la demande */}
            <div className="col-md-8">
              <DamiDemande />
            </div>
          </div>
        </div>
      ) : (
        !demandePreviewTeamDetailsLoading &&
        !demande && <WarningMessage message="demande introuvable !" />
      )}
    </>
  );
};

export default DemandesPreviewDetailsPage;

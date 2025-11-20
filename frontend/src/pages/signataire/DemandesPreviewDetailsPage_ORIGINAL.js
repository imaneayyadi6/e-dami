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
          <Row>
            <Col md={4}>
              <div className="chronologie-section">
                <h5 className="mb-3">
                  <i className="fa-solid fa-timeline"></i> CHRONOLOGIE
                </h5>
                <div className="timline-container">
                  {demande.traitement && demande.traitement.map((tr, index) => (
                    <div key={index}>
                      {tr.status !== "en cours" && (
                        <div className="timline-item">
                          <span className="timline-item-line"></span>
                          <Alert variant={tr.status === 'approuve' ? 'success' : 'danger'} className="mb-3">
                            <p>
                              {tr.status === 'approuve' ? 'La demande a été approuvée par' : 'La demande a été refusée par'} <strong>{getCv(tr.user?.gender)} {tr.user?.nom} {tr.user?.prenom || 'Utilisateur inconnu'}</strong>
                              {tr.user?.isInterim && <span> (interim)</span>}
                              en tant que <strong>{tr.user?.isAdmin ? 'administrateur' : 'signataire'}</strong>
                              {tr.motif && (
                                <div className="mt-2">
                                  <strong>{tr.status === 'approuve' ? 'Motif d\'approbation' : 'Motif de refus'}:</strong> {tr.motif}
                                </div>
                              )}
                              <div className="mt-2">
                                et pour cela, elle a été finalisée et traitée avec succès
                                <br />
                                pour la traiter en tant que <strong>{tr.user?.isAdmin ? 'administrateur' : 'signataire'}</strong>
                                <br />
                                le <strong>{new Date(tr.createdAt).toLocaleDateString()}</strong> à <strong>{new Date(tr.createdAt).toLocaleTimeString()}</strong>
                              </div>
                            </p>
                          </Alert>
                        </div>
                      )}
                    </div>
                  ))}
                  {demande.traitement && demande.traitement.some(tr => tr.status === "en cours") && (
                    <div className="timline-item">
                      <span className="timline-item-line"></span>
                      <Alert variant="warning" className="mb-3">
                        <p>
                          La demande a été envoyée à <strong>pas encore</strong>
                          <br />
                          {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                        </p>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col md={8}>
              <DamiDemande />
            </Col>
          </Row>
        </div>
      ) : (
        !demandePreviewTeamDetailsLoading &&
        !demande && <WarningMessage message="demande introuvable !" />
      )}
    </>
  );
};

export default DemandesPreviewDetailsPage;

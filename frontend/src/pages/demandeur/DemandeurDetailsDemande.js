import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom"
import { getDemandeurDemandeByID } from "../../redux/demande/demandeActions";
import { DamiDemande, DamiLoading, Message, TimeLine, WarningMessage } from "../../components";
import { Alert, Button, Modal } from "react-bootstrap";
import { getTypeApprobation } from "../../services";


const STATUS = {
    encours: 'warning',
    approuve: 'success',
    refuse: 'danger'
}


const DemandeurDetailsDemande = () => {
    const [callOnce, setCallOnce] = useState(false);
    const [showTimeLine, setShowTimeLine] = useState(false);
    const { id } = useParams();
    const dispatch = useDispatch();
    const demandeDemandeurById = useSelector(state => state.demandeDemandeurById);
    const {
        loading: loadingDemandeByID,
        error: errorDemandeByID,
        demande: recoveredDemande,
        // success: successDemandeByID,
    } = demandeDemandeurById;
    useEffect(() => {
        if (!callOnce) {
            dispatch(getDemandeurDemandeByID(id));
            setCallOnce(true);
        }
    }, [callOnce])


    return (
        <>
            <Link className="btn btn-sm btn-light" to="mes-demandes">
                <i className="fas fa-arrow-left"></i> demandes
            </Link>
            {errorDemandeByID && (
                <Message type='danger' itWillBeHidden>
                    {errorDemandeByID}
                </Message>
            )}
            {loadingDemandeByID ?
                <DamiLoading /> :
                recoveredDemande && (
                    <div>
                        <h3 className="mb-5 mt-3 ">
                            Status global la demande :{" "}
                            <span className={`table-text-status-${String(recoveredDemande.status).replace(/\s/g, "")}`}>{recoveredDemande.status}</span>
                        </h3>

                        <div className="details-dami-dm">
                            <div className="d-flex justify-content-end">
                                <Button className="details-dami-dm-timline-button-show mb-3" variant="dark" onClick={() => setShowTimeLine(true)}>
                                    <i className="fa-solid fa-timeline"></i>     CHRONOLOGIE
                                </Button>
                                <Modal show={showTimeLine} size="xl" onHide={() => setShowTimeLine(false)} fullscreen>
                                    <Modal.Header closeButton>
                                        <h5><i className="fa-solid fa-timeline"></i> CHRONOLOGIE </h5>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <h3><i className="fa-solid fa-timeline"></i> CHRONOLOGIE </h3>
                                        <div className="timline-container">
                                            <span className="timeline-bar"></span>
                                            <div className="timeline-content">
                                                {recoveredDemande.traitement.map((tr, index) => (
                                                    <>
                                                        {tr.status !== "en cours" && (
                                                            <div className="timline-item">
                                                                <span className="timline-item-line"></span>
                                                                <Alert variant={STATUS[String(tr.status).replace(/\s/g, "")]}>
                                                                    {tr.status === "approuve" && (
                                                                        <p className="w-100">
                                                                            votre demande a ete approuver par M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} en tant que {getTypeApprobation(tr.code)}
                                                                            {Number(index) === 0 && (
                                                                                <span>
                                                                                    , et pour cela, elle a été finalisée et traitée avec succès
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                    {tr.status === "refuse" && (
                                                                        <p className="w-100">
                                                                            votre demande a ete refuser par M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} en tant que {getTypeApprobation(tr.code)}. <br /> <span style={{ fontWeight: "bold" }}>Motifi de refus :</span> {tr.motifRefus}
                                                                        </p>
                                                                    )}
                                                                    <div className="d-flex justify-content-end">
                                                                        <small>le {new Date(tr.dateTraitement).toLocaleDateString()} a {new Date(tr.dateTraitement).toLocaleTimeString()}</small>
                                                                    </div>
                                                                </Alert >
                                                            </div>
                                                        )}

                                                        <div className="timline-item">
                                                            <span className="timline-item-line"></span>
                                                            <Alert variant={"warning"}>
                                                                <p className="w-100">
                                                                    votre demande a ete envoyer  M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} pour la traiter en tant que {getTypeApprobation(tr.code)}
                                                                </p>

                                                                <div className="d-flex justify-content-end">
                                                                    <small>le {new Date(tr.dateEnvoi).toLocaleDateString()} a {new Date(tr.dateEnvoi).toLocaleTimeString()}</small>
                                                                </div>

                                                            </Alert >
                                                        </div>
                                                    </>

                                                ))}

                                            </div>
                                        </div>
                                    </Modal.Body>
                                </Modal>

                            </div>
                            <div className="details-dami-dm-timline">
                                <h3><i className="fa-solid fa-timeline"></i> CHRONOLOGIE </h3>
                                <div className="timline-container">
                                    <span className="timeline-bar"></span>
                                    <div className="timeline-content">
                                        {recoveredDemande.traitement.map((tr, index) => (
                                            <>
                                                {tr.status !== "en cours" && (
                                                    <div className="timline-item">
                                                        <span className="timline-item-line"></span>
                                                        <Alert variant={STATUS[String(tr.status).replace(/\s/g, "")]}>

                                                            {tr.status === "approuve" && (
                                                                <p className="w-100">
                                                                    votre demande a ete approuver par M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} en tant que {getTypeApprobation(tr.code)}
                                                                    {Number(index) === 0 && (
                                                                        <span>
                                                                            , et pour cela, elle a été finalisée et traitée avec succès
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            )}
                                                            {tr.status === "refuse" && (
                                                                <p className="w-100">
                                                                    votre demande a ete refuser par M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} en tant que {getTypeApprobation(tr.code)}. <br /> <span style={{ fontWeight: "bold" }}>Motifi de refus :</span> {tr.motifRefus}
                                                                </p>
                                                            )}
                                                            <div className="d-flex justify-content-end">
                                                                <small>le {new Date(tr.dateTraitement).toLocaleDateString()} a {new Date(tr.dateTraitement).toLocaleTimeString()}</small>
                                                            </div>
                                                        </Alert >
                                                    </div>
                                                )}

                                                <div className="timline-item">
                                                    <span className="timline-item-line"></span>
                                                    <Alert variant={"warning"}>
                                                        <p className="w-100">
                                                            votre demande a ete envoyer  M.{tr.utilisateur.prenom.toLowerCase() + " " + tr.utilisateur.nom.toLowerCase()} pour la traiter en tant que {getTypeApprobation(tr.code)}
                                                        </p>

                                                        <div className="d-flex justify-content-end">
                                                            <small>le {new Date(tr.dateEnvoi).toLocaleDateString()} a {new Date(tr.dateEnvoi).toLocaleTimeString()}</small>
                                                        </div>

                                                    </Alert >
                                                </div>
                                            </>

                                        ))}

                                    </div>
                                </div>
                            </div>
                            <div className="details-dami-dm-demande">
                                <DamiDemande demande={recoveredDemande} />
                            </div>
                        </div>
                    </div >
                )}
            {
                !loadingDemandeByID && !recoveredDemande && (
                    <WarningMessage message={"demande introuvable !"} />
                )
            }
        </>
    )
}

export default DemandeurDetailsDemande
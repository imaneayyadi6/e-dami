import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom"
import { getDemandeurDemandeByID } from "../../redux/demande/demandeActions";
import { DamiDemande, DamiLoading, Message, TimeLine, WarningMessage } from "../../components";
import { Card, Col, Row } from "react-bootstrap";


const DemandeurDetailsDemande = () => {
    const [callOnce, setCallOnce] = useState(false);

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
                        <h5 className="mb-5 mt-3 ">
                            Status global la demande :{" "}
                            <span className={`table-text-status-${String(recoveredDemande.status).replace(/\s/g, "")}`}>{recoveredDemande.status}</span>
                        </h5>
                        <DamiDemande demande={recoveredDemande} />
                    </div>
                )}
            {!loadingDemandeByID && !recoveredDemande && (
                <WarningMessage message={"demande introuvable !"} />
            )}
        </>
    )
}

export default DemandeurDetailsDemande
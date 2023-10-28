import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { Card } from "react-bootstrap";
import {
  Dami,
  DamiDemande,
  DamiLoading,
  Message,
  WarningMessage,
} from "../../components";
import {
  getDemandeByID,
  resetGetDemandeByID,
} from "../../redux/demande/demandeActions";

const DemandeDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const demandeById = useSelector(state => state.demandeById);
  const {
    loading: loadingDemandeByID,
    error: errorDemandeByID,
    demande: recoveredDemande,
    success: successDemandeByID,
  } = demandeById;

  useEffect(() => {
    if (!callOnce) {
      dispatch(getDemandeByID(id));
      setCallOnce(true);
    }
  }, [callOnce]);

  return (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <Link
          to='/demandes'
          className='btn btn-sm btn-light mb-3'
          onClick={() => {
            dispatch(resetGetDemandeByID());
          }}>
          <i className='fas fa-arrow-left'></i> demandes
        </Link>
      </div>
      {errorDemandeByID && (
        <Message type='danger' itWillBeHidden>
          {errorDemandeByID}
        </Message>
      )}
      <Card>
        <Card.Body>
          {loadingDemandeByID ? (
            <DamiLoading />
          ) : (
            recoveredDemande && <DamiDemande demande={recoveredDemande} />
          )}
          {!loadingDemandeByID && !recoveredDemande && (
            <WarningMessage message={"demande introuvable !"} />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandeDetailsPage;

import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { FormContainer, Loader, Message } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserIntrim,
  getUserIntrim,
  putUserIntrim,
  resetDeleteUserIntrim,
  resetPutUserIntrim,
} from "../../redux/user/userActions";
import { Dialog } from "../../services";

const DefinirInterimePage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [matricule, setMatricule] = useState(null);
  const userGetInterim = useSelector((state) => state.userGetInterim);
  const {
    loading: loadingUserGetInterim,
    success: successUserGetInterim,
    interim,
    error: errorUserGetInterim,
  } = userGetInterim;
  const userDeleteInterim = useSelector((state) => state.userDeleteInterim);
  const {
    loading: loadingUserDeleteInterim,
    success: successUserDeleteInterim,
    error: errorUserDeleteInterim,
  } = userDeleteInterim;

  const userPutInterim = useSelector((state) => state.userPutInterim);
  const {
    loading: loadingUserPutInterim,
    success: successUserPutInterim,
    error: errorUserPutInterim,
  } = userPutInterim;

  const dispatch = useDispatch();

  const supprimerInterimHandler = () => {
    Dialog.open({
      title: "suppression interim",
      message: "Êtes-vous sûr de vouloir supprimer cet intérim ?",
      onYes: () => {
        dispatch(deleteUserIntrim());
      },
    });
  };
  const addInterimHandler = () => {
    Dialog.open({
      title: "ajout d'interim",
      message: "Êtes-vous sûr de vouloir ajouter cet intérim ?",
      onYes: () => {
        if (matricule && matricule !== 0) {
          dispatch(putUserIntrim(matricule));
        }
      },
    });
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(getUserIntrim());
      setCallOnce(true);
    }
  }, [callOnce]);

  useEffect(() => {
    if (successUserDeleteInterim) {
      dispatch(getUserIntrim());
      dispatch(resetDeleteUserIntrim());
    }
  }, [successUserDeleteInterim]);

  useEffect(() => {
    if (successUserPutInterim) {
      dispatch(getUserIntrim());
      dispatch(resetPutUserIntrim());
    }
  }, [successUserPutInterim]);

  return (
    <Card>
      <Card.Body className="px-5">
        {errorUserGetInterim && (
          <Message itWillBeHidden type="danger">
            {errorUserGetInterim}
          </Message>
        )}
        {errorUserDeleteInterim && (
          <Message itWillBeHidden type="danger">
            {errorUserDeleteInterim}
          </Message>
        )}
        {errorUserPutInterim && (
          <Message itWillBeHidden type="danger">
            {errorUserPutInterim}
          </Message>
        )}
        {loadingUserPutInterim && <Loader />}
        {loadingUserDeleteInterim && <Loader />}
        {loadingUserGetInterim ? (
          <Loader />
        ) : interim && interim.haveInterim ? (
          <>
            <Message type="success">
              Vous avez déjà défini un intérim{" "}
              <strong style={{ fontSize: "15px", fontWeight: "bold" }}>
                {interim.prenom} {interim.nom}
              </strong>{" "}
              qui le matricule{" "}
              <strong style={{ fontSize: "15px", fontWeight: "bold" }}>
                {interim.matricule}
              </strong>
              . Pour que vous redéfinissiez un intérim, il faut supprimer
              l'intérim actuel et redéfinir un autre employé en tant
              qu'intérimaire
            </Message>
            <Message type="warning">
              Pour supprimer un intérim, cliquez sur le bouton "Supprimer
              intérim" pour supprimer l'intérim
            </Message>

            <Button
              className="mt-2 "
              variant="dark"
              onClick={supprimerInterimHandler}
            >
              <i className="fa-solid fa-user-xmark"></i> supprimer l'interim
            </Button>
          </>
        ) : (
          <>
            {!loadingUserGetInterim && (
              <>
                <Message type="info">
                  Quand vous saisissez le matricule d'un employé et que vous
                  confirmez toutes les demandes que vous recevez, elles seront
                  envoyées à cet intérimaire pour approbation ou refus.
                </Message>
                <FormContainer>
                  <Form>
                    <label>matricule de votre interim :</label>
                    <Form.Control
                      placeholder="exp: 100200 ..."
                      type="number"
                      min={10000}
                      max={9999999}
                      maxLength={7}
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                    />
                    <Button
                      className="mt-2 w-100"
                      variant="dark"
                      onClick={addInterimHandler}
                    >
                      <i className="fa-solid fa-user-plus"></i> definir interim
                    </Button>
                  </Form>
                </FormContainer>
              </>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default DefinirInterimePage;

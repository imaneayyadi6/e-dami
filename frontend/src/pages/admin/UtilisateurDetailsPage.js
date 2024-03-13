import React, { useEffect, useState } from "react";
import { Button, Card, Placeholder } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchUserByID, removeUser } from "../../redux/user/userActions";
import { Loader, Message } from "../../components/";
import { Toast, Dialog } from "../../services";

const UtilisateurDetailsPage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const userByID = useSelector((state) => state.userByID);
  const {
    loading: loadingUserByID,
    error: errorUserByID,
    user: recoveredUser,
  } = userByID;

  const userRemove = useSelector((state) => state.userRemove);
  const {
    loading: loadingUserRemove,
    error: errorUserRemove,
    success: successUserRemove,
  } = userRemove;

  const deleteUserHandler = () => {
    let message = "";
    if (!recoveredUser.isActive) {
      message =
        "Êtes-vous sûr(e) de vouloir activer le compte de cet utilisateur ?";
    } else {
      message =
        "Êtes-vous sûr(e) de vouloir désactiver le compte de cet utilisateur ?";
    }

    Dialog.open({
      title: "Confirmation",
      message,
      onYes: () => {
        dispatch(removeUser(recoveredUser._id));
      },
    });
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchUserByID(id));
      setCallOnce(true);
    }
    if (successUserRemove) {
      Toast.open({
        type: "success",
        message: `le compte de cet utilisateur a été ${
          !recoveredUser.isActive ? "désactiver" : "activer"
        } avec succès`,
      });
    }
  }, [successUserRemove, recoveredUser]);

  return (
    <>
      <Link to="/utilisateurs" className="btn btn-sm btn-light mb-3">
        <i className="fas fa-arrow-left"></i> utilisateurs
      </Link>
      {errorUserByID && (
        <Message type="danger" itWillBeHidden>
          {errorUserByID}
        </Message>
      )}
      {errorUserRemove && (
        <Message type="danger" itWillBeHidden>
          {errorUserRemove}
        </Message>
      )}

      {loadingUserRemove && <Loader />}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            {recoveredUser && recoveredUser.isActive ? (
              <span className="text-success">compte utilisateur activer</span>
            ) : (
              <span className="text-danger">compte utilisateur desactiver</span>
            )}
            <div>
              <Link
                className="mr-1 btn btn-sm btn-dark"
                variant="dark"
                size="sm"
                to={`/modifier-utilisateur/${
                  recoveredUser && recoveredUser._id
                }`}
              >
                <i className="fa-solid fa-user-pen"></i> Modifier cet
                utilisateur
              </Link>
              <Button
                variant="light"
                size="sm"
                disabled={loadingUserByID || !recoveredUser}
                onClick={deleteUserHandler}
                className={
                  recoveredUser && !recoveredUser.isActive
                    ? "text-success"
                    : "text-danger"
                }
              >
                <i className="fa-solid fa-user-xmark"></i>{" "}
                {recoveredUser && !recoveredUser.isActive ? (
                  <span>activer </span>
                ) : (
                  <span>desactiver </span>
                )}{" "}
                le compte de cet utilisateur
              </Button>
            </div>
          </div>
          <hr />

          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div>
                <label
                  className="d-block text-bold"
                  style={{ fontWeight: "bold" }}
                >
                  Nom & prenom :
                </label>
                {loadingUserByID && (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                )}
                <small className="d-block">
                  {recoveredUser && recoveredUser.prenom}{" "}
                  {recoveredUser && recoveredUser.nom}
                </small>
              </div>
              <div>
                <label
                  className="d-block text-bold"
                  style={{ fontWeight: "bold" }}
                >
                  Matricule :
                </label>
                {loadingUserByID && (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                )}
                <small className="d-block">
                  {recoveredUser && recoveredUser.matricule}
                </small>
              </div>
              <div>
                <label
                  className="d-block text-bold"
                  style={{ fontWeight: "bold" }}
                >
                  Email :
                </label>
                {loadingUserByID && (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                )}
                <small className="d-block">
                  {recoveredUser && recoveredUser.email}
                </small>
              </div>
            </div>

            <div>
              <div>
                <label
                  className="d-block text-bold"
                  style={{ fontWeight: "bold" }}
                >
                  Fonction :
                </label>
                {loadingUserByID && (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                )}
                {recoveredUser && recoveredUser.fonction && (
                  <small className="d-block">{recoveredUser.fonction}</small>
                )}
              </div>

              <div>
                <label
                  className="d-block text-bold"
                  style={{ fontWeight: "bold" }}
                >
                  GSM :
                </label>
                {loadingUserByID && (
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                )}
                {recoveredUser && recoveredUser.gsm && (
                  <small className="d-block">{recoveredUser.gsm}</small>
                )}
              </div>
            </div>
          </div>

          <hr />

          <div>
            <label className="d-block text-bold" style={{ fontWeight: "bold" }}>
              Direction :
            </label>
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}
            {recoveredUser && recoveredUser.direction ? (
              <small className="d-block">
                Direction {recoveredUser.direction.libelle}
              </small>
            ) : (
              <small className="text-danger">
                Cet utilisateur n'est rattaché à aucune direction
              </small>
            )}
          </div>
          <div>
            <label className="d-block text-bold" style={{ fontWeight: "bold" }}>
              Service :
            </label>
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}
            {recoveredUser && recoveredUser.service ? (
              <small className="d-block">
                Service {recoveredUser.service.libelle}
              </small>
            ) : (
              <small className="text-danger">
                Cet utilisateur n'est rattaché à aucun service
              </small>
            )}
          </div>
          <hr />

          <div>
            <label className="d-block text-bold" style={{ fontWeight: "bold" }}>
              Responsabilité :
            </label>
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}

            {recoveredUser && recoveredUser.isDirecteur ? (
              <small>Directeur</small>
            ) : recoveredUser && recoveredUser.isChefDeService ? (
              <small>Chef de service</small>
            ) : (
              <small className="text-danger">
                Cet utilisateur n'a pas de poste de responsabilité
              </small>
            )}
          </div>

          <hr />

          <div>
            <label className="d-block text-bold" style={{ fontWeight: "bold" }}>
              Roles :
            </label>
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}
            {loadingUserByID && (
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            )}
            {recoveredUser &&
              recoveredUser.roles &&
              recoveredUser.roles.length > 0 &&
              recoveredUser.roles.map((role) => (
                <small key={role._id} className="d-block">
                  {role.role.libelle}
                </small>
              ))}
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default UtilisateurDetailsPage;

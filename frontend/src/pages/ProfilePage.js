import React, { useEffect, useState } from "react";
import { Button, Card, Placeholder } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchUserByID, removeUser } from "../redux/user/userActions";
import { Loader, Message } from "../components/";
import { Toast, Dialog } from "../services";

const ProfilePage = () => {
  const [callOnce, setCallOnce] = useState(false);

  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userByID = useSelector((state) => state.userByID);
  const {
    loading: loadingUserByID,
    error: errorUserByID,
    user: recoveredUser,
    // success: successUserByID,
  } = userByID;

  useEffect(() => {
    if (userInfo) {
      if (!callOnce) {
        dispatch(fetchUserByID(userInfo.id));
      }
      setCallOnce(true);
    }
  }, [callOnce, userInfo, userInfo]);

  return (
    <>
      {errorUserByID && (
        <Message type="danger" itWillBeHidden>
          {errorUserByID}
        </Message>
      )}

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5>votre profile</h5>
            <Link to="/changer-mdp" className="btn btn-dark btn-sm">
              Changer le mot de passe
            </Link>
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
                  {recoveredUser && recoveredUser.email.toLowerCase()}
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
                {recoveredUser.direction.libelle}
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
              <small className="d-block">{recoveredUser.service.libelle}</small>
            ) : (
              <small className="text-danger">
                Cet utilisateur n'est rattaché à aucun service
              </small>
            )}
          </div>
          {/* <hr /> */}

          {/* <div>
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
          </div> */}

          {/* <hr /> */}

          {/* <div>
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
          </div> */}
        </Card.Body>
      </Card>
    </>
  );
};

export default ProfilePage;

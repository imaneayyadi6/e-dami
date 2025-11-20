import { Card } from "react-bootstrap";
import { FormContainer, Loader, Message } from "../components";
import { Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { validateToken, setPasswordUser } from "../redux/user/userActions";
import { Toast } from "../services";


const SetPasswordPage = () => {
  
  const [callOnce, setCallOnce] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userValidateToken = useSelector((state) => state.userValidateToken);
  const { error: errorUserValidateToken } = userValidateToken;

  const userSetPassword = useSelector((state) => state.userSetPassword);
  const {
    error: errorUserSetPassword,
    success: successUserSetPassword,
    loading: loading,
  } = userSetPassword;

  const dispatch = useDispatch();
  const { token } = useParams();

  const submitHandler = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Toast.open({
        message: "les mots de passe ne correspondent pas",
        type: "danger",
      });
    } else {
      dispatch(setPasswordUser(String(password), token));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    } else {
      if (!callOnce) {
        dispatch(validateToken(token));
        setCallOnce(true);
      }
      if (errorUserValidateToken) {
        Toast.open({
          type: "danger",
          message: "access impossible !",
        });
        navigate("/login");
      }

      if (successUserSetPassword) {
        Toast.open({
          type: "success",
          message: "Mot de passe ajouté avec succès !",
        });
        navigate("/login");
      }
    }
  }, [userInfo, errorUserValidateToken, callOnce, successUserSetPassword]);

  return (
    <>
      <FormContainer>
        <Card className="mt-5">
          <Card.Body>
            {}
            {loading && <Loader />}
            {errorUserValidateToken && (
              <Message itWillBeHidden type="danger">
                {errorUserValidateToken}
              </Message>
            )}
            {errorUserSetPassword && (
              <Message itWillBeHidden type="danger">
                {errorUserSetPassword}
              </Message>
            )}
            <div className="d-flex justify-content-center">
              <img
                src="/images/logo.png"
                alt="logo"
                className="logo-login-page"
              />
            </div>
            <div className="d-flex justify-content-center my-1">
              <h4>Snrt / e-dami</h4>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <h6>enregistrer le mot de passe ici</h6>
            </div>
            <Form onSubmit={submitHandler}>
              <label>mot de passe</label>
              <Form.Control
                className="mb-3"
                type="password"
                placeholder="veuillez saisir le nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>confirmer le mot de passe</label>
              <Form.Control
                className="mb-3"
                type="password"
                placeholder="veuillez saisir le nouveau mot de passe de confirmation"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button variant="dark" className="w-100" type="submit">
                enregistrer le mot de passe
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </FormContainer>
    </>
  );
};

export default SetPasswordPage;

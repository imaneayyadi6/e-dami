import React, { useEffect, useState } from "react";
import { FormContainer, Loader, Message, Toast } from "../components";
import { Button, Card, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/user/userActions";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login(email, password));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  return (
    <>
      <Toast />
      <FormContainer>
        <Card className="mt-5">
          <Card.Body>
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
              <h6>Connectez-vous ici</h6>
            </div>
            {loading && <Loader size={"md"} />}
            {error && (
              <Message type="danger" itWillBeHidden>
                {error}
              </Message>
            )}
            <Form onSubmit={submitHandler}>
              <label>Email ou Matricule</label>
              <Form.Control
                className="mb-3"
                placeholder="veuillez saisir un email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Mot de passe</label>
              <Form.Control
                className="mb-3"
                type={showPassword ? "text" : "password"}
                placeholder="veuillez saisir un mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Check
                  label="montrer le mot de passe"
                  className="mb-3"
                  value={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <Link to="/mdp-oublie">Mot de passe oublié</Link>
              </div>
              <Button
                className="w-100"
                variant="dark"
                type="submit"
                disabled={loading}
              >
                <i className="mr-1 fa-solid fa-right-to-bracket"></i>
                se connecter
              </Button>
            </Form>
            <div className="d-flex justify-content-center mt-3">
              <Link to="/recupertaion-compte">Recuperer mon compte</Link>
            </div>
          </Card.Body>
        </Card>
      </FormContainer>
    </>
  );
};

export default LoginPage;

import { Card } from "react-bootstrap";
import { FormContainer, Loader, Message } from "../components";
import { Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAccount, resetGetAccount } from "../redux/user/userActions";
import { useParams, useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [matricule, setMatricule] = useState("");

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userGetAccount = useSelector((state) => state.userGetAccount);
  const { error, success, result, loading } = userGetAccount;

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    if (matricule !== "") {
      dispatch(getAccount(matricule));
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (userInfo) {
      navigate("/");
    } else {
      if (success) {
        setTimeout(() => {
          dispatch(resetGetAccount());
          navigate("/login");
        }, 15000);
      }
    }
  }, [userInfo, success]);

  return (
    <>
      <div className="px-5 mt-2">
        <Link to="/login" className="btn btn-light">
          <i className="fas fa-arrow-left"></i> login
        </Link>
      </div>

      <FormContainer>
        <Card className="mt-5">
          <Card.Body>
            {error && (
              <Message itWillBeHidden type="danger">
                {error}
              </Message>
            )}

            {success && (
              <Alert variant="success">
                <div className="d-flex justify-content-center">
                  <h1>
                    <i className="fa-solid fa-circle-check"></i>
                  </h1>
                </div>
                <p>
                  Un e-mail a été envoyé à votre boîte mail Zimbra '
                  {result.email}' afin que vous puissiez définir un mot de
                  passe.
                </p>
              </Alert>
            )}
            {loading && (
              <div className="my-3">
                <Loader size={"sm"} />
              </div>
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
              <h6>Recuperer votre compte</h6>
            </div>
            <Message variant="info">
              veuillez saisir votre matricule afin de recevoir un email vous
              permettant de définir un nouveau mot de passe.
            </Message>
            <Form onSubmit={submitHandler}>
              <label>matricule</label>
              <Form.Control
                className="mb-3"
                type="number"
                placeholder="veuillez saisir votre matricule"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                disabled={success}
              />
              <Button
                variant="dark"
                className="w-100"
                type="submit"
                disabled={success}
              >
                Recuperer mon compte
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </FormContainer>
    </>
  );
};

export default RegisterPage;

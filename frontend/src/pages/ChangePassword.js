import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "../services";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Message } from "../components";
import { resetUpdateUserPassword, updateUserPassword } from "../redux/user/userActions";
const changePasswordvalidationSchema = Yup.object({
  password: Yup.string().required("il faut saisire le mot de passe !"),
  confirmPassword: Yup.string().required(
    "il faut saisire le mot de passe de confirmation !"
  ),
});

const ChangePassword = () => {
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const userUpdatePassword = useSelector((state) => state.userUpdatePassword);
  const {
    loading: loadingUserUpdatePassword,
    error: errorUserUpdatePassword,
    success: successUserUpdatePassword,
  } = userUpdatePassword;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const dispatch = useDispatch();
  const changePasswordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordvalidationSchema,
    onSubmit: (values) => {
      const { password, confirmPassword } = values;
      if (String(password) === String(confirmPassword)) {
        console.log("");
        if (userInfo) dispatch(updateUserPassword(userInfo.id, password));
      } else {
        setMessage(
          "le mot de passe et le mot de passe de confirmation ne correspondent pas"
        );
        setTimeout(() => {
          setMessage(null);
        }, 7000);
      }

      window.scrollTo(0, 0);
    },
  });

  useEffect(() => {
    if (successUserUpdatePassword) {
      console.log("### [SUCCESS] ###");
      Toast.open({
        type: "success",
        title: "Modification avec success",
        message: "le mot de passe a été modifiée avec succès",
      });
      changePasswordForm.resetForm();
      dispatch(resetUpdateUserPassword());
    }
  }, [successUserUpdatePassword]);

  return (
    <Card>
      <Card.Body>
        {message && (
          <Message type="danger" itWillBeHidden>
            {message}
          </Message>
        )}
        {errorUserUpdatePassword && (
          <Message type="danger" itWillBeHidden>
            {errorUserUpdatePassword}
          </Message>
        )}
        {loadingUserUpdatePassword && <Loader />}
        <Form className="py-3" onSubmit={changePasswordForm.handleSubmit}>
          <div>
            <label>Mot de passe :</label>
            <Form.Control
              placeholder="veuillez saisir le mot de passe"
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={changePasswordForm.handleChange}
              onBlur={changePasswordForm.handleBlur}
              value={changePasswordForm.values.password}
              disabled={loadingUserUpdatePassword}
            />
            {changePasswordForm.touched.password &&
              changePasswordForm.errors.password && (
                <small className="text-danger d-block">
                  {changePasswordForm.errors.password}
                </small>
              )}
          </div>

          <div>
            <label>Confirmer le mot de passe :</label>
            <Form.Control
              placeholder="veuillez saisir le mot de passe de confirmation"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              onChange={changePasswordForm.handleChange}
              onBlur={changePasswordForm.handleBlur}
              value={changePasswordForm.values.confirmPassword}
              disabled={loadingUserUpdatePassword}
            />
            {changePasswordForm.touched.confirmPassword &&
              changePasswordForm.errors.confirmPassword && (
                <small className="text-danger d-block">
                  {changePasswordForm.errors.confirmPassword}
                </small>
              )}
          </div>
          <Form.Check
            label="afficher le mot de passe"
            type="switch"
            className="mt-1"
            onChange={() => setShowPassword(!showPassword)}
          />

          <Button className="w-100 mt-3" type="submit" variant="dark">
            <i className="fa-solid fa-key"></i> modifier le mot de passe
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ChangePassword;

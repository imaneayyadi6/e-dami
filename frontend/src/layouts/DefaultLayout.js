import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Sidebar, Header, Dialog, Alert, Toast } from "../components";
import routes from "../routes/routes";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../redux/user/userActions";
import { Toast as SToast } from "../services";

const DefaulLayout = () => {
  const [filteredRoutes, setFiltredRoutes] = useState([]);
  const [callOnce, setCallOnce] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const {
    userInfo: { roles },
  } = userLogin;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!callOnce) {
      const roleCodes = roles.map(role => String(role.role.code));
      const filteredRoutes = routes.filter(route =>
        route.roles.some(roleCode => roleCodes.includes(String(roleCode)))
      );
      setFiltredRoutes(filteredRoutes);
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response.status === 401) {
            SToast.open({
              type: "danger",
              message: "vous êtes déconnecté.",
            });
            dispatch(logout());
          }
          return Promise.reject(error);
        }
      );
      setCallOnce(true);
    }
  }, [callOnce, roles]);

  return (
    <>
      <Dialog />
      <Alert />
      <Toast />

      <div className='d-flex'>
        <Sidebar />
        <div className='min-vh-100 main-content'>
          <Header />
          <main className='py-3 main'>
            <Container fluid>
              <Routes>
                {filteredRoutes.length > 0 &&
                  filteredRoutes.map(route => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                      exact={route.exact}
                    />
                  ))}
              </Routes>
            </Container>
          </main>
        </div>
      </div>
    </>
  );
};

export default DefaulLayout;

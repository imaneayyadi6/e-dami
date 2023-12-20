import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Sidebar, Header, Dialog, Alert, Toast } from "../components";
import routes from "../routes/routes";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../redux/user/userActions";
import { Toast as SToast } from "../services";
import io from 'socket.io-client';
import { NOTIFICATION_LIST_PUSH, NOTIFICATION_NOTSEEN_COUNT_PUSH } from "../redux/notification/notificationTypes";
import { getToastNotificationsList } from "../redux/notification/notificationActions";

const socket = io('http://localhost:5000');

const DefaulLayout = () => {
  const [filteredRoutes, setFiltredRoutes] = useState([]);
  const [callOnce, setCallOnce] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const {
    userInfo,
  } = userLogin;


  const notificationToatsList = useSelector(state => state.notificationToatsList);
  const {
    notifications,
    success: notificationToatsListSuccess
  } = notificationToatsList;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!callOnce) {
      dispatch(getToastNotificationsList());
      const roleCodes = userInfo.roles.map(role => String(role.role.code));
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
    if (notificationToatsListSuccess) {
      console.log(notifications)
    }
  }, [callOnce, userInfo, notificationToatsListSuccess]);

  useEffect(() => {
    // listen to comming notifcations :
    socket.on('notification', (obj) => {
      if (String(obj.utilisateur) === String(userInfo.id)) {
        dispatch({ type: NOTIFICATION_LIST_PUSH, payload: obj });

        dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_PUSH })
      }
    });
  }, [])


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

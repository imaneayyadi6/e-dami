import React, { useEffect, useState } from "react";
import { Sidebar, Header, Footer, NotificationsToastContainer } from "../components";
import routes from "../routes/routes";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../redux/user/userActions";
import { Toast as SToast } from "../services";
import { useLanguageSync } from "../hooks/useLanguageSync";

const DefaulLayout = () => {
  const [filteredRoutes, setFiltredRoutes] = useState([]);
  const [callOnce, setCallOnce] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const sidebar = useSelector(state => state.sidebar);
  const { userInfo } = userLogin;
  const { show: sidebarShow, collapsed: sidebarCollapsed } = sidebar;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguageSync();


  
  useEffect(() => {
    if (!callOnce) {
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            const hadAuth = !!error.config?.headers?.Authorization;
            if (hadAuth) {
              SToast.open({ type: "danger", message: "vous êtes déconnecté." });
              dispatch(logout());
            }
          }
          return Promise.reject(error);
        }
      );
      setCallOnce(true);
    }
  }, [callOnce, dispatch]);

  
  useEffect(() => {
    if (!userInfo) {
      setFiltredRoutes([]);
      return;
    }

    let roleCodes = [];

    if ([2003003, 2003002].includes(userInfo.matricule)) {
      roleCodes = ["admin"];
    } else if (userInfo.roles && Array.isArray(userInfo.roles) && userInfo.roles.length > 0) {
      roleCodes = userInfo.roles
        .map(role => role && role.role && String(role.role.code))
        .filter(Boolean)
        .map(code => {
          if (code === "adm") return "admin";
          if (code === "dmr") return "demandeur";
          if (code === "sig") return "signataire";
          if (code === "crt") return "createur";
          return code;
        });
    }

    
    if (roleCodes.length === 0 && typeof userInfo.matricule === 'number' && String(userInfo.matricule).startsWith("2003")) {
      roleCodes = ["admin"];
    }

    const nextRoutes = routes.filter(route =>
      route.roles.some(roleCode => roleCodes.includes(String(roleCode)))
    );

    setFiltredRoutes(nextRoutes);
  }, [userInfo]);


  return (
    <>
      <NotificationsToastContainer />
      <div className='app-layout d-flex' dir={isRTL ? 'rtl' : 'ltr'}>
        <Sidebar />
        <div className={`main-content d-flex flex-column min-vh-100 ${!sidebarShow ? 'sidebar-hidden' : sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />
          <main className='main flex-grow-1 p-responsive'>
            <div className='content-container'>
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
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default DefaulLayout;
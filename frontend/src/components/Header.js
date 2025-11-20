import React, { useEffect, useState } from "react";
import { Button, Container, Navbar, Dropdown, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toggleSidebar } from "../redux/sidebar/sidebarActions";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../redux/user/userActions";
import { getNotificationsNotSeenCount } from "../redux/notification/notificationActions";
import { useLanguageSync } from "../hooks/useLanguageSync";
import {
  MdNotifications,
  MdTranslate,
  MdLogout,
  MdMenu,
  MdClose,
  MdPerson,
} from "react-icons/md";

const Header = () => {
  const [callOnce, setCallOnce] = useState(false);
  
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentLanguage, toggleLanguage, isRTL } = useLanguageSync();

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const notificationsNotSeenCount = useSelector(state => state.notificationsNotSeenCount);
  const { count } = notificationsNotSeenCount;

  
  const sidebarState = useSelector(state => state.sidebar);
  const { show: sidebarShow, collapsed: sidebarCollapsed } = sidebarState;

  const logoutHandler = e => {
    e.preventDefault();
    dispatch(logout());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(getNotificationsNotSeenCount());
      setCallOnce(true);
    }
  }, [callOnce, count]);

  useEffect(() => {
    if (userInfo) {
      dispatch(getNotificationsNotSeenCount());
    }
  }, [dispatch, userInfo, location]);

  return (
    <>
      <style>{`
        .header {
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 60px;
          z-index: 1000;
        }
        
        .header-dark {
          background: #1a202c;
          border-bottom: 1px solid #4a5568;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .header-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          transition: all 0.2s ease;
        }
        
        .header-btn:hover {
          background: #f8f9fa;
        }
        
        .header-btn-dark:hover {
          background: #2d3748;
        }
        
        .header-btn svg {
          width: 20px;
          height: 20px;
          color: #000000 !important;
        }
        
        .header-btn-dark svg {
          color: #ffffff !important;
        }
        
        .sidebar-toggle {
          background: #007bff !important;
          color: white !important;
        }
        
        .sidebar-toggle:hover {
          background: #0056b3 !important;
        }
        
        .sidebar-toggle svg {
          color: white !important;
        }
        
        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #000000;
        }
        
        .header-brand-dark {
          color: #ffffff;
        }
        
        .header-logo {
          width: 32px;
          height: 32px;
        }
        
        .header-title {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .user-name {
          color: #000000;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .user-name-dark {
          color: #ffffff;
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Mobile styles */
        @media (max-width: 991.98px) {
          .header {
            height: 56px;
            padding: 0 0.75rem;
          }
          
          .header-left, .header-right {
            gap: 0.5rem;
          }
          
          .header-btn {
            width: 36px;
            height: 36px;
          }
          
          .header-btn svg {
            width: 18px;
            height: 18px;
          }
          
          .user-name {
            display: none;
          }
          
          .header-logo {
            width: 28px;
            height: 28px;
          }
          
          .header-title {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 575.98px) {
          .header {
            height: 52px;
            padding: 0 0.5rem;
          }
          
          .header-left, .header-right {
            gap: 0.25rem;
          }
          
          .header-btn {
            width: 32px;
            height: 32px;
          }
          
          .header-btn svg {
            width: 16px;
            height: 16px;
          }
          
          .header-logo {
            width: 24px;
            height: 24px;
          }
          
          .header-title {
            font-size: 0.9rem;
          }
          
          .header-brand {
            gap: 0.25rem;
          }
        }
        
        /* RTL styles */
        [dir="rtl"] .header-content {
          direction: rtl;
        }
        
        [dir="ltr"] .header-content {
          direction: ltr;
        }
        
        /* Header lié à la sidebar */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1030;
          transition: all 0.3s ease;
        }
        
        /* Ajustement du header selon la sidebar */
        [dir="rtl"] .header {
          left: 0;
          right: 0;
        }
        
        [dir="ltr"] .header {
          left: 0;
          right: 0;
        }
        
        /* Header non-cliquable */
        .header-brand {
          pointer-events: none;
          pointer-events: none;
        }
        
        /* Lien entre header et sidebar */
        .header-content {
          position: relative;
        }
        
        /* Ajustement du contenu selon la sidebar */
        [dir="rtl"] .header-content {
          margin-right: 0;
          margin-left: 0;
        }
        
        [dir="ltr"] .header-content {
          margin-left: 0;
          margin-right: 0;
        }
      `}</style>

      <Navbar
        expand="lg"
        className={`header ${document.body.classList.contains('dark-mode') ? 'header-dark' : ''}`}
        fixed="top"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Container fluid>
          <div className="header-content">
            {}
            <div className="header-left">
              {isRTL ? (
                
                <>
                  <button
                    className="header-btn sidebar-toggle"
                    onClick={handleToggleSidebar}
                    title={
                      !sidebarShow ? t('header.showMenu', 'Afficher le menu') : 
                      sidebarCollapsed ? t('header.showFullMenu', 'Afficher le menu complet') : 
                      t('header.hideMenu', 'Masquer le menu')
                    }
                  >
                    {!sidebarShow ? <MdMenu /> : 
                     sidebarCollapsed ? <MdMenu /> : 
                     <MdClose />}
                  </button>
                  <div className={`header-brand ${document.body.classList.contains('dark-mode') ? 'header-brand-dark' : ''}`}>
                    <img src="/images/logo.png" alt="E-DAMI" className="header-logo" />
                    <span className="header-title">E-DAMI</span>
                  </div>
                </>
              ) : (
                
                <>
                  <button
                    className="header-btn sidebar-toggle"
                    onClick={handleToggleSidebar}
                    title={
                      !sidebarShow ? t('header.showMenu', 'Afficher le menu') : 
                      sidebarCollapsed ? t('header.showFullMenu', 'Afficher le menu complet') : 
                      t('header.hideMenu', 'Masquer le menu')
                    }
                  >
                    {!sidebarShow ? <MdMenu /> : 
                     sidebarCollapsed ? <MdMenu /> : 
                     <MdClose />}
                  </button>
                  <div className={`header-brand ${document.body.classList.contains('dark-mode') ? 'header-brand-dark' : ''}`}>
                    <img src="/images/logo.png" alt="E-DAMI" className="header-logo" />
                    <span className="header-title">E-DAMI</span>
                  </div>
                </>
              )}
            </div>

            {}
            <div className="header-right">
              {isRTL ? (
                
                <>
                  <button 
                    className={`header-btn ${document.body.classList.contains('dark-mode') ? 'header-btn-dark' : ''}`} 
                    title={t('header.language', 'Langue')}
                    onClick={toggleLanguage}
                  >
                    <MdTranslate />
                  </button>

                  <LinkContainer to="/notifications">
                    <button className={`header-btn ${document.body.classList.contains('dark-mode') ? 'header-btn-dark' : ''} position-relative`} title={t('header.notifications', 'Notifications')}>
                      <MdNotifications />
                      {count > 0 && (
                        <span className="notification-badge">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </button>
                  </LinkContainer>

                  {userInfo && (
                    <Dropdown align="end">
                      <Dropdown.Toggle as={Button} variant="link" className="d-flex align-items-center" style={{ flexDirection: "row-reverse", textDecoration: "none" }}>
                        <div className="user-avatar">
                          {userInfo.prenom ? userInfo.prenom.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className={`user-name ${document.body.classList.contains('dark-mode') ? 'user-name-dark' : ''}`} style={{ marginRight: "0.5rem", marginLeft: "0" }}>
                          {`${userInfo?.prenom || 'Utilisateur'} ${userInfo?.nom || ''}`}
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/profile">
                          <MdPerson className="me-2" />
                          {t('header.profile', 'Profil')}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logoutHandler} className="text-danger">
                          <MdLogout className="me-2" />
                          {t('header.logout', 'Déconnexion')}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </>
              ) : (
                
                <>
                  <button 
                    className={`header-btn ${document.body.classList.contains('dark-mode') ? 'header-btn-dark' : ''}`} 
                    title={t('header.language', 'Langue')}
                    onClick={toggleLanguage}
                  >
                    <MdTranslate />
                  </button>

                  <LinkContainer to="/notifications">
                    <button className={`header-btn ${document.body.classList.contains('dark-mode') ? 'header-btn-dark' : ''} position-relative`} title={t('header.notifications', 'Notifications')}>
                      <MdNotifications />
                      {count > 0 && (
                        <span className="notification-badge">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </button>
                  </LinkContainer>

                  {userInfo && (
                    <Dropdown align="end">
                      <Dropdown.Toggle as={Button} variant="link" className="d-flex align-items-center" style={{ textDecoration: "none" }}>
                        <div className="user-avatar">
                          {userInfo.prenom ? userInfo.prenom.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className={`user-name ${document.body.classList.contains('dark-mode') ? 'user-name-dark' : ''}`} style={{ marginLeft: "0.5rem", marginRight: "0" }}>
                          {`${userInfo?.prenom || 'Utilisateur'} ${userInfo?.nom || ''}`}
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/profile">
                          <MdPerson className="me-2" />
                          {t('header.profile', 'Profil')}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logoutHandler} className="text-danger">
                          <MdLogout className="me-2" />
                          {t('header.logout', 'Déconnexion')}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
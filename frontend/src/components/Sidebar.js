import React, { useState, useEffect } from "react";
import { Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { hideSidebar } from "../redux/sidebar/sidebarActions";
import { useLanguageSync } from "../hooks/useLanguageSync";
import _nav from "../routes/sidebar.js";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activePath, setActivePath] = useState("");
  const [links, setLinks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const dispatch = useDispatch();

  const sidebar = useSelector((state) => state.sidebar);
  const userLogin = useSelector((state) => state.userLogin);
  const { show, collapsed } = sidebar;
  const { userInfo } = userLogin;

  const { t } = useTranslation();
  const { isRTL } = useLanguageSync();

  
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      
      
      if (wasMobile && !nowMobile && show) {
        dispatch(hideSidebar());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, show, dispatch]);

  
  const getTranslatedNavText = (item) => {
    
    const translationMap = {
      "Tableau de bord": "sidebar.admin.dashboard",
      "Options": "sidebar.admin.options",
      "Utilisateurs": "sidebar.admin.users",
      "Aperçu des demandes": "sidebar.admin.requestsOverview",
      "Approbation des demandes": "sidebar.admin.requestApproval",
      "Catégories & sous-catégories": "sidebar.admin.categories",
      "Directions": "sidebar.admin.directions",
      "Services": "sidebar.admin.services",
      "Aperçu les demandes": "sidebar.signataire.requestsOverview",
      "Demandes d'approbation": "sidebar.signataire.requestApproval",
      "Options Dami": "sidebar.options.dami",
      "Définir un Interim": "sidebar.signataire.defineInterim",
      "Mes demandes": "sidebar.demandeur.myRequests",
      "Faire une demande": "sidebar.demandeur.makeRequest"
    };

    const translationKey = translationMap[item.name];
    if (translationKey) {
      return t(translationKey);
    }
    
    
    return item.name;
  };


  
  useEffect(() => {
    if (userInfo) {
      
      const isAdmin = [2003003, 2003002].includes(userInfo.matricule);
      
      let roleCodes = [];
      
      if (isAdmin) {
        
        roleCodes = ['admin'];
      } else if (userInfo.roles && Array.isArray(userInfo.roles) && userInfo.roles.length > 0) {
        
        roleCodes = userInfo.roles
          .map((role) => role && role.role && role.role.code)
          .filter(Boolean)
          .map(code => {
            if (code === 'adm') return 'admin';
            if (code === 'dmr') return 'demandeur';
            if (code === 'sig') return 'signataire';
            if (code === 'crt') return 'createur';
            return code;
          });
      }

      const filteredNav = _nav.filter((item) => {
        
        const hasRequiredRole = item.roles.some((roleCode) => roleCodes.includes(roleCode));
        
        
        const hasExcludedRole = item.excludeRoles && item.excludeRoles.some((excludeRole) => roleCodes.includes(excludeRole));
        
        
        return hasRequiredRole && !hasExcludedRole;
      });

      setLinks(filteredNav);
    } else {
      setLinks([]);
    }
  }, [userInfo]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);


  const styles = {
    sidebar: {
      background: "var(--bg-primary, #ffffff)",
      borderRight: isRTL ? "none" : "1px solid var(--border-light, #e9ecef)",
      borderLeft: isRTL ? "1px solid var(--border-light, #e9ecef)" : "none",
      boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      width: isMobile ? (show ? "280px" : "0") : (show ? (collapsed ? "80px" : "280px") : "0"),
      position: "fixed",
      top: isMobile ? "56px" : "60px",
      left: isRTL ? "auto" : 0,
      right: isRTL ? 0 : "auto",
      height: isMobile ? "calc(100vh - 56px)" : "calc(100vh - 60px)",
      zIndex: 1020,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.3s ease",
      transform: isMobile && !show ? (isRTL ? "translateX(100%)" : "translateX(-100%)") : "translateX(0)",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 1010,
      display: isMobile && show ? "block" : "none",
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: "1rem 0.5rem",
    },
    navLink: (item) => ({
      color: activePath.startsWith(item.to) ? "var(--primary-color, #007bff)" : "var(--text-secondary, #6c757d)",
      background: activePath.startsWith(item.to) ? "var(--bg-secondary, #f8f9fa)" : "transparent",
      borderRadius: "12px",
      margin: "4px 8px",
      padding: collapsed && !isMobile ? "12px 8px" : "12px 16px",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: collapsed && !isMobile ? "0" : "12px",
      textDecoration: "none",
      position: "relative",
      overflow: "hidden",
      minHeight: "48px",
      justifyContent: collapsed && !isMobile ? "center" : "flex-start",
      flexDirection: isRTL ? "row-reverse" : "row",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      zIndex: 1,
      fontWeight: activePath.startsWith(item.to) ? "600" : "500",
      border: "1px solid transparent",
    }),
    activeIndicator: (item) => ({
      position: "absolute",
      left: isRTL ? "auto" : 0,
      right: isRTL ? 0 : "auto",
      top: "50%",
      transform: "translateY(-50%)",
      width: "4px",
      height: "24px",
      background: "var(--primary-color, #007bff)",
      borderRadius: isRTL ? "2px 0 0 2px" : "0 2px 2px 0",
      zIndex: 2,
    }),
    navIconWrap: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: collapsed && !isMobile ? 32 : 40,
      height: collapsed && !isMobile ? 32 : 40,
      flexShrink: 0,
      borderRadius: "10px",
      background: "var(--bg-secondary, #f8f9fa)",
      transition: "all 0.2s ease",
    },
    navIcon: (item) => ({
      color: activePath.startsWith(item.to)
        ? "var(--primary-color, #007bff)"
        : "var(--text-secondary, #6c757d)",
      transition: "color 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: collapsed && !isMobile ? "18px" : "20px",
      width: collapsed && !isMobile ? "18px" : "20px",
      height: collapsed && !isMobile ? "18px" : "20px",
    }),
    navTextWrap: {
      display: collapsed && !isMobile ? "none" : "inline-flex",
      alignItems: "center",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
      flex: "1 1 auto",
    },
    navText: (item) => ({
      fontWeight: activePath.startsWith(item.to) ? "600" : "500",
      fontSize: "14px",
      color: activePath.startsWith(item.to) ? "var(--primary-color, #007bff)" : "var(--text-secondary, #6c757d)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flex: "1 1 auto",
      minWidth: 0,
    }),
    footer: {
      padding: "1rem",
      borderTop: "1px solid var(--border-light, #e9ecef)",
      background: "var(--bg-secondary, #f8f9fa)",
      textAlign: isRTL ? "right" : "left",
      fontSize: "12px",
      color: "var(--text-tertiary, #6c757d)",
    },
  };

  return (
    <>
      <style>{`
        /* Styles pour le mode collapsed en RTL */
        [dir="rtl"] .nav-item.collapsed {
          justify-content: center !important;
        }
        
        [dir="rtl"] .nav-item.collapsed .nav-icon {
          margin: 0 !important;
        }
        
        [dir="rtl"] .nav-item.collapsed .nav-text-wrap {
          display: none !important;
        }
        
        /* Styles pour le mode collapsed en LTR */
        [dir="ltr"] .nav-item.collapsed {
          justify-content: center !important;
        }
        
        [dir="ltr"] .nav-item.collapsed .nav-icon {
          margin: 0 !important;
        }
        
        [dir="ltr"] .nav-item.collapsed .nav-text-wrap {
          display: none !important;
        }
        
        /* Amélioration des icônes en mode collapsed */
        .nav-item.collapsed .nav-icon {
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .nav-item.collapsed .nav-icon span {
          font-size: 18px !important;
          width: 18px !important;
          height: 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
      {}
      {isMobile && show && (
        <div
          style={styles.overlay}
          onClick={() => dispatch(hideSidebar())}
        />
      )}

      {}
      <div
        className="modern-sidebar"
        style={styles.sidebar}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="sidebar-content" style={styles.content}>
          <Nav className="flex-column">
            {links.map((item) => {
              const isActive = activePath.startsWith(item.to);

              return (
                <LinkContainer key={item.to} to={item.to}>
                  <Nav.Link
                    className={`nav-item ${isActive ? "active" : ""} ${collapsed && !isMobile ? "collapsed" : ""}`}
                    style={styles.navLink(item)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--bg-secondary, #f8f9fa)";
                        e.currentTarget.style.borderColor = "var(--border-light, #e9ecef)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                    title={getTranslatedNavText(item)}
                    onClick={() => {
                      
                      if (isMobile) {
                        dispatch(hideSidebar());
                      }
                    }}
                  >
                    {isActive && (
                      <div style={styles.activeIndicator(item)} />
                    )}

                    <span
                      className="nav-icon"
                      style={styles.navIconWrap}
                      aria-hidden
                    >
                      <span style={styles.navIcon(item)}>{item.icon}</span>
                    </span>

                    {(!collapsed || isMobile) && (
                      <span style={styles.navTextWrap}>
                        <span style={styles.navText(item)}>
                          {getTranslatedNavText(item)}
                        </span>
                      </span>
                    )}
                  </Nav.Link>
                </LinkContainer>
              );
            })}
          </Nav>
        </div>

      </div>
    </>
  );
};

export default Sidebar;

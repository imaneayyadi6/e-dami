import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const RedirectPage = () => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  const location = useLocation();
  const currentPath = location.pathname;

  
  if (currentPath === "/") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Redirection en cours...</span>
          </div>
          <h4 className="text-primary">Redirection en cours...</h4>
          <p className="text-muted">Vous allez être redirigé vers votre tableau de bord</p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <h1 style={{ fontSize: "72px", color: "#dc3545" }}>404</h1>
        <h3 className="mb-3">Page introuvable</h3>
        <p className="text-muted mb-4">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div>
          {(() => {
            // Déterminer une route de repli selon le rôle
            if (!userInfo) return <Link to="/login" className="btn btn-primary">Se connecter</Link>;

            const roleCodes = Array.isArray(userInfo.roles)
              ? userInfo.roles.map(role => role && role.role && String(role.role.code)).filter(Boolean)
              : [];

            if ([2003003, 2003002].includes(userInfo.matricule)) {
              return <Link to="/admin/dashboard" className="btn btn-primary">Tableau de bord Admin</Link>;
            }
            if (roleCodes.includes("sig")) {
              return <Link to="/signataire/dashboard" className="btn btn-primary">Tableau de bord Signataire</Link>;
            }
            if (roleCodes.includes("dmr")) {
              return <Link to="/demandeur/mes-demandes" className="btn btn-primary">Mes demandes</Link>;
            }
            if (roleCodes.includes("crt")) {
              return <Link to="/createur/options" className="btn btn-primary">Options</Link>;
            }
            return <Link to="/" className="btn btn-primary">Accueil</Link>;
          })()}
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;

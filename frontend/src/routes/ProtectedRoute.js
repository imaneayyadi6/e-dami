import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userInfo && location.pathname === "/") {
      console.log("ProtectedRoute - Redirecting from root path, userInfo:", userInfo);
      
      
      if ([2003003, 2003002].includes(userInfo.matricule)) {
        console.log("ProtectedRoute - Redirecting admin to /admin/dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else if (userInfo.matricule === 2003004) {
        console.log("ProtectedRoute - Redirecting demandeur to /demandeur/mes-demandes");
        navigate("/demandeur/mes-demandes", { replace: true });
      } else if (userInfo.matricule === 2003005) {
        console.log("ProtectedRoute - Redirecting signataire to /signataire/dashboard");
        navigate("/signataire/dashboard", { replace: true });
      } else if (userInfo.matricule === 2003006) {
        console.log("ProtectedRoute - Redirecting createur to /createur/options");
        navigate("/createur/options", { replace: true });
      } else {
        console.log("ProtectedRoute - Default admin redirect to /admin/dashboard");
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [userInfo, location.pathname, navigate]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  
  if (location.pathname === "/" && userInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Redirection en cours...</span>
          </div>
          <h4 className="text-primary">Redirection en cours...</h4>
          <p className="text-muted">Vous allez être redirigé vers votre tableau de bord</p>
          <p className="text-muted">Matricule: {userInfo?.matricule || 'Non défini'}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

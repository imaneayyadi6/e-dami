import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const navigate = useNavigate();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  const [role, setRole] = useState("");

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {

    if (userInfo) {
      const roleCodes = userInfo.roles.map(role => String(role.role.code));
      if (roleCodes.includes("crt") || roleCodes.includes("sig")) {
        setRole("rl")
      } else if (roleCodes.includes("dmr")) {
        if (currentPath.split("/")[1] === "") navigate("/mes-demandes");
        setRole("nl")
      }
    }

  }, []);

  return (
    <div className="alert alert-info">
      <div className="d-flex justify-content-center">
        <h1 style={{ fontSize: "48px" }}>404</h1>
      </div>
      <div className="d-flex justify-content-center">
        <p>
          page introuvable {role === "rl" ?
            <Link to="/">accueil</Link> :
            <Link to="/mes-demandes">mes demandes</Link>
          }
        </p>
      </div>
    </div>
  );
};

export default RedirectPage;

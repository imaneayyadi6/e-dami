import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const navigate = useNavigate();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) {
      const roleCodes = userInfo.roles.map(role => String(role.role.code));
      if (roleCodes.includes("crt") || roleCodes.includes("sig")) {
        navigate("/");
      } else if (roleCodes.includes("dmr")) {
        navigate("/mes-demandes");
      }
    }
  }, [userInfo]);

  return <div>RedirectPage</div>;
};

export default RedirectPage;

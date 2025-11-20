import React from "react";
import { useSelector } from "react-redux";

const TestAdmin = () => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Admin Page</h1>
      <div style={{ background: "#f0f0f0", padding: "10px", margin: "10px 0" }}>
        <h3>User Info:</h3>
        <p><strong>Matricule:</strong> {userInfo?.matricule || 'Non défini'}</p>
        <p><strong>Nom:</strong> {userInfo?.nom || 'Non défini'}</p>
        <p><strong>Prenom:</strong> {userInfo?.prenom || 'Non défini'}</p>
        <p><strong>Roles:</strong> {JSON.stringify(userInfo?.roles || [])}</p>
      </div>
      <div style={{ background: "#e0f0ff", padding: "10px", margin: "10px 0" }}>
        <h3>Admin Test:</h3>
        <p>Si vous voyez cette page, la redirection fonctionne !</p>
        <p>Vous êtes connecté en tant qu'admin.</p>
      </div>
    </div>
  );
};

export default TestAdmin;

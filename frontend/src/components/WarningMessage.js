import React from "react";

const WarningMessage = ({ message }) => {
  return (
    <div className="d-flex flex-column justify-content-center h-100">
      <div className="d-flex justify-content-center">
        <h1 className="text-secondary">
          <i className="fas fa-triangle-exclamation"></i>
        </h1>
      </div>
      <div className="d-flex justify-content-center ">
        <p className="text-secondary">{message}</p>
      </div>
    </div>
  );
};

export default WarningMessage;

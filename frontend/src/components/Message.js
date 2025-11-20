import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

const messageIcon = {
  danger: <i className="mr-1 fa-solid fa-circle-xmark"></i>,
  warning: <i className="mr-1 fa-solid fa-circle-exclamation"></i>,
  info: <i className="mr-1 fa-solid fa-circle-info"></i>,
  success: <i className="mr-1 fa-solid fa-circle-check"></i>,
};

const Message = ({ type = "info", children, itWillBeHidden = false }) => {
  const [visible, setVisible] = useState(true);

  const handleRemove = () => {
    setVisible(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  if (itWillBeHidden) {
    return (
      <>
        {visible && (
          <Alert variant={type}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {messageIcon[type]}
                <small>{children}</small>
              </div>
              <span className="pointer-auto" onClick={handleRemove}>
                <i className="fas fa-times"></i>
              </span>
            </div>
          </Alert>
        )}
      </>
    );
  } else {
    return (
      <Alert variant={type}>
        <div className="d-flex align-items-center">
          {messageIcon[type]}
          <small>{children}</small>
        </div>
      </Alert>
    );
  }
};

export default Message;

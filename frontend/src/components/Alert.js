import React from "react";
import { Button, Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { hideAlert } from "../redux/alert/alertActions";

const alertIcon = {
  danger: <i className='fa-solid fa-xmark text-danger'></i>,
  warning: <i className='fa-solid fa-exclamation text-warning'></i>,
  info: <i className='fa-solid fa-info text-info'></i>,
  success: <i className='fa-solid fa-check text-success'></i>,
};

const Alert = ({ alert, hideAlert }) => {
  return (
    <Modal show={alert.show} centered>
      <Modal.Body>
        <div className='d-flex justify-content-center'>
          <div
            style={{
              border: `3px solid var(--bs-${alert.type})`,
              borderRadius: "50%",
              width: "90px",
              height: "90px",
              position: "relative",
            }}>
            <span
              className='text-dark'
              style={{
                fontSize: "40px",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: " translate(-50%, -50%)",
              }}>
              {alertIcon[alert.type]}
            </span>
          </div>
        </div>
        <div className='d-flex justify-content-center mt-2'>
          <h5 className='mb-0'>{alert.title}</h5>
        </div>
        <div className='d-flex justify-content-center mt-1 text-center'>
          <p>{alert.message}</p>
        </div>
        <div className='d-flex justify-content-center'>
          <Button variant={alert.type} onClick={hideAlert}>
            Ok
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = state => {
  const { alert } = state;
  return { alert };
};

const mapDispatchToProps = dispatch => {
  return { hideAlert: () => dispatch(hideAlert()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Alert);

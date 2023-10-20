import React from "react";
import { Button, Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { hideDialog } from "../redux/dialog/dialogActions";

const Dialog = ({ dialog, hideDialog }) => {
  const yesHandler = () => {
    hideDialog();
    if (dialog.onYes) dialog.onYes();
  };
  const noHandler = () => {
    hideDialog();
    if (dialog.onNo) dialog.onNo();
  };

  return (
    <Modal show={dialog.show} centered>
      <Modal.Body>
        <div className="d-flex justify-content-center">
          <span className="text-dark" style={{ fontSize: "80px" }}>
            <i className="fa-regular fa-circle-question"></i>
          </span>
        </div>
        <div className="d-flex justify-content-center mt-2">
          <h5 className="mb-0">{dialog.title}</h5>
        </div>
        <div className="d-flex justify-content-center mt-1 text-center">
          <p className="p-2 text-center">{dialog.message}</p>
        </div>
        <div className="d-flex justify-content-center">
          <Button variant="dark" className="m-1" onClick={yesHandler}>
            Oui
          </Button>
          <Button variant="danger" className="m-1" onClick={noHandler}>
            Non
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { dialog } = state;
  return { dialog };
};

const mapDispatchToProps = (dispatch) => {
  return { hideDialog: () => dispatch(hideDialog()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);

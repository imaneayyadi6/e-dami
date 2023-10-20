import React, { useEffect } from "react";
import { connect } from "react-redux";
import { hideToast } from "../redux/toast/toastActions";

const alertIcon = {
    danger: <i className="fa-solid fa-circle-xmark"></i>,
    warning: <i className="fa-solid fa-circle-exclamation"></i>,
    info: <i className="fa-solid fa-circle-info"></i>,
    success: <i className="fa-solid fa-circle-check"></i>,
};

const Toast = ({ toast, hideToast }) => {
    useEffect(() => {
        let timeout = null
        if (toast.show) {

        }
        timeout = setTimeout(
            hideToast
            , 5000)
        return () => clearTimeout(timeout);
    }, [toast])

    return (
        <div className={`m-toast m-toast-${toast.type} ${toast.show ? "show" : ""}`}>
            <div className="m-toast-content">
                <div className="m-toast-wrapper">
                    {alertIcon[toast.type]}{" "}<small>{toast.message}</small>
                </div>
                <span className="btn-remove cursor-pointer" onClick={hideToast}>
                    <i className="fa-solid fa-xmark"></i>
                </span>
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    const { toast } = state;
    return { toast };
};

const mapDispatchToProps = dispatch => {
    return { hideToast: () => dispatch(hideToast()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toast);
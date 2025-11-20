import React, { useEffect } from "react";
import { connect } from "react-redux";
import { hideToast } from "../redux/toast/toastActions";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";

const alertIcon = {
    danger: <i className="fa-solid fa-circle-xmark"></i>,
    warning: <i className="fa-solid fa-circle-exclamation"></i>,
    info: <i className="fa-solid fa-circle-info"></i>,
    success: <i className="fa-solid fa-circle-check"></i>,
};

const Toast = ({ toast, hideToast }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguageSync();

    useEffect(() => {
        let timeout = null
        if (toast.show) {

        }
        timeout = setTimeout(
            hideToast
            , 5000)
        return () => clearTimeout(timeout);
    }, [toast])

    
    const getTranslatedMessage = (message) => {
        
        if (typeof message === 'string' && (message.startsWith('notifications.') || message.startsWith('common.'))) {
            return t(message);
        }
        
        if (typeof message === 'object' && message.title && message.message) {
            return {
                title: typeof message.title === 'string' && message.title.startsWith('notifications.') ? t(message.title) : message.title,
                message: typeof message.message === 'string' && message.message.startsWith('notifications.') ? t(message.message) : message.message
            };
        }
        
        return message;
    };

    const translatedContent = getTranslatedMessage(toast.message);

    return (
        <div className={`m-toast m-toast-${toast.type} ${toast.show ? "show" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="m-toast-content">
                <div className="m-toast-wrapper">
                    {alertIcon[toast.type]}{" "}
                    {typeof translatedContent === 'object' ? (
                        <div>
                            <small style={{ fontWeight: 'bold', display: 'block' }}>{translatedContent.title}</small>
                            <small>{translatedContent.message}</small>
                        </div>
                    ) : (
                        <small>{translatedContent}</small>
                    )}
                </div>
                <span className="btn-remove pointer-auto" onClick={hideToast}>
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
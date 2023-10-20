import { SHOW_TOAST, HIDE_TOAST } from "./toastTypes";

export const showToast = obj => {
    return { type: SHOW_TOAST, payload: obj };
};

export const hideToast = () => {
    return {
        type: HIDE_TOAST,
    };
};

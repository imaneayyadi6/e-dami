import { SHOW_TOAST, HIDE_TOAST } from "./toastTypes";

export const toastReducer = (state = { show: false }, action) => {
    const { type, payload } = action;
    switch (type) {
        case SHOW_TOAST:
            return {
                show: true,
                type: payload.type,
                message: payload.message,
            };
        case HIDE_TOAST:
            return { show: false };
        default:
            return state;
    }
};

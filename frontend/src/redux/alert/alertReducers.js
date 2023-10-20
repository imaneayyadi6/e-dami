import { SHOW_ALERT, HIDE_ALERT } from "./alertTypes";

export const alertReducer = (state = { show: false }, action) => {
  const { type, payload } = action;
  switch (type) {
    case SHOW_ALERT:
      return {
        show: true,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      };
    case HIDE_ALERT:
      return { show: false };
    default:
      return state;
  }
};

import { HIDE_DIALOG, SHOW_DIALOG } from "./dialogTypes";

export const dialogReducer = (state = { show: false }, action) => {
  const { type, payload } = action;
  switch (type) {
    case SHOW_DIALOG:
      return {
        show: true,
        title: payload.title,
        message: payload.message,
        onYes: payload.onYes,
        onNo: payload.onNo,
      };
    case HIDE_DIALOG:
      return { show: false };
    default:
      return state;
  }
};

import { HIDE_SIDEBAR, SHOW_SIDEBAR } from "./sidebarTypes";

export const sidebarReducer = (state = { show: false }, action) => {
  const { type } = action;
  switch (type) {
    case SHOW_SIDEBAR:
      return { show: true };
    case HIDE_SIDEBAR:
      return { show: false };
    default:
      return state;
  }
};

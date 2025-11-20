import { HIDE_SIDEBAR, SHOW_SIDEBAR, TOGGLE_SIDEBAR } from "./sidebarTypes";

export const sidebarReducer = (state = { show: false, collapsed: false }, action) => {
  const { type } = action;
  switch (type) {
    case SHOW_SIDEBAR:
      return { show: true, collapsed: false };
    case HIDE_SIDEBAR:
      return { show: false, collapsed: false };
    case TOGGLE_SIDEBAR:
      if (!state.show) {
        return { show: true, collapsed: false };
      } else if (!state.collapsed) {
        return { show: true, collapsed: true };
      } else {
        return { show: false, collapsed: false };
      }
    default:
      return state;
  }
};

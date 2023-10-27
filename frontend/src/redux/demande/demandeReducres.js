import {
  DEMANDE_CREATE_FAIL,
  DEMANDE_CREATE_REQUEST,
  DEMANDE_CREATE_RESET,
  DEMANDE_CREATE_SUCCESS,
  DEMANDE_TOHANDLE_LIST_FAIL,
  DEMANDE_TOHANDLE_LIST_REQUEST,
  DEMANDE_TOHANDLE_LIST_RESET,
  DEMANDE_TOHANDLE_LIST_SUCCESS,
} from "./demandeTypes";

export const demandeCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_CREATE_REQUEST:
      return { loading: true };
    case DEMANDE_CREATE_SUCCESS:
      return { loading: false, success: true };
    case DEMANDE_CREATE_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const demandesToHandleReducer = (state = { demandes: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_TOHANDLE_LIST_REQUEST:
      return { loading: true, demandes: [] };
    case DEMANDE_TOHANDLE_LIST_SUCCESS:
      return { loading: false, success: true, demandes: payload };
    case DEMANDE_TOHANDLE_LIST_FAIL:
      return { loading: false, error: payload, demandes: [] };
    case DEMANDE_TOHANDLE_LIST_RESET:
      return { demandes: [] };
    default:
      return state;
  }
};

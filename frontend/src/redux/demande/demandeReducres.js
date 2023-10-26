import {
  DEMANDE_CREATE_FAIL,
  DEMANDE_CREATE_REQUEST,
  DEMANDE_CREATE_RESET,
  DEMANDE_CREATE_SUCCESS,
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

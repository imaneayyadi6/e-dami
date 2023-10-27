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
import axios from "axios";

export const createDemande = (option, contenu) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/demandes",
        { option, contenu },
        config
      );
      dispatch({ type: DEMANDE_CREATE_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateDemande = () => {
  return { type: DEMANDE_CREATE_RESET };
};

export const getDemandesToHandle = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_TOHANDLE_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/demandes/handle", config);
      dispatch({ type: DEMANDE_TOHANDLE_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_TOHANDLE_LIST_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesToHandle = () => {
  return { type: DEMANDE_TOHANDLE_LIST_RESET };
};

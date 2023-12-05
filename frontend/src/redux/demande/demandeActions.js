import {
  DEMANDE_CREATE_FAIL,
  DEMANDE_CREATE_REQUEST,
  DEMANDE_CREATE_RESET,
  DEMANDE_CREATE_SUCCESS,
  DEMANDE_TOHANDLE_LIST_FAIL,
  DEMANDE_TOHANDLE_LIST_REQUEST,
  DEMANDE_TOHANDLE_LIST_RESET,
  DEMANDE_TOHANDLE_LIST_SUCCESS,
  DEMANDE_BY_ID_FAIL,
  DEMANDE_BY_ID_REQUEST,
  DEMANDE_BY_ID_RESET,
  DEMANDE_BY_ID_SUCCESS,
  DEMANDE_TRAITEMENT_STATUS_FAIL, DEMANDE_TRAITEMENT_STATUS_REQUEST, DEMANDE_TRAITEMENT_STATUS_RESET, DEMANDE_TRAITEMENT_STATUS_SUCCESS
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

export const getDemandeByID = (id, idTraitement) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/demandes/${id}/traitement/${idTraitement}`, config);
      dispatch({ type: DEMANDE_BY_ID_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetGetDemandeByID = () => {
  return { type: DEMANDE_BY_ID_RESET };
};


export const getDemandeTraitementStatus = (id, idTraitement) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/demandes/${id}/status/${idTraitement}`, config);
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_FAIL, payload: err });
    }
  };
};

export const resetGetDemandeTraitementStatus = () => {
  return { type: DEMANDE_TRAITEMENT_STATUS_RESET };
};
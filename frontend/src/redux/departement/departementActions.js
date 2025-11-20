import {
  DEPARTEMENT_LIST_BY_DIRECTION_ID_FAIL,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_REQUEST,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_RESET,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_SUCCESS,



  DEPARTEMENT_LIST_FAIL,
  DEPARTEMENT_LIST_REQUEST,
  DEPARTEMENT_LIST_RESET,
  DEPARTEMENT_LIST_SUCCESS,
  DEPARTEMENT_BY_ID_FAIL,
  DEPARTEMENT_BY_ID_REQUEST,
  DEPARTEMENT_BY_ID_RESET,
  DEPARTEMENT_BY_ID_SUCCESS,
} from "./departementTypes";

import axios from "axios";

export const fetchDepartements = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEPARTEMENT_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/departements", config);
      dispatch({ type: DEPARTEMENT_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEPARTEMENT_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchDepartements = () => {
  return { type: DEPARTEMENT_LIST_RESET };
};

export const fetchDepartementsByDirectionID = (directionID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEPARTEMENT_LIST_BY_DIRECTION_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/departements/direction/${directionID}`,
        config
      );
      dispatch({
        type: DEPARTEMENT_LIST_BY_DIRECTION_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEPARTEMENT_LIST_BY_DIRECTION_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchDepartementsByDirectionID = () => {
  return { type: DEPARTEMENT_LIST_BY_DIRECTION_ID_RESET };
};

export const fetchDepartementByID = (DepartementID) => {
  return async (dispatch, getState) => {
    
    if (!DepartementID || DepartementID === 'undefined' || DepartementID === 'null' || DepartementID.trim() === '') {
      console.warn('fetchDepartementByID: Invalid DepartementID provided:', DepartementID);
      dispatch({ type: DEPARTEMENT_BY_ID_FAIL, payload: 'Invalid departement ID' });
      return;
    }

    try {
      dispatch({ type: DEPARTEMENT_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/departements/${DepartementID}`, config);
      dispatch({
        type: DEPARTEMENT_BY_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEPARTEMENT_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchDepartementByID = () => {
  return { type: DEPARTEMENT_BY_ID_RESET };
};

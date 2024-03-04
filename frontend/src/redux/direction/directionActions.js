import {
  DIRECTION_CREATE_REQUEST,
  DIRECTION_CREATE_SUCCESS,
  DIRECTION_CREATE_FAIL,
  DIRECTION_CREATE_RESET,
  DIRECTION_LIST_FAIL,
  DIRECTION_LIST_REQUEST,
  DIRECTION_LIST_RESET,
  DIRECTION_LIST_SUCCESS,
  DIRECTION_REMOVE_REQUEST,
  DIRECTION_REMOVE_SUCCESS,
  DIRECTION_REMOVE_FAIL,
  DIRECTION_REMOVE_RESET,
  DIRECTION_UPDATE_FAIL,
  DIRECTION_UPDATE_REQUEST,
  DIRECTION_UPDATE_RESET,
  DIRECTION_UPDATE_SUCCESS,
  DIRECTION_LIST_ADD,
  DIRECTION_LIST_REMOVE,
  DIRECTION_LIST_UPDATE,
  DIRECTION_BY_SERVICE_ID_REQUEST,
  DIRECTION_BY_SERVICE_ID_SUCCESS,
  DIRECTION_BY_SERVICE_ID_FAIL,
  DIRECTION_BY_SERVICE_ID_RESET,
  DIRECTION_LIST_SIGNATAIRES_REQUEST,
  DIRECTION_LIST_SIGNATAIRES_SUCCESS,
  DIRECTION_LIST_SIGNATAIRES_FAIL,
  DIRECTION_LIST_SIGNATAIRES_RESET,
} from "./directionTypes";

import axios from "axios";

export const fetchDirections = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/directions", config);
      dispatch({ type: DIRECTION_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchDirections = () => {
  return { type: DIRECTION_LIST_RESET };
};

export const fetchDirectionsSignataires = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_LIST_SIGNATAIRES_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/directions/signataires", config);
      dispatch({ type: DIRECTION_LIST_SIGNATAIRES_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_LIST_SIGNATAIRES_FAIL, payload: err });
    }
  };
};

export const resetFetchDirectionsSignataires = () => {
  return { type: DIRECTION_LIST_SIGNATAIRES_RESET };
};

export const getByServiceID = (serviceID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_BY_SERVICE_ID_REQUEST });
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
        `/api/directions/service/${serviceID}`,
        config
      );
      dispatch({ type: DIRECTION_BY_SERVICE_ID_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_BY_SERVICE_ID_FAIL, payload: err });
    }
  };
};

export const resetGetByServiceID = () => {
  return { type: DIRECTION_BY_SERVICE_ID_RESET };
};

export const createDirection = (direction) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post("/api/directions", direction, config);

      dispatch({ type: DIRECTION_CREATE_SUCCESS, payload: data });
      dispatch({ type: DIRECTION_LIST_ADD, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateDirection = () => {
  return { type: DIRECTION_CREATE_RESET };
};

export const removeDirection = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/directions/${id}`, config);

      dispatch({ type: DIRECTION_REMOVE_SUCCESS, payload: data });
      dispatch({ type: DIRECTION_LIST_REMOVE, payload: id });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_REMOVE_FAIL, payload: err });
    }
  };
};

export const resetRemoveDirection = () => {
  return { type: DIRECTION_REMOVE_RESET };
};

export const updateDirection = (id, direction) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DIRECTION_UPDATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/directions/${id}`,
        direction,
        config
      );

      dispatch({ type: DIRECTION_UPDATE_SUCCESS, payload: data });
      dispatch({ type: DIRECTION_LIST_UPDATE, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DIRECTION_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateDirection = () => {
  return { type: DIRECTION_UPDATE_RESET };
};

import {
  SERVICE_LIST_BY_DIRECTION_ID_FAIL,
  SERVICE_LIST_BY_DIRECTION_ID_REQUEST,
  SERVICE_LIST_BY_DIRECTION_ID_RESET,
  SERVICE_LIST_BY_DIRECTION_ID_SUCCESS,
  SERVICE_CREATE_FAIL,
  SERVICE_CREATE_REQUEST,
  SERVICE_CREATE_RESET,
  SERVICE_CREATE_SUCCESS,
  SERVICE_LIST_BY_DIRECTION_ID_ADD,
  SERVICE_LIST_BY_DIRECTION_ID_REMOVE,
  SERVICE_LIST_BY_DIRECTION_ID_UPDATE,
  SERVICE_REMOVE_FAIL,
  SERVICE_REMOVE_REQUEST,
  SERVICE_REMOVE_RESET,
  SERVICE_REMOVE_SUCCESS,
  SERVICE_UPDATE_FAIL,
  SERVICE_UPDATE_REQUEST,
  SERVICE_UPDATE_RESET,
  SERVICE_UPDATE_SUCCESS,
  SERVICE_LIST_FAIL,
  SERVICE_LIST_REQUEST,
  SERVICE_LIST_RESET,
  SERVICE_LIST_SUCCESS,
  SERVICE_BY_ID_FAIL,
  SERVICE_BY_ID_REQUEST,
  SERVICE_BY_ID_RESET,
  SERVICE_BY_ID_SUCCESS,
} from "./serviceTypes";

import axios from "axios";

export const fetchServices = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/services", config);
      dispatch({ type: SERVICE_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchServices = () => {
  return { type: SERVICE_LIST_RESET };
};

export const fetchServicesByDirectionID = (directionID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_LIST_BY_DIRECTION_ID_REQUEST });
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
        `/api/services/direction/${directionID}`,
        config
      );
      dispatch({
        type: SERVICE_LIST_BY_DIRECTION_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_LIST_BY_DIRECTION_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchServicesByDirectionID = () => {
  return { type: SERVICE_LIST_BY_DIRECTION_ID_RESET };
};

export const createService = (service) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post("/api/services", service, config);

      dispatch({ type: SERVICE_CREATE_SUCCESS, payload: data });
      dispatch({ type: SERVICE_LIST_BY_DIRECTION_ID_ADD, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateService = () => {
  return { type: SERVICE_CREATE_RESET };
};

export const removeService = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/services/${id}`, config);

      dispatch({ type: SERVICE_REMOVE_SUCCESS, payload: data });
      dispatch({
        type: SERVICE_LIST_BY_DIRECTION_ID_REMOVE,
        payload: id,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_REMOVE_FAIL, payload: err });
    }
  };
};

export const resetRemoveService = () => {
  return { type: SERVICE_REMOVE_RESET };
};

export const updateService = (id, service) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_UPDATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put(`/api/services/${id}`, service, config);

      dispatch({ type: SERVICE_UPDATE_SUCCESS, payload: data });
      dispatch({
        type: SERVICE_LIST_BY_DIRECTION_ID_UPDATE,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateService = () => {
  return { type: SERVICE_UPDATE_RESET };
};

export const fetchServiceByID = (serviceID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SERVICE_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/services/${serviceID}`, config);
      dispatch({
        type: SERVICE_BY_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SERVICE_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchServiceByID = () => {
  return { type: SERVICE_BY_ID_RESET };
};

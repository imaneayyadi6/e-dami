import {
  OPTION_LIST_BY_SOUSCATEGORIE_ID_FAIL,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_REQUEST,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_RESET,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_SUCCESS,
  OPTION_LIST_FAIL,
  OPTION_LIST_REQUEST,
  OPTION_LIST_RESET,
  OPTION_LIST_SUCCESS,
  OPTION_CREATE_FAIL,
  OPTION_CREATE_REQUEST,
  OPTION_CREATE_RESET,
  OPTION_CREATE_SUCCESS,
  OPTION_BY_ID_FAIL,
  OPTION_BY_ID_REQUEST,
  OPTION_BY_ID_RESET,
  OPTION_BY_ID_SUCCESS,
  OPTION_DELETE_FAIL,
  OPTION_DELETE_REQUEST,
  OPTION_DELETE_RESET,
  OPTION_DELETE_SUCCESS,
  OPTION_LIST_REMOVE,
  OPTION_UPDATE_FAIL,
  OPTION_UPDATE_REQUEST,
  OPTION_UPDATE_RESET,
  OPTION_UPDATE_SUCCESS,
  OPTION_CRTOP_LIST_FAIL,
  OPTION_CRTOP_LIST_REMOVE,
  OPTION_CRTOP_LIST_REQUEST,
  OPTION_CRTOP_LIST_RESET,
  OPTION_CRTOP_LIST_SUCCESS,
  OPTION_CRTOP_CREATE_FAIL,
  OPTION_CRTOP_CREATE_REQUEST,
  OPTION_CRTOP_CREATE_RESET,
  OPTION_CRTOP_CREATE_SUCCESS,
  OPTION_CRTOP_DELETE_FAIL,
  OPTION_CRTOP_DELETE_REQUEST,
  OPTION_CRTOP_DELETE_RESET,
  OPTION_CRTOP_DELETE_SUCCESS,
  OPTION_CRTOP_UPDATE_FAIL,
  OPTION_CRTOP_UPDATE_REQUEST,
  OPTION_CRTOP_UPDATE_RESET,
  OPTION_CRTOP_UPDATE_SUCCESS,
} from "./optionTypes";

import axios from "axios";

export const fetchOptionsBySousCategorieID = (query) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_LIST_BY_SOUSCATEGORIE_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      let objFilter = Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      console.log(objFilter);

      const { data } = await axios.get(
        `/api/options/souscategorie?${objFilter}`,
        config
      );

      dispatch({
        type: OPTION_LIST_BY_SOUSCATEGORIE_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_LIST_BY_SOUSCATEGORIE_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchOptionBySousCategorieID = () => {
  return { type: OPTION_LIST_BY_SOUSCATEGORIE_ID_RESET };
};

export const fetchOptionByID = (optionID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/options/${optionID}`, config);
      dispatch({
        type: OPTION_BY_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchOptionByID = () => {
  return { type: OPTION_BY_ID_RESET };
};

export const fetchOptions = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/options`, config);
      dispatch({
        type: OPTION_LIST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchOptions = () => {
  return { type: OPTION_LIST_RESET };
};

export const createOption = (option) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(`/api/options`, option, config);
      dispatch({
        type: OPTION_CREATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateOption = () => {
  return { type: OPTION_CREATE_RESET };
};

export const deleteOption = (optionID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_DELETE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/options/${optionID}`, config);
      dispatch({
        type: OPTION_DELETE_SUCCESS,
        payload: data,
      });
      dispatch({ type: OPTION_LIST_REMOVE, payload: optionID });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_DELETE_FAIL, payload: err });
    }
  };
};

export const resetDeleteOption = () => {
  return { type: OPTION_DELETE_RESET };
};

export const updateOption = (optionID, option) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_UPDATE_REQUEST });
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
        `/api/options/${optionID}`,
        option,
        config
      );
      dispatch({
        type: OPTION_UPDATE_SUCCESS,
        payload: data,
      });
      dispatch({ type: OPTION_LIST_REMOVE, payload: optionID });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateOption = () => {
  return { type: OPTION_UPDATE_RESET };
};

export const fetchOptionsCrtOp = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_CRTOP_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/options/crtop`, config);
      dispatch({
        type: OPTION_CRTOP_LIST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_CRTOP_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchOptionsCrtOp = () => {
  return { type: OPTION_CRTOP_LIST_RESET };
};

export const createOptionCrtOp = (option) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_CRTOP_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(`/api/options/crtop`, option, config);
      dispatch({
        type: OPTION_CRTOP_CREATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_CRTOP_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateOptionCrtOp = () => {
  return { type: OPTION_CRTOP_CREATE_RESET };
};

export const deleteOptionCrtOp = (optionID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_CRTOP_DELETE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(
        `/api/options/crtop/${optionID}`,
        config
      );
      dispatch({
        type: OPTION_CRTOP_DELETE_SUCCESS,
        payload: data,
      });
      dispatch({ type: OPTION_CRTOP_LIST_REMOVE, payload: optionID });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_CRTOP_DELETE_FAIL, payload: err });
    }
  };
};

export const resetDeleteOptionCrtOp = () => {
  return { type: OPTION_CRTOP_DELETE_RESET };
};

export const updateOptionCrtOp = (optionID, option) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: OPTION_CRTOP_UPDATE_REQUEST });
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
        `/api/options/crtop/${optionID}`,
        option,
        config
      );
      dispatch({
        type: OPTION_CRTOP_UPDATE_SUCCESS,
        payload: data,
      });
      dispatch({ type: OPTION_CRTOP_LIST_REMOVE, payload: optionID });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: OPTION_CRTOP_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateOptionCrtOp = () => {
  return { type: OPTION_CRTOP_UPDATE_RESET };
};

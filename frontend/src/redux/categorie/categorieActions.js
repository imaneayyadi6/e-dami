import {
  CATEGORIE_CREATE_REQUEST,
  CATEGORIE_CREATE_SUCCESS,
  CATEGORIE_CREATE_FAIL,
  CATEGORIE_CREATE_RESET,
  CATEGORIE_LIST_FAIL,
  CATEGORIE_LIST_REQUEST,
  CATEGORIE_LIST_RESET,
  CATEGORIE_LIST_SUCCESS,
  CATEGORIE_REMOVE_REQUEST,
  CATEGORIE_REMOVE_SUCCESS,
  CATEGORIE_REMOVE_FAIL,
  CATEGORIE_REMOVE_RESET,
  CATEGORIE_UPDATE_FAIL,
  CATEGORIE_UPDATE_REQUEST,
  CATEGORIE_UPDATE_RESET,
  CATEGORIE_UPDATE_SUCCESS,
  CATEGORIE_LIST_ADD,
  CATEGORIE_LIST_REMOVE,
  CATEGORIE_LIST_UPDATE,
} from "./categorieTypes";

import axios from "axios";

export const fetchCategories = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CATEGORIE_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/categories", config);
      dispatch({ type: CATEGORIE_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CATEGORIE_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchCategories = () => {
  return { type: CATEGORIE_LIST_RESET };
};

export const createCategorie = categorie => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CATEGORIE_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post("/api/categories", categorie, config);

      dispatch({ type: CATEGORIE_CREATE_SUCCESS, payload: data });
      dispatch({ type: CATEGORIE_LIST_ADD, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CATEGORIE_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateCategorie = () => {
  return { type: CATEGORIE_CREATE_RESET };
};

export const removeCategorie = id => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CATEGORIE_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/categories/${id}`, config);

      dispatch({ type: CATEGORIE_REMOVE_SUCCESS, payload: data });
      dispatch({ type: CATEGORIE_LIST_REMOVE, payload: id });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CATEGORIE_REMOVE_FAIL, payload: err });
    }
  };
};

export const resetRemoveCategorie = () => {
  return { type: CATEGORIE_REMOVE_RESET };
};


export const softDeleteCategorie = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CATEGORIE_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.patch(`/api/categories/${id}`, { isDeleted: true }, config);
      
      dispatch({ type: CATEGORIE_REMOVE_SUCCESS, payload: data });
      dispatch({ type: CATEGORIE_LIST_UPDATE, payload: data });
    } catch (error) {
      
      if (error.response && (error.response.status === 404 || error.response.status === 405)) {
        try {
          const {
            userLogin: { userInfo },
          } = getState();
          const config = {
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.delete(`/api/categories/${id}`, config);
          dispatch({ type: CATEGORIE_REMOVE_SUCCESS, payload: data });
          dispatch({ type: CATEGORIE_LIST_REMOVE, payload: id });
        } catch (err2) {
          const finalErr = err2.response && err2.response.data.message ? err2.response.data.message : err2.message;
          dispatch({ type: CATEGORIE_REMOVE_FAIL, payload: finalErr });
        }
      } else {
        const err = error.response && error.response.data.message ? error.response.data.message : error.message;
        dispatch({ type: CATEGORIE_REMOVE_FAIL, payload: err });
      }
    }
  };
};


export const restoreCategorie = (id) => {
  return async (dispatch, getState) => {
    try {
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.patch(`/api/categories/${id}`, { isDeleted: false }, config);
      dispatch({ type: CATEGORIE_LIST_UPDATE, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      
      dispatch({ type: CATEGORIE_UPDATE_FAIL, payload: err });
    }
  };
};

export const updateCategorie = (id, categorie) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CATEGORIE_UPDATE_REQUEST });
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
        `/api/categories/${id}`,
        categorie,
        config
      );

      dispatch({ type: CATEGORIE_UPDATE_SUCCESS, payload: data });
      dispatch({ type: CATEGORIE_LIST_UPDATE, payload: data });

    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CATEGORIE_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateCategorie = () => {
  return { type: CATEGORIE_UPDATE_RESET };
};

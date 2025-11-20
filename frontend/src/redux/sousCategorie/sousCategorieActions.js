import {
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_FAIL,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REQUEST,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_RESET,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_SUCCESS,
  SOUSCATEGORIE_CREATE_FAIL,
  SOUSCATEGORIE_CREATE_REQUEST,
  SOUSCATEGORIE_CREATE_RESET,
  SOUSCATEGORIE_CREATE_SUCCESS,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_ADD,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REMOVE,
  SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_UPDATE,
  SOUSCATEGORIE_REMOVE_FAIL,
  SOUSCATEGORIE_REMOVE_REQUEST,
  SOUSCATEGORIE_REMOVE_RESET,
  SOUSCATEGORIE_REMOVE_SUCCESS,
  SOUSCATEGORIE_UPDATE_FAIL,
  SOUSCATEGORIE_UPDATE_REQUEST,
  SOUSCATEGORIE_UPDATE_RESET,
  SOUSCATEGORIE_UPDATE_SUCCESS,
  SOUSCATEGORIE_LIST_FAIL,
  SOUSCATEGORIE_LIST_REQUEST,
  SOUSCATEGORIE_LIST_RESET,
  SOUSCATEGORIE_LIST_SUCCESS,
} from "./sousCategorieTypes";

import axios from "axios";

export const fetchSousCategories = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/souscategories", config);
      dispatch({ type: SOUSCATEGORIE_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchSousCategories = () => {
  return { type: SOUSCATEGORIE_LIST_RESET };
};

export const fetchSousCategoriesByCategorieID = (categorieID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REQUEST });
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
        `/api/souscategories/categorie/${categorieID}`,
        config
      );
      dispatch({
        type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchSousCategoriesByCategorieID = () => {
  return { type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_RESET };
};

export const createSousCategorie = (sousCategorie) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_CREATE_REQUEST });
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
        "/api/souscategories",
        sousCategorie,
        config
      );

      dispatch({ type: SOUSCATEGORIE_CREATE_SUCCESS, payload: data });
      dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_ADD, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateSousCategorie = () => {
  return { type: SOUSCATEGORIE_CREATE_RESET };
};

export const removeSousCategorie = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/souscategories/${id}`, config);

      dispatch({ type: SOUSCATEGORIE_REMOVE_SUCCESS, payload: data });
      dispatch({
        type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REMOVE,
        payload: id,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_REMOVE_FAIL, payload: err });
    }
  };
};

export const resetRemoveSousCategorie = () => {
  return { type: SOUSCATEGORIE_REMOVE_RESET };
};


export const softDeleteSousCategorie = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.patch(`/api/souscategories/${id}`, { isDeleted: true }, config);
      dispatch({ type: SOUSCATEGORIE_REMOVE_SUCCESS, payload: data });
      dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_UPDATE, payload: data });
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
          const { data } = await axios.delete(`/api/souscategories/${id}`, config);
          dispatch({ type: SOUSCATEGORIE_REMOVE_SUCCESS, payload: data });
          dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REMOVE, payload: id });
        } catch (err2) {
          const finalErr = err2.response && err2.response.data.message ? err2.response.data.message : err2.message;
          dispatch({ type: SOUSCATEGORIE_REMOVE_FAIL, payload: finalErr });
        }
      } else {
        const err = error.response && error.response.data.message ? error.response.data.message : error.message;
        dispatch({ type: SOUSCATEGORIE_REMOVE_FAIL, payload: err });
      }
    }
  };
};


export const restoreSousCategorie = (id) => {
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
      const { data } = await axios.patch(`/api/souscategories/${id}`, { isDeleted: false }, config);
      dispatch({ type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_UPDATE, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_UPDATE_FAIL, payload: err });
    }
  };
};

export const updateSousCategorie = (id, sousCategorie) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SOUSCATEGORIE_UPDATE_REQUEST });
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
        `/api/souscategories/${id}`,
        sousCategorie,
        config
      );

      dispatch({ type: SOUSCATEGORIE_UPDATE_SUCCESS, payload: data });
      dispatch({
        type: SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_UPDATE,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: SOUSCATEGORIE_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateSousCategorie = () => {
  return { type: SOUSCATEGORIE_UPDATE_RESET };
};

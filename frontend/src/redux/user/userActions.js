import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_DIRECTEUR_LIST_FAIL,
  USER_DIRECTEUR_LIST_REQUEST,
  USER_DIRECTEUR_LIST_RESET,
  USER_DIRECTEUR_LIST_SUCCESS,
  USER_CHEFSERVICE_LIST_FAIL,
  USER_CHEFSERVICE_LIST_REQUEST,
  USER_CHEFSERVICE_LIST_RESET,
  USER_CHEFSERVICE_LIST_SUCCESS,
  USER_CREATE_REQUEST,
  USER_CREATE_SUCCESS,
  USER_CREATE_FAIL,
  USER_CREATE_RESET,
  USER_LIST_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_RESET,
  USER_LIST_SUCCESS,
  USER_REMOVE_REQUEST,
  USER_REMOVE_SUCCESS,
  USER_REMOVE_FAIL,
  USER_REMOVE_RESET,
  USER_UPDATE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_RESET,
  USER_UPDATE_SUCCESS,
  USER_LIST_ADD,
  USER_LIST_REMOVE,
  USER_LIST_UPDATE,
  USER_BY_ID_FAIL,
  USER_BY_ID_REQUEST,
  USER_BY_ID_RESET,
  USER_BY_ID_SUCCESS,
  USER_GET_ACCOUNT_REQUEST,
  USER_GET_ACCOUNT_SUCCESS,
  USER_GET_ACCOUNT_FAIL,
  USER_GET_ACCOUNT_RESET,
  USER_UPDATE_PASSWORD_FAIL,
  USER_UPDATE_PASSWORD_REQUEST,
  USER_UPDATE_PASSWORD_RESET,
  USER_UPDATE_PASSWORD_SUCCESS,
  USER_VALIDATE_TOKEN_REQUEST,
  USER_VALIDATE_TOKEN_SUCCESS,
  USER_VALIDATE_TOKEN_FAIL,
  USER_SET_PASSWORD_REQUEST,
  USER_SET_PASSWORD_SUCCESS,
  USER_SET_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_REQUEST,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_RESET,
  USER_SET_NEW_PASSWORD_REQUEST,
  USER_SET_NEW_PASSWORD_SUCCESS,
  USER_SET_NEW_PASSWORD_FAIL,
  USER_SET_NEW_PASSWORD_RESET,
  USER_BY_ID_DELETE,
  USER_BY_DIVISION_FAIL,
  USER_BY_DIVISION_REQUEST,
  USER_BY_DIVISION_RESET,
  USER_BY_DIVISION_SUCCESS,
  USER_PUT_INTERIM_FAIL,
  USER_PUT_INTERIM_REQUEST,
  USER_PUT_INTERIM_RESET,
  USER_PUT_INTERIM_SUCCESS,
  USER_DELETE_INTERIM_FAIL,
  USER_DELETE_INTERIM_REQUEST,
  USER_DELETE_INTERIM_RESET,
  USER_DELETE_INTERIM_SUCCESS,
  USER_GET_INTERIM_FAIL,
  USER_GET_INTERIM_REQUEST,
  USER_GET_INTERIM_RESET,
  USER_GET_INTERIM_SUCCESS,
} from "./userTypes";

import axios from "axios";

export const login = (email, password, language = 'fr') => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_LOGIN_REQUEST });
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      
      
      const isNumeric = !isNaN(parseFloat(email)) && isFinite(email);
      const loginData = isNumeric 
        ? { matricule: parseInt(email), password }
        : { email, password };
      
      const { data } = await axios.post(
        "/api/utilisateurs/login",
        loginData,
        config
      );
      
      
      const userDataWithLanguage = {
        ...data,
        preferredLanguage: language
      };
      
      dispatch({ type: USER_LOGIN_SUCCESS, payload: userDataWithLanguage });

      console.log(userDataWithLanguage);

      
      localStorage.setItem("userInfo", JSON.stringify(userDataWithLanguage));
      
      
      localStorage.setItem("userLanguage", language);
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_LOGIN_FAIL, payload: err });
    }
  };
};

export const validateToken = (token) => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_VALIDATE_TOKEN_REQUEST });
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/utilisateurs/validatetoken",
        { token },
        config
      );
      dispatch({ type: USER_VALIDATE_TOKEN_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_VALIDATE_TOKEN_FAIL, payload: err });
    }
  };
};

export const getAccount = (matricule) => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_GET_ACCOUNT_REQUEST });
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/utilisateurs/register",
        { matricule },
        config
      );
      dispatch({ type: USER_GET_ACCOUNT_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_GET_ACCOUNT_FAIL, payload: err });
    }
  };
};

export const resetGetAccount = () => {
  return { type: USER_GET_ACCOUNT_RESET };
};

export const setPasswordUser = (password, token) => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_SET_PASSWORD_REQUEST });

      const config = {
        headers: { "Content-Type": "application/json" },
        
      };

      const { data } = await axios.post(
        "/api/utilisateurs/setpassword",
        { password: password, token: token },
        config
      );

      dispatch({ type: USER_SET_PASSWORD_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_SET_PASSWORD_FAIL, payload: err });
    }
  };
};

export const changePassword = (matricule) => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_CHANGE_PASSWORD_REQUEST });
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/utilisateurs/changepassword",
        { matricule },
        config
      );
      dispatch({ type: USER_CHANGE_PASSWORD_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_CHANGE_PASSWORD_FAIL, payload: err });
    }
  };
};

export const resetChangePassword = () => {
  return { type: USER_CHANGE_PASSWORD_RESET };
};

export const setNewPasswordUser = (password, token) => {
  return async (dispatch) => {
    try {
      dispatch({ type: USER_SET_NEW_PASSWORD_REQUEST });

      const config = {
        headers: { "Content-Type": "application/json" },
        
      };

      const { data } = await axios.post(
        "/api/utilisateurs/new/setpassword",
        { password: password, token: token },
        config
      );

      dispatch({ type: USER_SET_NEW_PASSWORD_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({ type: USER_SET_NEW_PASSWORD_FAIL, payload: err });
    }
  };
};

export const resetNewChangePassword = () => {
  return { type: USER_SET_NEW_PASSWORD_RESET };
};

export const logout = () => {
  return (dispatch, getState) => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userLanguage");
    dispatch({ type: USER_LOGOUT });
  };
};

export const fetchDirecteursUsers = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_DIRECTEUR_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/utilisateurs/directeurs/", config);
      dispatch({ type: USER_DIRECTEUR_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_DIRECTEUR_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchDirecteursUsers = () => {
  return { type: USER_DIRECTEUR_LIST_RESET };
};

export const fetchChefServicesUsers = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_CHEFSERVICE_LIST_REQUEST });
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
        "/api/utilisateurs/chefdeservices",
        config
      );
      dispatch({
        type: USER_CHEFSERVICE_LIST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_CHEFSERVICE_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchChefServicesUsers = () => {
  return { type: USER_CHEFSERVICE_LIST_RESET };
};

export const fetchUsers = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/utilisateurs", config);
      dispatch({ type: USER_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_LIST_FAIL, payload: err });
    }
  };
};

export const resetFetchUsers = () => {
  return { type: USER_LIST_RESET };
};

export const createUser = (User) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post("/api/utilisateurs", User, config);

      dispatch({ type: USER_CREATE_SUCCESS, payload: data });
      dispatch({ type: USER_LIST_ADD, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateUser = () => {
  return { type: USER_CREATE_RESET };
};

export const removeUser = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_REMOVE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/utilisateurs/${id}`, config);

      dispatch({ type: USER_REMOVE_SUCCESS, payload: data });
      dispatch({ type: USER_LIST_REMOVE, payload: id });
      dispatch({ type: USER_BY_ID_DELETE, payload: id });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_REMOVE_FAIL, payload: err });
    }
  };
};

export const resetRemoveUser = () => {
  return { type: USER_REMOVE_RESET };
};

export const updateUser = (id, User) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_UPDATE_REQUEST });
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
        `/api/utilisateurs/infos/${id}`,
        User,
        config
      );

      dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
      dispatch({ type: USER_LIST_UPDATE, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateUser = () => {
  return { type: USER_UPDATE_RESET };
};

export const updateUserPassword = (id, password) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_UPDATE_PASSWORD_REQUEST });
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
        `/api/utilisateurs/password/${id}`,
        { password },
        config
      );

      dispatch({ type: USER_UPDATE_PASSWORD_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_UPDATE_PASSWORD_FAIL, payload: err });
    }
  };
};

export const resetUpdateUserPassword = () => {
  return { type: USER_UPDATE_PASSWORD_RESET };
};

export const fetchUserByID = (userID) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/utilisateurs/${userID}`, config);
      dispatch({
        type: USER_BY_ID_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetFetchUserByID = () => {
  return { type: USER_BY_ID_RESET };
};

export const fetchUsersByDivision = (type, id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_BY_DIVISION_REQUEST });
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
        `/api/utilisateurs/${type}/division/${id}`,
        config
      );

      dispatch({
        type: USER_BY_DIVISION_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_BY_DIVISION_FAIL, payload: err });
    }
  };
};

export const resetFetchUsersByDivision = () => {
  return { type: USER_BY_DIVISION_RESET };
};

export const getUserIntrim = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_GET_INTERIM_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/utilisateurs/interim`, config);

      dispatch({
        type: USER_GET_INTERIM_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_GET_INTERIM_FAIL, payload: err });
    }
  };
};

export const resetGetUserIntrim = () => {
  return { type: USER_GET_INTERIM_RESET };
};

export const putUserIntrim = (matricule) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_PUT_INTERIM_REQUEST });
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
        `/api/utilisateurs/interim/${matricule}`,
        {},
        config
      );

      dispatch({
        type: USER_PUT_INTERIM_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_PUT_INTERIM_FAIL, payload: err });
    }
  };
};

export const resetPutUserIntrim = () => {
  return { type: USER_PUT_INTERIM_RESET };
};

export const deleteUserIntrim = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_DELETE_INTERIM_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/utilisateurs/interim`, config);

      dispatch({
        type: USER_DELETE_INTERIM_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_DELETE_INTERIM_FAIL, payload: err });
    }
  };
};

export const resetDeleteUserIntrim = () => {
  return { type: USER_DELETE_INTERIM_RESET };
};


export const putUserIntrimForAdmin = (userId, matricule) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_PUT_INTERIM_REQUEST });
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
        `/api/utilisateurs/${userId}/interim/${matricule}`,
        {},
        config
      );

      dispatch({
        type: USER_PUT_INTERIM_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_PUT_INTERIM_FAIL, payload: err });
    }
  };
};

export const deleteUserIntrimForAdmin = (userId) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: USER_DELETE_INTERIM_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.delete(`/api/utilisateurs/${userId}/interim`, config);

      dispatch({
        type: USER_DELETE_INTERIM_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: USER_DELETE_INTERIM_FAIL, payload: err });
    }
  };
};

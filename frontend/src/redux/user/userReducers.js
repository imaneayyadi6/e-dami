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
  USER_LIST_ADD,
  USER_LIST_REMOVE,
  USER_REMOVE_REQUEST,
  USER_REMOVE_FAIL,
  USER_REMOVE_RESET,
  USER_REMOVE_SUCCESS,
  USER_LIST_UPDATE,
  USER_UPDATE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_RESET,
  USER_UPDATE_SUCCESS,
  USER_BY_ID_FAIL,
  USER_BY_ID_REQUEST,
  USER_BY_ID_RESET,
  USER_BY_ID_SUCCESS,
  USER_BY_ID_DELETE,
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
  USER_BY_DIVISION_FAIL,
  USER_BY_DIVISION_REQUEST,
  USER_BY_DIVISION_RESET,
  USER_BY_DIVISION_SUCCESS,
} from "./userTypes";

export const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true };
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export const userValidateTokenReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_VALIDATE_TOKEN_REQUEST:
      return { loading: true };
    case USER_VALIDATE_TOKEN_SUCCESS:
      return { loading: false, success: true, result: action.payload };
    case USER_VALIDATE_TOKEN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export const userGetAccountReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_GET_ACCOUNT_REQUEST:
      return { loading: true };
    case USER_GET_ACCOUNT_SUCCESS:
      return { loading: false, success: true, result: action.payload };
    case USER_GET_ACCOUNT_FAIL:
      return { loading: false, error: action.payload };
    case USER_GET_ACCOUNT_RESET:
      return {};
    default:
      return state;
  }
};

export const userSetPasswordTokenReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_SET_PASSWORD_REQUEST:
      return { loading: true };
    case USER_SET_PASSWORD_SUCCESS:
      return { loading: false, success: true, result: action.payload };
    case USER_SET_PASSWORD_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export const userChangePasswordReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_CHANGE_PASSWORD_REQUEST:
      return { loading: true };
    case USER_CHANGE_PASSWORD_SUCCESS:
      return { loading: false, success: true, result: action.payload };
    case USER_CHANGE_PASSWORD_FAIL:
      return { loading: false, error: action.payload };
    case USER_CHANGE_PASSWORD_RESET:
      return {};
    default:
      return state;
  }
};

export const userSetNewPasswordReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_SET_NEW_PASSWORD_REQUEST:
      return { loading: true };
    case USER_SET_NEW_PASSWORD_SUCCESS:
      return { loading: false, success: true, result: action.payload };
    case USER_SET_NEW_PASSWORD_FAIL:
      return { loading: false, error: action.payload };
    case USER_SET_NEW_PASSWORD_RESET:
      return {};
    default:
      return state;
  }
};

export const userDirecteursListReducer = (
  state = { utilisateurs: [] },
  action
) => {
  switch (action.type) {
    case USER_DIRECTEUR_LIST_REQUEST:
      return { loading: true, utilisateurs: [] };
    case USER_DIRECTEUR_LIST_SUCCESS:
      return { loading: false, utilisateurs: action.payload };
    case USER_DIRECTEUR_LIST_FAIL:
      return { loading: false, error: action.payload, utilisateurs: [] };
    case USER_DIRECTEUR_LIST_RESET:
      return { utilisateurs: [] };
    default:
      return state;
  }
};

export const userChefServiceListReducer = (
  state = { utilisateurs: [] },
  action
) => {
  switch (action.type) {
    case USER_CHEFSERVICE_LIST_REQUEST:
      return { loading: true, utilisateurs: [] };
    case USER_CHEFSERVICE_LIST_SUCCESS:
      return { loading: false, utilisateurs: action.payload };
    case USER_CHEFSERVICE_LIST_FAIL:
      return { loading: false, error: action.payload, utilisateurs: [] };
    case USER_CHEFSERVICE_LIST_RESET:
      return { utilisateurs: [] };
    default:
      return state;
  }
};

export const userListReducer = (state = { users: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_LIST_REQUEST:
      return { loading: true, users: [] };
    case USER_LIST_SUCCESS:
      return {
        success: true,
        users: payload,
      };
    case USER_LIST_ADD:
      return {
        success: true,
        users: [payload, ...state.users],
      };
    case USER_LIST_REMOVE:
      return {
        success: true,
        users: state.users.map((user) => {
          if (String(user._id) === String(payload)) {
            if (user.isActive) user.isActive = false;
            else user.isActive = true;
          }
          return user;
        }),
      };
    case USER_LIST_UPDATE:
      return {
        success: true,
        users: state.users.map((user) => {
          if (String(user._id) === String(payload._id)) {
            user.libelle = payload.libelle;
            user.direction = payload.direction;
          }
          return user;
        }),
      };
    case USER_LIST_FAIL:
      return { loading: false, error: payload, users: [], success: true };
    case USER_LIST_RESET:
      return { users: [] };
    default:
      return state;
  }
};

export const userCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_CREATE_REQUEST:
      return { loading: true };
    case USER_CREATE_SUCCESS:
      return { loading: false, success: true, user: payload };
    case USER_CREATE_FAIL:
      return { loading: false, error: payload };
    case USER_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const userRemoveReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_REMOVE_REQUEST:
      return { loading: true };
    case USER_REMOVE_SUCCESS:
      return { loading: false, success: true, message: payload };
    case USER_REMOVE_FAIL:
      return { loading: false, error: payload };
    case USER_REMOVE_RESET:
      return {};
    default:
      return state;
  }
};

export const userUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_UPDATE_REQUEST:
      return { loading: true };
    case USER_UPDATE_SUCCESS:
      return { loading: false, success: true, user: payload };
    case USER_UPDATE_FAIL:
      return { loading: false, error: payload };
    case USER_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const userUpdatePasswordReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_UPDATE_PASSWORD_REQUEST:
      return { loading: true };
    case USER_UPDATE_PASSWORD_SUCCESS:
      return { loading: false, success: true, user: payload };
    case USER_UPDATE_PASSWORD_FAIL:
      return { loading: false, error: payload };
    case USER_UPDATE_PASSWORD_RESET:
      return {};
    default:
      return state;
  }
};

export const userByIDReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_BY_ID_REQUEST:
      return { loading: true };
    case USER_BY_ID_SUCCESS:
      return {
        loading: false,
        success: true,
        user: payload,
      };
    case USER_BY_ID_DELETE:
      return {
        loading: false,
        success: true,
        user: { ...state.user, isActive: state.user.isActive ? false : true },
      };

    case USER_BY_ID_FAIL:
      return { loading: false, error: payload };
    case USER_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

export const userByDivisionReducer = (state = { users: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_BY_DIVISION_REQUEST:
      return { loading: true, users: [] };
    case USER_BY_DIVISION_SUCCESS:
      return {
        loading: false,
        success: true,
        users: payload,
      };
    case USER_BY_DIVISION_FAIL:
      return { loading: false, error: payload, users: [] };
    case USER_BY_DIVISION_RESET:
      return { users: [] };
    default:
      return state;
  }
};

import {
  CATEGORIE_CREATE_REQUEST,
  CATEGORIE_CREATE_SUCCESS,
  CATEGORIE_CREATE_FAIL,
  CATEGORIE_CREATE_RESET,
  CATEGORIE_LIST_FAIL,
  CATEGORIE_LIST_REQUEST,
  CATEGORIE_LIST_RESET,
  CATEGORIE_LIST_SUCCESS,
  CATEGORIE_LIST_ADD,
  CATEGORIE_LIST_REMOVE,
  CATEGORIE_REMOVE_REQUEST,
  CATEGORIE_REMOVE_FAIL,
  CATEGORIE_REMOVE_RESET,
  CATEGORIE_REMOVE_SUCCESS,
  CATEGORIE_LIST_UPDATE,
  CATEGORIE_UPDATE_FAIL,
  CATEGORIE_UPDATE_REQUEST,
  CATEGORIE_UPDATE_RESET,
  CATEGORIE_UPDATE_SUCCESS,
} from "./categorieTypes";

export const categorieListReducer = (state = { categories: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case CATEGORIE_LIST_REQUEST:
      return { loading: true, categories: [] };
    case CATEGORIE_LIST_SUCCESS:
      return {
        success: true,
        categories: payload,
      };
    case CATEGORIE_LIST_ADD:
      return {
        success: true,
        categories: [payload, ...state.categories],
      };
    case CATEGORIE_LIST_REMOVE:
      return {
        success: true,
        categories: state.categories.filter(
          (cat) => String(cat._id) !== String(payload)
        ),
      };
    case CATEGORIE_LIST_UPDATE:
      return {
        success: true,
        categories: state.categories.map((categorie) => {
          if (String(categorie._id) === String(payload._id)) {
            categorie.libelle = payload.libelle;
            categorie.direction = payload.direction;
          }
          return categorie;
        }),
      };
    case CATEGORIE_LIST_FAIL:
      return { loading: false, error: payload, categories: [], success: true };
    case CATEGORIE_LIST_RESET:
      return { categories: [] };
    default:
      return state;
  }
};

export const categorieCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CATEGORIE_CREATE_REQUEST:
      return { loading: true };
    case CATEGORIE_CREATE_SUCCESS:
      return { loading: false, success: true, categorie: payload };
    case CATEGORIE_CREATE_FAIL:
      return { loading: false, error: payload };
    case CATEGORIE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const categorieRemoveReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CATEGORIE_REMOVE_REQUEST:
      return { loading: true };
    case CATEGORIE_REMOVE_SUCCESS:
      return { loading: false, success: true, message: payload };
    case CATEGORIE_REMOVE_FAIL:
      return { loading: false, error: payload };
    case CATEGORIE_REMOVE_RESET:
      return {};
    default:
      return state;
  }
};

export const categorieUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CATEGORIE_UPDATE_REQUEST:
      return { loading: true };
    case CATEGORIE_UPDATE_SUCCESS:
      return { loading: false, success: true, categorie: payload };
    case CATEGORIE_UPDATE_FAIL:
      return { loading: false, error: payload };
    case CATEGORIE_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

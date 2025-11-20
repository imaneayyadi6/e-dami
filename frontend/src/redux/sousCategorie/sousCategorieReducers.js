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
  SOUSCATEGORIE_LIST_REQUEST,
  SOUSCATEGORIE_LIST_SUCCESS,
  SOUSCATEGORIE_LIST_FAIL,
  SOUSCATEGORIE_LIST_RESET,
} from "./sousCategorieTypes";

export const sousCategorieListReducer = (
  state = { souscategories: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case SOUSCATEGORIE_LIST_REQUEST:
      return { loading: true, souscategories: [] };
    case SOUSCATEGORIE_LIST_SUCCESS:
      return {
        success: true,
        souscategories: payload,
      };
    case SOUSCATEGORIE_LIST_FAIL:
      return {
        loading: false,
        error: payload,
        souscategories: [],
        success: true,
      };
    case SOUSCATEGORIE_LIST_RESET:
      return { souscategories: [] };
    default:
      return state;
  }
};

export const souscategorieListByCategorieIDReducer = (
  state = { souscategories: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REQUEST:
      return { loading: true, souscategories: [] };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_SUCCESS:
      return {
        success: true,
        souscategories: payload,
      };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_ADD:
      return {
        success: true,
        souscategories: [payload, ...state.souscategories],
      };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_REMOVE:
      return {
        success: true,
        souscategories: state.souscategories.filter(
          (cat) => String(cat._id) !== String(payload)
        ),
      };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_UPDATE:
      return {
        success: true,
        souscategories: state.souscategories.map((souscategorie) => {
          if (String(souscategorie._id) === String(payload._id)) {
            souscategorie.libelle = payload.libelle;
            
          }
          return souscategorie;
        }),
      };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_FAIL:
      return {
        loading: false,
        error: payload,
        souscategories: [],
        success: true,
      };
    case SOUSCATEGORIE_LIST_BY_CATEGORIE_ID_RESET:
      return { souscategories: [] };
    default:
      return state;
  }
};

export const sousCategorieCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SOUSCATEGORIE_CREATE_REQUEST:
      return { loading: true };
    case SOUSCATEGORIE_CREATE_SUCCESS:
      return { loading: false, success: true, sousCategorie: payload };
    case SOUSCATEGORIE_CREATE_FAIL:
      return { loading: false, error: payload };
    case SOUSCATEGORIE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const sousCategorieRemoveReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SOUSCATEGORIE_REMOVE_REQUEST:
      return { loading: true };
    case SOUSCATEGORIE_REMOVE_SUCCESS:
      return { loading: false, success: true, message: payload };
    case SOUSCATEGORIE_REMOVE_FAIL:
      return { loading: false, error: payload };
    case SOUSCATEGORIE_REMOVE_RESET:
      return {};
    default:
      return state;
  }
};

export const sousCategorieUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SOUSCATEGORIE_UPDATE_REQUEST:
      return { loading: true };
    case SOUSCATEGORIE_UPDATE_SUCCESS:
      return { loading: false, success: true, sousCategorie: payload };
    case SOUSCATEGORIE_UPDATE_FAIL:
      return { loading: false, error: payload };
    case SOUSCATEGORIE_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

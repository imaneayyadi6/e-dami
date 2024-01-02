import {
  OPTION_LIST_BY_SOUSCATEGORIE_ID_FAIL,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_REQUEST,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_RESET,
  OPTION_LIST_BY_SOUSCATEGORIE_ID_SUCCESS,
  OPTION_LIST_ADD,
  OPTION_LIST_FAIL,
  OPTION_LIST_REMOVE,
  OPTION_LIST_REQUEST,
  OPTION_LIST_RESET,
  OPTION_LIST_SUCCESS,
  OPTION_LIST_UPDATE,
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
  OPTION_UPDATE_FAIL,
  OPTION_UPDATE_REQUEST,
  OPTION_UPDATE_RESET,
  OPTION_UPDATE_SUCCESS,
} from "./optionTypes";

export const optionListReducer = (state = { options: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_LIST_REQUEST:
      return { loading: true, options: [] };
    case OPTION_LIST_SUCCESS:
      const savedLocalOptions = localStorage.getItem("options")
        ? JSON.parse(localStorage.getItem("options"))
        : [];

      savedLocalOptions.sort((a, b) => {
        const dateA = new Date(b.createdAt);
        const dateB = new Date(a.createdAt);

        if (dateA < dateB) {
          return -1;
        }
        if (dateA > dateB) {
          return 1;
        }
        return 0;
      });

      return {
        success: true,
        options: [...savedLocalOptions, ...payload],
      };
    case OPTION_LIST_ADD:
      return {
        success: true,
        options: [payload, ...state.options],
      };
    case OPTION_LIST_REMOVE:
      return {
        success: true,
        options: state.options.filter(op => String(op._id) !== String(payload)),
      };

    case OPTION_LIST_UPDATE:
      return {
        success: true,
        options: state.categories.map(op => {
          if (String(op._id) === String(payload._id)) {
            op.libelle = payload.libelle;
            op.typeProcessus = payload.typeProcessus;
            op.header = payload.header;
            op.proprietaireDeDonnees = payload.proprietaireDeDonnees;
            op.sousCategorie = payload.sousCategorie;
            op.service = payload.service;
          }
          return op;
        }),
      };

    case OPTION_LIST_FAIL:
      return { loading: false, error: payload, options: [], success: true };
    case OPTION_LIST_RESET:
      return { options: [] };
    default:
      return state;
  }
};

export const optionListBySousCategorieIDReducer = (
  state = {},
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_LIST_BY_SOUSCATEGORIE_ID_REQUEST:
      return { loading: true, };
    case OPTION_LIST_BY_SOUSCATEGORIE_ID_SUCCESS:
      return {
        loading: false,
        data: payload,
      };
    case OPTION_LIST_BY_SOUSCATEGORIE_ID_FAIL:
      return { loading: false, error: payload, };
    case OPTION_LIST_BY_SOUSCATEGORIE_ID_RESET:
      return {};
    default:
      return state;
  }
};

export const optionCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_CREATE_REQUEST:
      return { loading: true };
    case OPTION_CREATE_SUCCESS:
      return {
        loading: false,
        option: payload,
        success: true,
      };
    case OPTION_CREATE_FAIL:
      return { loading: false, error: payload };
    case OPTION_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const optionByIDReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_BY_ID_REQUEST:
      return { loading: true };
    case OPTION_BY_ID_SUCCESS:
      return {
        loading: false,
        success: true,
        option: payload,
      };
    case OPTION_BY_ID_FAIL:
      return { loading: false, error: payload };
    case OPTION_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

export const optionDeleteReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_DELETE_REQUEST:
      return { loading: true };
    case OPTION_DELETE_SUCCESS:
      return {
        loading: false,
        option: payload,
        success: true,
      };
    case OPTION_DELETE_FAIL:
      return { loading: false, error: payload };
    case OPTION_DELETE_RESET:
      return {};
    default:
      return state;
  }
};

export const optionUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case OPTION_UPDATE_REQUEST:
      return { loading: true };
    case OPTION_UPDATE_SUCCESS:
      return {
        loading: false,
        option: payload,
        success: true,
      };
    case OPTION_UPDATE_FAIL:
      return { loading: false, error: payload };
    case OPTION_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

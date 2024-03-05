import {
  CHART_USERS_FAIL,
  CHART_USERS_REQUEST,
  CHART_USERS_RESET,
  CHART_USERS_SUCCESS,
  CHART_OPTIONS_FAIL,
  CHART_OPTIONS_REQUEST,
  CHART_OPTIONS_RESET,
  CHART_OPTIONS_SUCCESS,
  CHART_OPTIONS_COUNT_SERVICES_FAIL,
  CHART_OPTIONS_COUNT_SERVICES_REQUEST,
  CHART_OPTIONS_COUNT_SERVICES_RESET,
  CHART_OPTIONS_COUNT_SERVICES_SUCCESS,
  CHART_OPTIONS_COUNT_SOUSCATEGORIE_FAIL,
  CHART_OPTIONS_COUNT_SOUSCATEGORIE_REQUEST,
  CHART_OPTIONS_COUNT_SOUSCATEGORIE_RESET,
  CHART_OPTIONS_COUNT_SOUSCATEGORIE_SUCCESS,
  CHART_DEMANDE_LINE_FAIL,
  CHART_DEMANDE_LINE_REQUEST,
  CHART_DEMANDE_LINE_RESET,
  CHART_DEMANDE_LINE_SUCCESS,
  CHART_DEMANDE_BAR_FAIL,
  CHART_DEMANDE_BAR_REQUEST,
  CHART_DEMANDE_BAR_RESET,
  CHART_DEMANDE_BAR_SUCCESS,
  CHART_DEMANDE_LINE_SIGNATAIRE_REQUEST,
  CHART_DEMANDE_LINE_SIGNATAIRE_SUCCESS,
  CHART_DEMANDE_LINE_SIGNATAIRE_FAIL,
  CHART_DEMANDE_LINE_SIGNATAIRE_RESET,
  CHART_DEMANDE_BAR_SIGNATAIRE_REQUEST,
  CHART_DEMANDE_BAR_SIGNATAIRE_SUCCESS,
  CHART_DEMANDE_BAR_SIGNATAIRE_FAIL,
  CHART_DEMANDE_BAR_SIGNATAIRE_RESET,
} from "./chartTypes";

export const chartGetUsersReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_USERS_REQUEST:
      return { loading: true };
    case CHART_USERS_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_USERS_FAIL:
      return { loading: false, error: payload };
    case CHART_USERS_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetOptionsReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_OPTIONS_REQUEST:
      return { loading: true };
    case CHART_OPTIONS_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_OPTIONS_FAIL:
      return { loading: false, error: payload };
    case CHART_OPTIONS_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetOptionsCountOfSousCategorieReducer = (
  state = {},
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_OPTIONS_COUNT_SOUSCATEGORIE_REQUEST:
      return { loading: true };
    case CHART_OPTIONS_COUNT_SOUSCATEGORIE_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_OPTIONS_COUNT_SOUSCATEGORIE_FAIL:
      return { loading: false, error: payload };
    case CHART_OPTIONS_COUNT_SOUSCATEGORIE_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetOptionsCountOfServicesReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_OPTIONS_COUNT_SERVICES_REQUEST:
      return { loading: true };
    case CHART_OPTIONS_COUNT_SERVICES_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_OPTIONS_COUNT_SERVICES_FAIL:
      return { loading: false, error: payload };
    case CHART_OPTIONS_COUNT_SERVICES_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetLineDemandeReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_DEMANDE_LINE_REQUEST:
      return { loading: true };
    case CHART_DEMANDE_LINE_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_DEMANDE_LINE_FAIL:
      return { loading: false, error: payload };
    case CHART_DEMANDE_LINE_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetBarDemandeReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_DEMANDE_BAR_REQUEST:
      return { loading: true };
    case CHART_DEMANDE_BAR_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_DEMANDE_BAR_FAIL:
      return { loading: false, error: payload };
    case CHART_DEMANDE_BAR_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetLineDemandesSignataireReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_DEMANDE_LINE_SIGNATAIRE_REQUEST:
      return { loading: true };
    case CHART_DEMANDE_LINE_SIGNATAIRE_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_DEMANDE_LINE_SIGNATAIRE_FAIL:
      return { loading: false, error: payload };
    case CHART_DEMANDE_LINE_SIGNATAIRE_RESET:
      return {};
    default:
      return state;
  }
};

export const chartGetBarDemandesSignataireReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case CHART_DEMANDE_BAR_SIGNATAIRE_REQUEST:
      return { loading: true };
    case CHART_DEMANDE_BAR_SIGNATAIRE_SUCCESS:
      return { loading: false, success: true, data: payload };
    case CHART_DEMANDE_BAR_SIGNATAIRE_FAIL:
      return { loading: false, error: payload };
    case CHART_DEMANDE_BAR_SIGNATAIRE_RESET:
      return {};
    default:
      return state;
  }
};

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
  SERVICE_LIST_BY_DEPARTEMENT_ID_FAIL,
  SERVICE_LIST_BY_DEPARTEMENT_ID_REQUEST,
  SERVICE_LIST_BY_DEPARTEMENT_ID_RESET,
  SERVICE_LIST_BY_DEPARTEMENT_ID_SUCCESS,
} from "./serviceTypes";

export const serviceListReducer = (state = { services: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_LIST_REQUEST:
      return { loading: true, services: [] };
    case SERVICE_LIST_SUCCESS:
      return {
        success: true,
        services: payload,
      };
    case SERVICE_LIST_FAIL:
      return {
        loading: false,
        error: payload,
        services: [],
        success: true,
      };
    case SERVICE_LIST_RESET:
      return { services: [] };
    default:
      return state;
  }
};

export const serviceListByDirectionIDReducer = (
  state = { services: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_LIST_BY_DIRECTION_ID_REQUEST:
      return { loading: true, services: [] };
    case SERVICE_LIST_BY_DIRECTION_ID_SUCCESS:
      return {
        success: true,
        services: payload,
      };
    case SERVICE_LIST_BY_DIRECTION_ID_ADD:
      return {
        success: true,
        services: [payload, ...state.services],
      };
    case SERVICE_LIST_BY_DIRECTION_ID_REMOVE:
      return {
        success: true,
        services: state.services.filter(
          (cat) => String(cat._id) !== String(payload)
        ),
      };
    case SERVICE_LIST_BY_DIRECTION_ID_UPDATE:
      return {
        success: true,
        services: state.services.map((service) => {
          if (String(service._id) === String(payload._id)) {
            service.libelle = payload.libelle;
            service.direction = payload.direction;
            service.chefService = payload.chefService;
          }
          return service;
        }),
      };
    case SERVICE_LIST_BY_DIRECTION_ID_FAIL:
      return {
        loading: false,
        error: payload,
        services: [],
        success: true,
      };
    case SERVICE_LIST_BY_DIRECTION_ID_RESET:
      return { services: [] };
    default:
      return state;
  }
};

export const serviceListByDepartementIDReducer = (
  state = { services: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_LIST_BY_DEPARTEMENT_ID_REQUEST:
      return { loading: true, services: [] };
    case SERVICE_LIST_BY_DEPARTEMENT_ID_SUCCESS:
      return {
        success: true,
        services: payload,
      };
    case SERVICE_LIST_BY_DEPARTEMENT_ID_FAIL:
      return {
        loading: false,
        error: payload,
        services: [],
        success: true,
      };
    case SERVICE_LIST_BY_DEPARTEMENT_ID_RESET:
      return { services: [] };
    default:
      return state;
  }
};

export const serviceCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_CREATE_REQUEST:
      return { loading: true };
    case SERVICE_CREATE_SUCCESS:
      return { loading: false, success: true, service: payload };
    case SERVICE_CREATE_FAIL:
      return { loading: false, error: payload };
    case SERVICE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const serviceRemoveReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_REMOVE_REQUEST:
      return { loading: true };
    case SERVICE_REMOVE_SUCCESS:
      return { loading: false, success: true, message: payload };
    case SERVICE_REMOVE_FAIL:
      return { loading: false, error: payload };
    case SERVICE_REMOVE_RESET:
      return {};
    default:
      return state;
  }
};

export const serviceUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_UPDATE_REQUEST:
      return { loading: true };
    case SERVICE_UPDATE_SUCCESS:
      return { loading: false, success: true, service: payload };
    case SERVICE_UPDATE_FAIL:
      return { loading: false, error: payload };
    case SERVICE_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const serviceByIDReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SERVICE_BY_ID_REQUEST:
      return { loading: true };
    case SERVICE_BY_ID_SUCCESS:
      return {
        loading: false,
        service: payload,
        success: true,
      };
    case SERVICE_BY_ID_FAIL:
      return { loading: false, error: payload };
    case SERVICE_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

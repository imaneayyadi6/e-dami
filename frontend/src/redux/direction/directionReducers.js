import {
  DIRECTION_CREATE_REQUEST,
  DIRECTION_CREATE_SUCCESS,
  DIRECTION_CREATE_FAIL,
  DIRECTION_CREATE_RESET,
  DIRECTION_LIST_FAIL,
  DIRECTION_LIST_REQUEST,
  DIRECTION_LIST_RESET,
  DIRECTION_LIST_SUCCESS,
  DIRECTION_LIST_ADD,
  DIRECTION_LIST_REMOVE,
  DIRECTION_REMOVE_REQUEST,
  DIRECTION_REMOVE_FAIL,
  DIRECTION_REMOVE_RESET,
  DIRECTION_REMOVE_SUCCESS,
  DIRECTION_LIST_UPDATE,
  DIRECTION_UPDATE_FAIL,
  DIRECTION_UPDATE_REQUEST,
  DIRECTION_UPDATE_RESET,
  DIRECTION_UPDATE_SUCCESS,
  DIRECTION_BY_SERVICE_ID_REQUEST,
  DIRECTION_BY_SERVICE_ID_SUCCESS,
  DIRECTION_BY_SERVICE_ID_FAIL,
  DIRECTION_BY_SERVICE_ID_RESET,
  DIRECTION_LIST_SIGNATAIRES_REQUEST,
  DIRECTION_LIST_SIGNATAIRES_SUCCESS,
  DIRECTION_LIST_SIGNATAIRES_FAIL,
  DIRECTION_LIST_SIGNATAIRES_RESET,
} from "./directionTypes";

export const directionListReducer = (state = { directions: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_LIST_REQUEST:
      return { loading: true, directions: [] };
    case DIRECTION_LIST_SUCCESS:
      return {
        success: true,
        directions: payload,
      };
    case DIRECTION_LIST_ADD:
      return {
        success: true,
        directions: [payload, ...state.directions],
      };
    case DIRECTION_LIST_REMOVE:
      return {
        success: true,
        directions: state.directions.filter(
          (cat) => String(cat._id) !== String(payload)
        ),
      };
    case DIRECTION_LIST_UPDATE:
      return {
        success: true,
        directions: state.directions.map((direction) => {
          if (String(direction._id) === String(payload._id)) {
            direction.libelle = payload.libelle;
            direction.directeur = payload.directeur;
          }
          return direction;
        }),
      };
    case DIRECTION_LIST_FAIL:
      return { loading: false, error: payload, directions: [], success: true };
    case DIRECTION_LIST_RESET:
      return { directions: [] };
    default:
      return state;
  }
};

export const directionByServiceIDReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_BY_SERVICE_ID_REQUEST:
      return { loading: true };
    case DIRECTION_BY_SERVICE_ID_SUCCESS:
      return { loading: false, success: true, direction: payload };
    case DIRECTION_BY_SERVICE_ID_FAIL:
      return { loading: false, error: payload };
    case DIRECTION_BY_SERVICE_ID_RESET:
      return {};
    default:
      return state;
  }
};

export const directionCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_CREATE_REQUEST:
      return { loading: true };
    case DIRECTION_CREATE_SUCCESS:
      return { loading: false, success: true, direction: payload };
    case DIRECTION_CREATE_FAIL:
      return { loading: false, error: payload };
    case DIRECTION_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const directionRemoveReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_REMOVE_REQUEST:
      return { loading: true };
    case DIRECTION_REMOVE_SUCCESS:
      return { loading: false, success: true, message: payload };
    case DIRECTION_REMOVE_FAIL:
      return { loading: false, error: payload };
    case DIRECTION_REMOVE_RESET:
      return {};
    default:
      return state;
  }
};

export const directionUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_UPDATE_REQUEST:
      return { loading: true };
    case DIRECTION_UPDATE_SUCCESS:
      return { loading: false, success: true, direction: payload };
    case DIRECTION_UPDATE_FAIL:
      return { loading: false, error: payload };
    case DIRECTION_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const directionSignatairesListReducer = (
  state = { directions: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case DIRECTION_LIST_SIGNATAIRES_REQUEST:
      return { loading: true, directions: [] };
    case DIRECTION_LIST_SIGNATAIRES_SUCCESS:
      return { loading: false, success: true, directions: payload };
    case DIRECTION_LIST_SIGNATAIRES_FAIL:
      return { loading: false, error: payload, directions: [] };
    case DIRECTION_LIST_SIGNATAIRES_RESET:
      return { directions: [] };
    default:
      return state;
  }
};

import {
  DEPARTEMENT_LIST_BY_DIRECTION_ID_FAIL,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_REQUEST,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_RESET,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_SUCCESS,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_ADD,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_REMOVE,
  DEPARTEMENT_LIST_BY_DIRECTION_ID_UPDATE,
  DEPARTEMENT_LIST_FAIL,
  DEPARTEMENT_LIST_REQUEST,
  DEPARTEMENT_LIST_RESET,
  DEPARTEMENT_LIST_SUCCESS,
  DEPARTEMENT_BY_ID_FAIL,
  DEPARTEMENT_BY_ID_REQUEST,
  DEPARTEMENT_BY_ID_RESET,
  DEPARTEMENT_BY_ID_SUCCESS,
} from "./departementTypes";

export const departementListReducer = (
  state = { departements: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case DEPARTEMENT_LIST_REQUEST:
      return { loading: true, departements: [] };
    case DEPARTEMENT_LIST_SUCCESS:
      return {
        success: true,
        departements: payload,
      };
    case DEPARTEMENT_LIST_FAIL:
      return {
        loading: false,
        error: payload,
        departements: [],
        success: true,
      };
    case DEPARTEMENT_LIST_RESET:
      return { departements: [] };
    default:
      return state;
  }
};

export const departementListByDirectionIDReducer = (
  state = { departements: [] },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_REQUEST:
      return { loading: true, departements: [] };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_SUCCESS:
      return {
        success: true,
        departements: payload,
      };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_ADD:
      return {
        success: true,
        departements: [payload, ...state.departements],
      };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_REMOVE:
      return {
        success: true,
        departements: state.departements.filter(
          (cat) => String(cat._id) !== String(payload)
        ),
      };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_UPDATE:
      return {
        success: true,
        departements: state.departements.map((departement) => {
          if (String(departement._id) === String(payload._id)) {
            departement.libelle = payload.libelle;
            departement.direction = payload.direction;
            departement.chefdepartement = payload.chefdepartement;
          }
          return departement;
        }),
      };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_FAIL:
      return {
        loading: false,
        error: payload,
        departements: [],
        success: true,
      };
    case DEPARTEMENT_LIST_BY_DIRECTION_ID_RESET:
      return { departements: [] };
    default:
      return state;
  }
};

export const departementByIDReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEPARTEMENT_BY_ID_REQUEST:
      return { loading: true };
    case DEPARTEMENT_BY_ID_SUCCESS:
      return {
        loading: false,
        departement: payload,
        success: true,
      };
    case DEPARTEMENT_BY_ID_FAIL:
      return { loading: false, error: payload };
    case DEPARTEMENT_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

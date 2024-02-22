import {
  DEMANDE_CREATE_FAIL,
  DEMANDE_CREATE_REQUEST,
  DEMANDE_CREATE_RESET,
  DEMANDE_CREATE_SUCCESS,

  DEMANDE_TOHANDLE_LIST_FAIL,
  DEMANDE_TOHANDLE_LIST_REQUEST,
  DEMANDE_TOHANDLE_LIST_RESET,
  DEMANDE_TOHANDLE_LIST_SUCCESS,

  DEMANDE_TOHANDLE_FILTER_LIST_FAIL,
  DEMANDE_TOHANDLE_FILTER_LIST_REQUEST,
  DEMANDE_TOHANDLE_FILTER_LIST_RESET,
  DEMANDE_TOHANDLE_FILTER_LIST_SUCCESS,

  DEMANDE_BY_ID_FAIL,
  DEMANDE_BY_ID_REQUEST,
  DEMANDE_BY_ID_RESET,
  DEMANDE_BY_ID_SUCCESS,

  DEMANDE_TRAITEMENT_STATUS_FAIL, DEMANDE_TRAITEMENT_STATUS_REQUEST, DEMANDE_TRAITEMENT_STATUS_RESET, DEMANDE_TRAITEMENT_STATUS_SUCCESS,
  DEMANDE_APPROUVE_TRAITEMENT_FAIL, DEMANDE_APPROUVE_TRAITEMENT_REQUEST, DEMANDE_APPROUVE_TRAITEMENT_RESET, DEMANDE_APPROUVE_TRAITEMENT_SUCCESS,
  DEMANDE_REFUSE_TRAITEMENT_FAIL, DEMANDE_REFUSE_TRAITEMENT_REQUEST, DEMANDE_REFUSE_TRAITEMENT_RESET, DEMANDE_REFUSE_TRAITEMENT_SUCCESS,
  DEMANDE_MES_DEMANDES_FAIL, DEMANDE_MES_DEMANDES_REQUEST, DEMANDE_MES_DEMANDES_RESET, DEMANDE_MES_DEMANDES_SUCCESS,

  DEMANDE_DEMANDEUR_BY_ID_FAIL,
  DEMANDE_DEMANDEUR_BY_ID_REQUEST,
  DEMANDE_DEMANDEUR_BY_ID_RESET,
  DEMANDE_DEMANDEUR_BY_ID_SUCCESS,

} from "./demandeTypes";



export const mesDemandesReducer = (state = { demandes: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_MES_DEMANDES_REQUEST:
      return { loading: true, demandes: [] };
    case DEMANDE_MES_DEMANDES_SUCCESS:
      return { loading: false, success: true, demandes: payload };
    case DEMANDE_MES_DEMANDES_FAIL:
      return { loading: false, error: payload, demandes: [] };
    case DEMANDE_MES_DEMANDES_RESET:
      return { demandes: [] };
    default:
      return state;
  }
};


export const demandeToHandleReducer = (state = { demandes: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_TOHANDLE_LIST_REQUEST:
      return { loading: true, demandes: [] };
    case DEMANDE_TOHANDLE_LIST_SUCCESS:
      return { loading: false, success: true, data: payload };
    case DEMANDE_TOHANDLE_LIST_FAIL:
      return { loading: false, error: payload, demandes: [] };
    case DEMANDE_TOHANDLE_LIST_RESET:
      return { demandes: [] };
    default:
      return state;
  }
};

export const demandeToHandleFilterReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_TOHANDLE_FILTER_LIST_REQUEST:
      return { loading: true, };
    case DEMANDE_TOHANDLE_FILTER_LIST_SUCCESS:
      return { loading: false, success: true, data: payload };
    case DEMANDE_TOHANDLE_FILTER_LIST_FAIL:
      return { loading: false, error: payload, };
    case DEMANDE_TOHANDLE_FILTER_LIST_RESET:
      return {};
    default:
      return state;
  }
};

export const demandeCreateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_CREATE_REQUEST:
      return { loading: true };
    case DEMANDE_CREATE_SUCCESS:
      return { loading: false, success: true };
    case DEMANDE_CREATE_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};


export const demandeByIdReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_BY_ID_REQUEST:
      return { loading: true };
    case DEMANDE_BY_ID_SUCCESS:
      return { loading: false, success: true, demande: payload };
    case DEMANDE_BY_ID_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};

export const demandeGetTraitementStatusReducer = (state = {}, action) => {
  const { type, payload } = action;

  switch (type) {
    case DEMANDE_TRAITEMENT_STATUS_REQUEST:
      return { loading: true };
    case DEMANDE_TRAITEMENT_STATUS_SUCCESS:
      return { loading: false, success: true, statusResult: payload };
    case DEMANDE_TRAITEMENT_STATUS_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_TRAITEMENT_STATUS_RESET:
      return {};
    default:
      return state;
  }
}

export const demandeApprouveTraitementReducer = (state = {}, action) => {
  const { type, payload } = action;

  switch (type) {
    case DEMANDE_APPROUVE_TRAITEMENT_REQUEST:
      return { loading: true };
    case DEMANDE_APPROUVE_TRAITEMENT_SUCCESS:
      return { loading: false, success: true, message: payload };
    case DEMANDE_APPROUVE_TRAITEMENT_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_APPROUVE_TRAITEMENT_RESET:
      return {};
    default:
      return state;
  }
}

export const demanderRefuseTraitementReducer = (state = {}, action) => {
  const { type, payload } = action;

  switch (type) {
    case DEMANDE_REFUSE_TRAITEMENT_REQUEST:
      return { loading: true };
    case DEMANDE_REFUSE_TRAITEMENT_SUCCESS:
      return { loading: false, success: true, message: payload };
    case DEMANDE_REFUSE_TRAITEMENT_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_REFUSE_TRAITEMENT_RESET:
      return {};
    default:
      return state;
  }
}

export const demandeDemandeurByIdReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_DEMANDEUR_BY_ID_REQUEST:
      return { loading: true };
    case DEMANDE_DEMANDEUR_BY_ID_SUCCESS:
      return { loading: false, success: true, demande: payload };
    case DEMANDE_DEMANDEUR_BY_ID_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_DEMANDEUR_BY_ID_RESET:
      return {};
    default:
      return state;
  }
};
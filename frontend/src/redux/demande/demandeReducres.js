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
  DEMANDE_TRAITEMENT_STATUS_FAIL,
  DEMANDE_TRAITEMENT_STATUS_REQUEST,
  DEMANDE_TRAITEMENT_STATUS_RESET,
  DEMANDE_TRAITEMENT_STATUS_SUCCESS,
  DEMANDE_APPROUVE_TRAITEMENT_FAIL,
  DEMANDE_APPROUVE_TRAITEMENT_REQUEST,
  DEMANDE_APPROUVE_TRAITEMENT_RESET,
  DEMANDE_APPROUVE_TRAITEMENT_SUCCESS,
  DEMANDE_REFUSE_TRAITEMENT_FAIL,
  DEMANDE_REFUSE_TRAITEMENT_REQUEST,
  DEMANDE_REFUSE_TRAITEMENT_RESET,
  DEMANDE_REFUSE_TRAITEMENT_SUCCESS,
  DEMANDE_MES_DEMANDES_FAIL,
  DEMANDE_MES_DEMANDES_REQUEST,
  DEMANDE_MES_DEMANDES_RESET,
  DEMANDE_MES_DEMANDES_SUCCESS,
  DEMANDE_DEMANDEUR_BY_ID_FAIL,
  DEMANDE_DEMANDEUR_BY_ID_REQUEST,
  DEMANDE_DEMANDEUR_BY_ID_RESET,
  DEMANDE_DEMANDEUR_BY_ID_SUCCESS,
  DEMANDE_PREVIEW_TEAM_FAIL,
  DEMANDE_PREVIEW_TEAM_REQUEST,
  DEMANDE_PREVIEW_TEAM_RESET,
  DEMANDE_PREVIEW_TEAM_SUCCESS,
  DEMANDE_PREVIEW_TEAM_ADMIN_FAIL,
  DEMANDE_PREVIEW_TEAM_ADMIN_REQUEST,
  DEMANDE_PREVIEW_TEAM_ADMIN_RESET,
  DEMANDE_PREVIEW_TEAM_ADMIN_SUCCESS,
  DEMANDE_PREVIEW_TEAM_DETAILS_FAIL,
  DEMANDE_PREVIEW_TEAM_DETAILS_REQUEST,
  DEMANDE_PREVIEW_TEAM_DETAILS_RESET,
  DEMANDE_PREVIEW_TEAM_DETAILS_SUCCESS,
  DEMANDE_UPDATE_REQUEST,
  DEMANDE_UPDATE_SUCCESS,
  DEMANDE_UPDATE_FAIL,
  DEMANDE_UPDATE_RESET,
  DEMANDE_DELETE_REQUEST,
  DEMANDE_DELETE_SUCCESS,
  DEMANDE_DELETE_FAIL,
  DEMANDE_DELETE_RESET,
  DASHBOARD_STATS_REQUEST,
  DASHBOARD_STATS_SUCCESS,
  DASHBOARD_STATS_FAIL,
  DASHBOARD_STATS_RESET,
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

export const demandePreviewTeamReducer = (state = { demandes: [], pagination: {}, teamOptions: [] }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_PREVIEW_TEAM_REQUEST:
      return { ...state, loading: true, demandes: [] };
    case DEMANDE_PREVIEW_TEAM_SUCCESS:
      return { 
        loading: false, 
        success: true, 
        demandes: payload.demandes || payload, 
        pagination: payload.pagination || {},
        teamOptions: payload.teamOptions || []
      };
    case DEMANDE_PREVIEW_TEAM_FAIL:
      return { loading: false, error: payload, demandes: [], pagination: {}, teamOptions: [] };
    case DEMANDE_PREVIEW_TEAM_RESET:
      return { demandes: [], pagination: {}, teamOptions: [] };
    default:
      return state;
  }
};

export const demandePreviewTeamAdminReducer = (
  state = { demandes: [], pagination: {} },
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_PREVIEW_TEAM_ADMIN_REQUEST:
      return { ...state, loading: true, demandes: [] };
    case DEMANDE_PREVIEW_TEAM_ADMIN_SUCCESS:
      return { 
        loading: false, 
        success: true, 
        demandes: payload.demandes, 
        pagination: payload.pagination 
      };
    case DEMANDE_PREVIEW_TEAM_ADMIN_FAIL:
      return { loading: false, error: payload, demandes: [], pagination: {} };
    case DEMANDE_PREVIEW_TEAM_ADMIN_RESET:
      return { demandes: [], pagination: {} };
    default:
      return state;
  }
};

export const demandePreviewTeamDetailsReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_PREVIEW_TEAM_DETAILS_REQUEST:
      return { loading: true };
    case DEMANDE_PREVIEW_TEAM_DETAILS_SUCCESS:
      return { loading: false, success: true, demande: payload };
    case DEMANDE_PREVIEW_TEAM_DETAILS_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_PREVIEW_TEAM_DETAILS_RESET:
      return {};
    default:
      return state;
  }
};

export const demandeToHandleFilterReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_TOHANDLE_FILTER_LIST_REQUEST:
      return { loading: true };
    case DEMANDE_TOHANDLE_FILTER_LIST_SUCCESS:
      return { loading: false, success: true, data: payload };
    case DEMANDE_TOHANDLE_FILTER_LIST_FAIL:
      return { loading: false, error: payload };
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
};

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
};

export const demandeRefuseTraitementReducer = (state = {}, action) => {
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
};

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


export const demandeUpdateReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_UPDATE_REQUEST:
      return { loading: true };
    case DEMANDE_UPDATE_SUCCESS:
      return { loading: false, success: true, demande: payload };
    case DEMANDE_UPDATE_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};


export const demandeDeleteReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case DEMANDE_DELETE_REQUEST:
      return { loading: true };
    case DEMANDE_DELETE_SUCCESS:
      return { loading: false, success: true, message: payload.message };
    case DEMANDE_DELETE_FAIL:
      return { loading: false, error: payload };
    case DEMANDE_DELETE_RESET:
      return {};
    default:
      return state;
  }
};


export const dashboardStatsReducer = (state = { stats: null }, action) => {
  const { type, payload } = action;
  switch (type) {
    case DASHBOARD_STATS_REQUEST:
      return { loading: true };
    case DASHBOARD_STATS_SUCCESS:
      return { loading: false, stats: payload };
    case DASHBOARD_STATS_FAIL:
      return { loading: false, error: payload };
    case DASHBOARD_STATS_RESET:
      return { stats: null };
    default:
      return state;
  }
};

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
} from "./demandeTypes";
import axios from "axios";

export const createDemande = (option, contenu) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_CREATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/demandes",
        { option, contenu },
        config
      );
      dispatch({ type: DEMANDE_CREATE_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_CREATE_FAIL, payload: err });
    }
  };
};

export const resetCreateDemande = () => {
  return { type: DEMANDE_CREATE_RESET };
};

export const getDemandesToHandle = (query = { page: 1 }) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_TOHANDLE_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      let objFilter = Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const { data } = await axios.get(
        `/api/demandes/handle?${objFilter}`,
        config
      );
      dispatch({ type: DEMANDE_TOHANDLE_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_TOHANDLE_LIST_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesToHandle = () => {
  return { type: DEMANDE_TOHANDLE_LIST_RESET };
};

export const getDemandesPreviewTeam = (query = { page: 1, limit: 10 }) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_PREVIEW_TEAM_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      let objFilter = Object.entries(query)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const { data } = await axios.get(
        `/api/demandes/for/preview/team?${objFilter}`,
        config
      );
      dispatch({ type: DEMANDE_PREVIEW_TEAM_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_PREVIEW_TEAM_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesPreviewTeam = () => {
  return { type: DEMANDE_PREVIEW_TEAM_RESET };
};

export const getDemandesPreviewTeamAll = (query = { page: 1, limit: 10 }) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_PREVIEW_TEAM_ADMIN_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      let objFilter = Object.entries(query)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const { data } = await axios.get(
        `/api/demandes/for/preview/team/all?${objFilter}`,
        config
      );
      dispatch({ type: DEMANDE_PREVIEW_TEAM_ADMIN_SUCCESS, payload: data });
    } catch (error) {
      console.log(error);
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_PREVIEW_TEAM_ADMIN_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesPreviewTeamAll = () => {
  return { type: DEMANDE_PREVIEW_TEAM_ADMIN_RESET };
};

export const getDemandesPreviewDetailsTeam = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_PREVIEW_TEAM_DETAILS_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/demandes/for/preview/team/details/${id}`,
        config
      );
      dispatch({ type: DEMANDE_PREVIEW_TEAM_DETAILS_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_PREVIEW_TEAM_DETAILS_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesPreviewDetailsTeam = () => {
  return { type: DEMANDE_PREVIEW_TEAM_DETAILS_RESET };
};

export const getDemandesFilterToHandle = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_TOHANDLE_FILTER_LIST_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/demandes/handle/filter`, config);
      dispatch({ type: DEMANDE_TOHANDLE_FILTER_LIST_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_TOHANDLE_FILTER_LIST_FAIL, payload: err });
    }
  };
};

export const resetGetDemandesFilterToHandle = () => {
  return { type: DEMANDE_TOHANDLE_FILTER_LIST_RESET };
};

export const getDemandeByID = (id, idTraitement) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/demandes/${id}/traitement/${idTraitement}`,
        config
      );
      dispatch({ type: DEMANDE_BY_ID_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetGetDemandeByID = () => {
  return { type: DEMANDE_BY_ID_RESET };
};

export const getDemandeTraitementStatus = (id, idTraitement) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/demandes/${id}/traitement/${idTraitement}/status`,
        config
      );
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_TRAITEMENT_STATUS_FAIL, payload: err });
    }
  };
};

export const resetGetDemandeTraitementStatus = () => {
  return { type: DEMANDE_TRAITEMENT_STATUS_RESET };
};

export const approuveTraitement = (id, idTraitement, data) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_APPROUVE_TRAITEMENT_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data: responseData } = await axios.put(
        `/api/demandes/${id}/approuve/${idTraitement}`,
        data,
        config
      );
      dispatch({ type: DEMANDE_APPROUVE_TRAITEMENT_SUCCESS, payload: responseData });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_APPROUVE_TRAITEMENT_FAIL, payload: err });
    }
  };
};

export const resetApprouveTraitement = () => {
  return { type: DEMANDE_APPROUVE_TRAITEMENT_RESET };
};

export const refuseTraitement = (id, idTraitement, data) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_REFUSE_TRAITEMENT_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data: responseData } = await axios.put(
        `/api/demandes/${id}/refuse/${idTraitement}`,
        data,
        config
      );
      dispatch({ type: DEMANDE_REFUSE_TRAITEMENT_SUCCESS, payload: responseData });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_REFUSE_TRAITEMENT_FAIL, payload: err });
    }
  };
};

export const resetRefuseTraitement = () => {
  return { type: DEMANDE_REFUSE_TRAITEMENT_RESET };
};

export const getMesDemandes = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_MES_DEMANDES_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get("/api/demandes/mesdemandes", config);
      dispatch({
        type: DEMANDE_MES_DEMANDES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_MES_DEMANDES_FAIL, payload: err });
    }
  };
};

export const resetGetMesDemandes = () => {
  return { type: DEMANDE_MES_DEMANDES_RESET };
};

export const getDemandeurDemandeByID = (id) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_DEMANDEUR_BY_ID_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`/api/demandes/${id}`, config);
      dispatch({ type: DEMANDE_DEMANDEUR_BY_ID_SUCCESS, payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_DEMANDEUR_BY_ID_FAIL, payload: err });
    }
  };
};

export const resetGetDemandeurDemandeByID = () => {
  return { type: DEMANDE_DEMANDEUR_BY_ID_RESET };
};


export const updateDemande = (demandeId, demandeData) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_UPDATE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/demandes/${demandeId}`,
        demandeData,
        config
      );

      dispatch({
        type: DEMANDE_UPDATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_UPDATE_FAIL, payload: err });
    }
  };
};

export const resetUpdateDemande = () => {
  return { type: DEMANDE_UPDATE_RESET };
};


export const deleteDemande = (demandeId) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: DEMANDE_DELETE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.delete(
        `/api/demandes/${demandeId}`,
        config
      );

      dispatch({
        type: DEMANDE_DELETE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: DEMANDE_DELETE_FAIL, payload: err });
    }
  };
};

export const resetDeleteDemande = () => {
  return { type: DEMANDE_DELETE_RESET };
};


export const getDashboardStats = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: "DASHBOARD_STATS_REQUEST" });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/demandes/dashboard/stats", config);
      dispatch({ type: "DASHBOARD_STATS_SUCCESS", payload: data });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: "DASHBOARD_STATS_FAIL", payload: err });
    }
  };
};

export const resetDashboardStats = () => {
  return { type: "DASHBOARD_STATS_RESET" };
};

import axios from "axios";
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
  CHART_DEMANDE_LINE_SUCCESS

} from "./chartTypes";

export const fetchChartUsers = (startDate, endDate) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHART_USERS_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      if (startDate && endDate) {
        const { data } = await axios.get(
          `/api/charts/users?startDate=${startDate}&endDate=${endDate}`,
          config
        );
        dispatch({ type: CHART_USERS_SUCCESS, payload: data });
      } else {
        const { data } = await axios.get("/api/charts/users", config);
        dispatch({ type: CHART_USERS_SUCCESS, payload: data });
      }
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CHART_USERS_FAIL, payload: err });
    }
  };
};

export const resetFetchChartUsers = () => {
  return { type: CHART_USERS_RESET };
};

export const fetchChartOptions = (startDate, endDate) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHART_OPTIONS_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      if (startDate && endDate) {
        const { data } = await axios.get(
          `/api/charts/options?startDate=${startDate}&endDate=${endDate}`,
          config
        );
        dispatch({ type: CHART_OPTIONS_SUCCESS, payload: data });
      } else {
        const { data } = await axios.get("/api/charts/options", config);
        dispatch({ type: CHART_OPTIONS_SUCCESS, payload: data });
      }
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CHART_OPTIONS_FAIL, payload: err });
    }
  };
};

export const resetFetchChartOptions = () => {
  return { type: CHART_OPTIONS_RESET };
};

export const fetchChartOptionsCountOfSousCategorie = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHART_OPTIONS_COUNT_SOUSCATEGORIE_REQUEST });
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
        "/api/charts/options/souscategories",
        config
      );
      dispatch({
        type: CHART_OPTIONS_COUNT_SOUSCATEGORIE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CHART_OPTIONS_COUNT_SOUSCATEGORIE_FAIL, payload: err });
    }
  };
};

export const resetFetchChartOptionsCountOfSousCategorie = () => {
  return { type: CHART_OPTIONS_COUNT_SOUSCATEGORIE_RESET };
};

export const fetchChartOptionsCountOfServices = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHART_OPTIONS_COUNT_SERVICES_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/charts/options/services", config);
      dispatch({
        type: CHART_OPTIONS_COUNT_SERVICES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CHART_OPTIONS_COUNT_SERVICES_FAIL, payload: err });
    }
  };
};

export const resetFetchChartOptionsCountOfServices = () => {
  return { type: CHART_OPTIONS_COUNT_SERVICES_RESET };
};


export const fetchChartLineDemande = (startDate, endDate) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHART_DEMANDE_LINE_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userInfo.token}`,
        },
      };
      if (startDate && endDate) {
        const { data } = await axios.get(
          `/api/charts/lines/demandes?startDate=${startDate}&endDate=${endDate}`,
          config
        );
        dispatch({ type: CHART_DEMANDE_LINE_SUCCESS, payload: data });
      } else {
        const { data } = await axios.get("/api/charts/lines/demandes", config);
        dispatch({ type: CHART_DEMANDE_LINE_SUCCESS, payload: data });
      }
    } catch (error) {
      const err =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      dispatch({ type: CHART_DEMANDE_LINE_FAIL, payload: err });
    }
  };
};

export const resetFetchChartLineDemande = () => {
  return { type: CHART_DEMANDE_LINE_RESET };
};

import axios from "axios";
import {
  DASHBOARD_STATS_REQUEST,
  DASHBOARD_STATS_SUCCESS,
  DASHBOARD_STATS_FAIL,
  RECENT_REQUESTS_REQUEST,
  RECENT_REQUESTS_SUCCESS,
  RECENT_REQUESTS_FAIL,
  CHART_DATA_REQUEST,
  CHART_DATA_SUCCESS,
  CHART_DATA_FAIL,
} from "./dashboardTypes";

export const getDashboardStats = () => async (dispatch, getState) => {
  try {
    dispatch({ type: DASHBOARD_STATS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get("/api/dashboard/stats", config);

    dispatch({
      type: DASHBOARD_STATS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_STATS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getRecentRequests = () => async (dispatch, getState) => {
  try {
    dispatch({ type: RECENT_REQUESTS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get("/api/dashboard/recent-requests", config);

    dispatch({
      type: RECENT_REQUESTS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: RECENT_REQUESTS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getChartData = (chartType) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHART_DATA_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/dashboard/chart-data/${chartType}`, config);

    dispatch({
      type: CHART_DATA_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CHART_DATA_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};



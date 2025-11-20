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

const initialState = {
  stats: {
    activeUsers: 0,
    pendingRequests: 0,
    directions: 0,
    approvalRate: 0,
    changes: {
      users: 0,
      requests: 0,
    },
  },
  recentRequests: [],
  chartData: {},
  loading: false,
  error: null,
};

export const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARD_STATS_REQUEST:
    case RECENT_REQUESTS_REQUEST:
    case CHART_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DASHBOARD_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: action.payload,
      };

    case RECENT_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentRequests: action.payload,
      };

    case CHART_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        chartData: {
          ...state.chartData,
          [action.payload.type]: action.payload.data,
        },
      };

    case DASHBOARD_STATS_FAIL:
    case RECENT_REQUESTS_FAIL:
    case CHART_DATA_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};



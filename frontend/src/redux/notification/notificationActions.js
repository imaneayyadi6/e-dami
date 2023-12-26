import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL,
    NOTIFICATION_NOTSEEN_COUNT_REQUEST,
    NOTIFICATION_NOTSEEN_COUNT_RESET,
    NOTIFICATION_NOTSEEN_COUNT_SUCCESS,

    NOTIFICATION_LIST_FAIL,
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_RESET,
    NOTIFICATION_LIST_SUCCESS,

    NOTIFICATION_MAKE_IT_SEEN_FAIL,
    NOTIFICATION_MAKE_IT_SEEN_REQUEST,
    NOTIFICATION_MAKE_IT_SEEN_RESET,
    NOTIFICATION_MAKE_IT_SEEN_SUCCESS,

    NOTIFICATION_TOAST_LIST_FAIL,
    NOTIFICATION_TOAST_LIST_REQUEST,
    NOTIFICATION_TOAST_LIST_RESET,
    NOTIFICATION_TOAST_LIST_SUCCESS,
    NOTIFICATION_TOAST_LIST_SEEN_ALL,

    NOTIFICATION_TOAST_MAKE_IT_SEEN_FAIL,
    NOTIFICATION_TOAST_MAKE_IT_SEEN_REQUEST,
    NOTIFICATION_TOAST_MAKE_IT_SEEN_SUCCESS,

    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_FAIL,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_REQUEST,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_SUCCESS,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_RESET

} from "./notificationTypes"
import axios from "axios";

export const getNotificationsList = (page = 1) => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: NOTIFICATION_LIST_REQUEST });

            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get(`/api/notifications?page=${page}`, config);

            dispatch({ type: NOTIFICATION_LIST_SUCCESS, payload: data });
            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: 0 });


        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_LIST_FAIL, payload: err });
        }
    };
};

export const resetGetNotificationsLis = () => {
    return { type: NOTIFICATION_LIST_RESET };
};

export const makeAllNotificationsSeen = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: NOTIFICATION_MAKE_IT_SEEN_REQUEST });

            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put("/api/notifications", {}, config);

            dispatch({ type: NOTIFICATION_MAKE_IT_SEEN_SUCCESS, payload: data });



        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_MAKE_IT_SEEN_FAIL, payload: err });
        }
    };
};

export const resetMakeAllNotificationsSeen = () => {
    return { type: NOTIFICATION_MAKE_IT_SEEN_RESET };
};


export const getToastNotificationsList = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: NOTIFICATION_TOAST_LIST_REQUEST });

            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get("/api/notifications/toast", config);
            console.log(data);
            dispatch({ type: NOTIFICATION_TOAST_LIST_SUCCESS, payload: data });

        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_TOAST_LIST_FAIL, payload: err });
        }
    };
};

export const resetGetToastNotificationsList = () => {
    return { type: NOTIFICATION_TOAST_LIST_RESET };
};

export const makeAllToastNotificationsSeen = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: NOTIFICATION_TOAST_MAKE_IT_SEEN_REQUEST });

            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put("/api/notifications/toast", {}, config);

            dispatch({ type: NOTIFICATION_TOAST_MAKE_IT_SEEN_SUCCESS, payload: data });


        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_TOAST_MAKE_IT_SEEN_FAIL, payload: err });
        }
    };
};

export const resetMakeAllToastNotificationsSeen = () => {
    return { type: NOTIFICATION_MAKE_IT_SEEN_RESET };
};

export const makeOneToastNotificationsSeen = (id) => {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_REQUEST });

            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put(`/api/notifications/toast/${id}`, {}, config);

            dispatch({ type: NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_SUCCESS, payload: data });

        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_FAIL, payload: err });
        }
    };
};

export const resetMakeOneToastNotificationsSeen = () => {
    return { type: NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_RESET };
};




export const getNotificationsNotSeenCount = () => {
    console.log("call function")
    return async (dispatch, getState) => {
        console.log("return block")
        try {
            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_REQUEST });
            const {
                userLogin: { userInfo },
            } = getState();

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get("/api/notifications/notseen", config);

            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: data.count });

        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_FAIL, payload: err });
        }
    };
};

export const getFetchNotificationsNotSeenCount = () => {
    return { type: NOTIFICATION_NOTSEEN_COUNT_RESET };
};

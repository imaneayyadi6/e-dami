import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL, NOTIFICATION_NOTSEEN_COUNT_REQUEST, NOTIFICATION_NOTSEEN_COUNT_RESET, NOTIFICATION_NOTSEEN_COUNT_SUCCESS
} from "./notificationTypes"
import axios from "axios";


export const fetchNotificationsNotSeenCount = () => {
    return async (dispatch, getState) => {
        try {
            console.log("fetchNotificationsNotSeenCount try catch");

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

            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: data });
        } catch (error) {
            const err =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_FAIL, payload: err });
        }
    };
};

export const resetFetchNotificationsNotSeenCount = () => {
    return { type: NOTIFICATION_NOTSEEN_COUNT_RESET };
};
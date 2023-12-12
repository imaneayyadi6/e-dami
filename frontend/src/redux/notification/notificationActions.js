import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL,
    NOTIFICATION_NOTSEEN_COUNT_REQUEST,
    NOTIFICATION_NOTSEEN_COUNT_RESET,
    NOTIFICATION_NOTSEEN_COUNT_SUCCESS
} from "./notificationTypes"
import axios from "axios";

export const getNotificationsNotSeenCount = async () => {
    // const { data } = await axios.get("/api/notifications/notseen", {
    //     headers: {
    //         "Content-Type": "application/json",
    //         authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NGRlYmY2NDg4ZThiOTY3ZGM1NTY2ZCIsImlhdCI6MTcwMjMwMTY3MywiZXhwIjoxNzAzMTY1NjczfQ.yX65sPEvZHMXNrkBoGy-VtPO7_ckFD-Bol8lqvPTypY`,
    //     },
    // });
    // console.log(data);
    return async (dispatch, getState) => {
        console.log("Hello world")
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

export const getFetchNotificationsNotSeenCount = () => {
    return { type: NOTIFICATION_NOTSEEN_COUNT_RESET };
};

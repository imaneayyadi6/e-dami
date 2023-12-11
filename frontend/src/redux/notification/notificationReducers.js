import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL, NOTIFICATION_NOTSEEN_COUNT_REQUEST, NOTIFICATION_NOTSEEN_COUNT_RESET, NOTIFICATION_NOTSEEN_COUNT_SUCCESS
} from "./notificationTypes"


export const notificationsNotSeenCountReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_NOTSEEN_COUNT_REQUEST:
            return { loading: true };
        case NOTIFICATION_NOTSEEN_COUNT_SUCCESS:
            return { loading: false, success: true, recovredData: payload };
        case NOTIFICATION_NOTSEEN_COUNT_FAIL:
            return { loading: false, error: payload };
        case NOTIFICATION_NOTSEEN_COUNT_RESET:
            return {};
        default:
            return state;
    }
}
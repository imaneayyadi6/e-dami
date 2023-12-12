import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL, NOTIFICATION_NOTSEEN_COUNT_REQUEST, NOTIFICATION_NOTSEEN_COUNT_RESET, NOTIFICATION_NOTSEEN_COUNT_SUCCESS,
    NOTIFICATION_LIST_FAIL, NOTIFICATION_LIST_REQUEST, NOTIFICATION_LIST_RESET, NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_MAKE_IT_SEEN_FAIL, NOTIFICATION_MAKE_IT_SEEN_REQUEST, NOTIFICATION_MAKE_IT_SEEN_RESET, NOTIFICATION_MAKE_IT_SEEN_SUCCESS
    ,
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


export const notificationListReducer = (state = { notifications: [] }, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_LIST_REQUEST:
            return { loading: true, notifications: [] };
        case NOTIFICATION_LIST_SUCCESS:
            return { loading: false, success: true, notifications: payload };
        case NOTIFICATION_LIST_FAIL:
            return { loading: false, error: payload, notifications: [] };
        case NOTIFICATION_LIST_RESET:
            return { notifications: [] };
        default:
            return state;
    }
}

export const notificationMakeItSeenReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_MAKE_IT_SEEN_REQUEST:
            return { loading: true, };
        case NOTIFICATION_MAKE_IT_SEEN_SUCCESS:
            return { loading: false, success: true, notifications: payload };
        case NOTIFICATION_MAKE_IT_SEEN_FAIL:
            return { loading: false, error: payload, };
        case NOTIFICATION_MAKE_IT_SEEN_RESET:
            return {};
        default:
            return state;
    }
}
import {
    NOTIFICATION_NOTSEEN_COUNT_FAIL, NOTIFICATION_NOTSEEN_COUNT_REQUEST, NOTIFICATION_NOTSEEN_COUNT_RESET, NOTIFICATION_NOTSEEN_COUNT_SUCCESS,
    NOTIFICATION_LIST_FAIL, NOTIFICATION_LIST_REQUEST, NOTIFICATION_LIST_RESET, NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_MAKE_IT_SEEN_FAIL, NOTIFICATION_MAKE_IT_SEEN_REQUEST, NOTIFICATION_MAKE_IT_SEEN_RESET, NOTIFICATION_MAKE_IT_SEEN_SUCCESS,
    NOTIFICATION_LIST_PUSH,
    NOTIFICATION_NOTSEEN_COUNT_PUSH,

    NOTIFICATION_TOAST_LIST_FAIL,
    NOTIFICATION_TOAST_LIST_PUSH,
    NOTIFICATION_TOAST_LIST_REQUEST,
    NOTIFICATION_TOAST_LIST_RESET,
    NOTIFICATION_TOAST_LIST_SUCCESS,
    NOTIFICATION_TOAST_LIST_REMOVE,
    NOTIFICATION_TOAST_LIST_SEEN_ALL,

    NOTIFICATION_TOAST_MAKE_IT_SEEN_FAIL,
    NOTIFICATION_TOAST_MAKE_IT_SEEN_REQUEST,
    NOTIFICATION_TOAST_MAKE_IT_SEEN_RESET,
    NOTIFICATION_TOAST_MAKE_IT_SEEN_SUCCESS,

    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_FAIL,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_REQUEST,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_SUCCESS,
    NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_RESET

} from "./notificationTypes"





export const notificationListReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_LIST_REQUEST:
            return { loading: true, };
        case NOTIFICATION_LIST_SUCCESS:
            return { loading: false, success: true, data: payload };
        case NOTIFICATION_LIST_FAIL:
            return { loading: false, error: payload, };
        case NOTIFICATION_LIST_PUSH: {
            return {
                data: {
                    totalPages: state.totalPages,
                    currentPage: state.currentPage,
                    notifications: [payload, ...state.data.notifications]
                }
            }
        }

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

export const notificationToatsListReducer = (state = { notifications: [] }, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_TOAST_LIST_REQUEST:
            return { loading: true, notifications: [] };
        case NOTIFICATION_TOAST_LIST_SUCCESS:
            return { loading: false, success: true, notifications: payload };
        case NOTIFICATION_TOAST_LIST_FAIL:
            return { loading: false, error: payload, notifications: [] };
        case NOTIFICATION_TOAST_LIST_PUSH: {
            return { notifications: [payload, ...state.notifications] }
        }
        case NOTIFICATION_TOAST_LIST_SEEN_ALL: {
            return {
                notifications: state.notifications.map(notification => {
                    notification.vueToast = true
                    return notification
                })
            }
        }
        case NOTIFICATION_TOAST_LIST_REMOVE: {
            return { notifications: state.notifications.filter(notification => String(notification._id) !== String(payload)) }
        }
        case NOTIFICATION_TOAST_LIST_RESET:
            return { notifications: [] };
        default:
            return state;
    }
}

export const notificationToastMakeItSeenReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_TOAST_MAKE_IT_SEEN_REQUEST:
            return { loading: true, };
        case NOTIFICATION_TOAST_MAKE_IT_SEEN_SUCCESS:
            return { loading: false, success: true, notifications: payload };
        case NOTIFICATION_TOAST_MAKE_IT_SEEN_FAIL:
            return { loading: false, error: payload, };
        case NOTIFICATION_TOAST_MAKE_IT_SEEN_RESET:
            return {};
        default:
            return state;
    }
}
export const notificationOnceToastMakeItSeenReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_REQUEST:
            return { loading: true, };
        case NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_SUCCESS:
            return { loading: false, success: true };
        case NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_FAIL:
            return { loading: false, error: payload, };
        case NOTIFICATION_ONE_TOAST_MAKE_IT_SEEN_RESET:
            return {};
        default:
            return state;
    }
}
export const notificationsNotSeenCountReducer = (state = {}, action) => {
    const { type, payload } = action;
    switch (type) {
        case NOTIFICATION_NOTSEEN_COUNT_REQUEST:
            return { loading: true };
        case NOTIFICATION_NOTSEEN_COUNT_SUCCESS:
            return { loading: false, success: true, count: payload };
        case NOTIFICATION_NOTSEEN_COUNT_FAIL:
            return { loading: false, error: payload };
        case NOTIFICATION_NOTSEEN_COUNT_PUSH:
            return { count: state.count + 1 };
        case NOTIFICATION_NOTSEEN_COUNT_RESET:
            return {};
        default:
            return state;
    }
}


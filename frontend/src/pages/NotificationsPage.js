import { useEffect, useState } from "react"
import { Card, Placeholder } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { getNotificationsList, makeAllNotificationsSeen } from "../redux/notification/notificationActions"
import { Message, WarningMessage } from "../components"


const NotificationsPage = () => {
    const [callOnce, setCallOnce] = useState(false);


    const dispatch = useDispatch();

    const notificationList = useSelector(state => state.notificationList);
    const {
        loading: notificationListloading,
        error: notificationListError,
        success: notificationListSuccess,
        notifications
    } = notificationList;

    const notificationMakeItSeen = useSelector(state => state.notificationMakeItSeen);
    const {
        // loading: notificationMakeItSeenloading,
        error: notificationMakeItSeenError,
        // success: notificationMakeItSeenSuccess,
    } = notificationMakeItSeen;


    useEffect(() => {
        if (!callOnce) {
            setCallOnce(true);
            dispatch(getNotificationsList());
        }
        if (notificationListSuccess) {
            dispatch(makeAllNotificationsSeen());
        }
    }, [callOnce, notificationListSuccess])

    return (
        <div className="notifications-container">
            {notificationMakeItSeenError && <Message itWillBeHidden type="danger">{notificationMakeItSeenError}</Message>}
            {notificationListError && <Message itWillBeHidden type="danger">{notificationListError}</Message>}
            <Card>
                <Card.Body className="py-4">
                    {notificationListloading &&
                        <>
                            <div
                                className={`notification border p-3 mb-1 `}>
                                <Placeholder animation="glow">
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={6} />
                                    <div className="d-flex justify-content-end">
                                        <Placeholder xs={1} />
                                    </div>
                                </Placeholder>

                            </div>
                            <div
                                className={`notification border p-3 mb-1 `}>
                                <Placeholder animation="glow">
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={6} />
                                    <div className="d-flex justify-content-end">
                                        <Placeholder xs={1} />
                                    </div>
                                </Placeholder>
                            </div>
                            <div
                                className={`notification border p-3 mb-1 `}>
                                <Placeholder animation="glow">
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={6} />
                                    <div className="d-flex justify-content-end">
                                        <Placeholder xs={1} />
                                    </div>
                                </Placeholder>

                            </div>
                            <div
                                className={`notification border p-3 mb-1 `}>
                                <Placeholder animation="glow">
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={12} />
                                    <Placeholder xs={6} />
                                    <div className="d-flex justify-content-end">
                                        <Placeholder xs={1} />
                                    </div>
                                </Placeholder>

                            </div>
                        </>
                    }
                    <div className="d-flex justify-content-between mb-3">
                        <h6>
                            <i className="fas fa-bell"></i> notifcations non vue <span className="badge bg-dark pr-1">{notifications.filter(nt => !nt.vue).length}</span>
                        </h6>
                    </div>
                    {notifications.length === 0 && !notificationListloading && (
                        <WarningMessage message={"aucune notification trouvée !"} />
                    )}
                    {notifications.length > 0 && notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`notification border p-3 mb-1 ${notification.vue ? "seen" : "not-seen"}`}>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: notification.content
                                }}>
                            </p>
                            <div className="d-flex justify-content-end">
                                <small>
                                    {new Date(
                                        notification.dateNotification
                                    ).toLocaleDateString()}
                                    {" "}à{" "}
                                    {new Date(notification.dateNotification).toLocaleTimeString("en-US", {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: false, // Set to false if you want 24-hour format
                                    })}
                                </small>
                            </div>
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </div>
    )
}

export default NotificationsPage
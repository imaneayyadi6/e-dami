import { useEffect, useState } from "react"
import { Card, Placeholder } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { getNotificationsList, makeAllNotificationsSeen } from "../redux/notification/notificationActions"
import { Message, WarningMessage } from "../components"

const itemsPerPage = 10; // Number of items to display per page

const NotificationsPage = () => {
    const [callOnce, setCallOnce] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState([]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
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
            setItems(notifications.slice(indexOfFirstItem, indexOfLastItem));
            dispatch(makeAllNotificationsSeen());
        }
    }, [callOnce, notificationListSuccess])


    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const handleClick = (page) => {
        setCurrentPage(page);
        const indexOfLastItem = page * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        setItems(notifications.slice(indexOfFirstItem, indexOfLastItem));
    };

    const handleNext = () => {
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) {
            handleClick(nextPage);
        }
    };

    const handlePrevious = () => {
        const nextPage = currentPage - 1;
        if (nextPage > 0) {
            handleClick(nextPage);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        pageNumbers.push(<button onClick={() => handlePrevious()} className="btn btn-sm btn-light">&laquo;</button>)
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`${i === currentPage ? 'active' : ''} btn btn-sm btn-light`}
                    onClick={() => handleClick(i)}
                >
                    {i}
                </button>
            );
        }
        pageNumbers.push(<button onClick={handleNext} className="btn btn-sm btn-light">&raquo;</button>)


        return pageNumbers;
    };


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
                    {items.length > 0 && items.map(notification => (
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
                    <div className="d-flex justify-content-center mt-2">
                        {renderPageNumbers()}
                    </div>
                </Card.Body>

            </Card>
        </div>
    )
}

export default NotificationsPage
import { useEffect, useState } from "react"
import { Card, Placeholder } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { getNotificationsList, makeAllNotificationsSeen } from "../redux/notification/notificationActions"
import { Message, WarningMessage } from "../components"
import { NOTIFICATION_NOTSEEN_COUNT_SUCCESS } from "../redux/notification/notificationTypes"

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

    useEffect(() => {
        if (notifications.length > 0) {
            setItems(notifications.slice(indexOfFirstItem, indexOfLastItem));
            dispatch(makeAllNotificationsSeen());
            setTimeout(() => {

                dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: 0 });

            }, 3000);
        }
    }, [notifications.length])


    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const handleClick = (page) => {
        setCurrentPage(page);
        const indexOfLastItem = page * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        setItems(notifications.slice(indexOfFirstItem, indexOfLastItem));
    };

    const handleFirst = () => {

        handleClick(1);
    };

    const handleLast = () => {
        handleClick(totalPages);
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
        const range = 5; // Number of pages to display at a time
        const start = Math.max(1, currentPage - Math.floor(range / 2));
        const end = Math.min(totalPages, start + range - 1);

        pageNumbers.push(<button onClick={() => handleFirst()} className="btn btn-sm btn-light">&laquo;&laquo;</button>);
        pageNumbers.push(<button onClick={() => handlePrevious()} className="btn btn-sm btn-light">&laquo;</button>);

        for (let i = start; i <= end; i++) {
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

        pageNumbers.push(<button onClick={handleNext} className="btn btn-sm btn-light">&raquo;</button>);
        pageNumbers.push(<button onClick={() => handleLast()} className="btn btn-sm btn-light">&raquo;&raquo;</button>);

        return pageNumbers;
    };

    return (
        <div className="notifications-container">
            {notificationMakeItSeenError && <Message itWillBeHidden type="danger">{notificationMakeItSeenError}</Message>}
            {notificationListError && <Message itWillBeHidden type="danger">{notificationListError}</Message>}
            <Card>
                <Card.Body className="py-4">
                    <div className="d-flex justify-content-between mb-3">
                        <h6>
                            <i className="fas fa-bell"></i> notifcations non vue <span className="badge bg-dark pr-1">{notifications.filter(nt => !nt.vue).length}</span>
                        </h6>
                    </div>
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

                    {!notificationListloading && notifications.length === 0 &&(
                        <WarningMessage message={"aucune notification trouvée !"} />
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
                        <div className="d-flex justify-content-center align-items-center">
                            <small>
                                Page{" "}
                                <span style={{ fontWeight: "bold" }}>
                                    {currentPage + 1} de {totalPages}
                                </span>
                            </small>
                            {renderPageNumbers()}
                        </div>
                    </div>
                </Card.Body>

            </Card>
        </div>
    )
}

export default NotificationsPage
import { useEffect, useState } from "react";
import { Card, Placeholder } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotificationsList,
  makeAllNotificationsSeen,
} from "../redux/notification/notificationActions";
import { Message, WarningMessage } from "../components";
import { NOTIFICATION_NOTSEEN_COUNT_SUCCESS } from "../redux/notification/notificationTypes";

const NotificationsPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [callOnceNotification, setCallOnceNotification] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const notificationList = useSelector((state) => state.notificationList);
  const {
    loading: notificationListloading,
    error: notificationListError,
    success: notificationListSuccess,
    data,
  } = notificationList;

  const notificationMakeItSeen = useSelector(
    (state) => state.notificationMakeItSeen
  );
  const { error: notificationMakeItSeenError } = notificationMakeItSeen;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(getNotificationsList(newPage));
  };

  const renderPageLinks = () => {
    const links = [];

    const range = 20;
    const start = Math.max(1, currentPage - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range);

    links.push(
      <button
        key="first"
        className="btn btn-sm btn-light"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        &laquo;&laquo;
      </button>,
      <button
        key="previous"
        className="btn btn-sm btn-light"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>
    );

    for (let i = start; i <= end; i++) {
      links.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${
            i === currentPage ? "active" : ""
          } btn btn-sm btn-light`}
        >
          {i}
        </button>
      );
    }

    links.push(
      <button
        key="next"
        className="btn btn-sm btn-light"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>,
      <button
        key="last"
        className="btn btn-sm btn-light"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        &raquo;&raquo;
      </button>
    );

    return links;
  };

  useEffect(() => {
    if (!callOnce) {
      setCallOnce(true);
      dispatch(getNotificationsList());
    }
    if (!callOnceNotification) {
      if (notificationListSuccess) {
        setTotalPages(data.totalPages);
        setCallOnceNotification(true);
      }
    }
  }, [callOnce, callOnceNotification, notificationListSuccess]);

  useEffect(() => {
    if (data && Array(data.notifications).length > 0) {
      dispatch(makeAllNotificationsSeen());
      setTimeout(() => {
        dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: 0 });
      }, 3000);
    }
  }, [data]);

  return (
    <div className="notifications-container">
      {notificationMakeItSeenError && (
        <Message itWillBeHidden type="danger">
          {notificationMakeItSeenError}
        </Message>
      )}
      {notificationListError && (
        <Message itWillBeHidden type="danger">
          {notificationListError}
        </Message>
      )}
      <Card>
        <Card.Body className="py-4">
          <div className="d-flex justify-content-between mb-3">
            <h6>
              <i className="fas fa-bell"></i> notifcations non vue{" "}
              <span className="badge bg-dark pr-1">0</span>
              {/* {data && data.notifications.filter(nt => !nt.vue).length} */}
            </h6>
          </div>
          {notificationListloading && (
            <>
              <div className={`notification border p-3 mb-1 `}>
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
              <div className={`notification border p-3 mb-1 `}>
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
              <div className={`notification border p-3 mb-1 `}>
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
              <div className={`notification border p-3 mb-1 `}>
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
          )}

          {!notificationListloading &&
            data &&
            data.notifications.length === 0 && (
              <WarningMessage message={"aucune notification trouvée !"} />
            )}

          {data &&
            data.notifications &&
            data.notifications.length > 0 &&
            data.notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification border p-3 mb-1 ${
                  notification.vue ? "seen" : "not-seen"
                }`}
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: notification.content,
                  }}
                ></p>
                <div className="d-flex justify-content-end">
                  <small>
                    {new Date(
                      notification.dateNotification
                    ).toLocaleDateString()}{" "}
                    à{" "}
                    {new Date(notification.dateNotification).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: false, // Set to false if you want 24-hour format
                      }
                    )}
                  </small>
                </div>
              </div>
            ))}
          {data && data.notifications && data.notifications.length > 0 && (
            <div className="">
              <hr />
              <div className="d-flex justify-content-center align-items-center">
                {renderPageLinks()}
              </div>
              <hr />

              <div className="d-flex justify-content-center">
                <small className="d-block">
                  Page{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {currentPage} de {totalPages}
                  </span>
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;

import { useEffect, useState } from "react";
import { Card, Placeholder, Button, Badge, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotificationsList,
  makeAllNotificationsSeen,
} from "../redux/notification/notificationActions";
import { Message, WarningMessage } from "../components";
import { NOTIFICATION_NOTSEEN_COUNT_SUCCESS } from "../redux/notification/notificationTypes";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";
import { 
  FaBell, 
  FaBellSlash, 
  FaCheck, 
  FaCheckDouble, 
  FaClock, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const NotificationsPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [callOnceNotification, setCallOnceNotification] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); 
  
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
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

  
  const translations = {
    fr: {
      notifications: "Notifications",
      unreadNotifications: "Notifications non lues",
      allNotifications: "Toutes les notifications",
      readNotifications: "Notifications lues",
      noNotifications: "Aucune notification trouvée !",
      markAllAsRead: "Marquer tout comme lu",
      markAsRead: "Marquer comme lu",
      markAsUnread: "Marquer comme non lu",
      page: "Page",
      of: "de",
      date: "Date",
      time: "Heure",
      read: "Lu",
      unread: "Non lu",
      filter: "Filtrer",
      clear: "Effacer"
    },
    ar: {
      notifications: "الإشعارات",
      unreadNotifications: "إشعارات غير مقروءة",
      allNotifications: "جميع الإشعارات",
      readNotifications: "إشعارات مقروءة",
      noNotifications: "لم يتم العثور على إشعارات!",
      markAllAsRead: "تعيين الكل كمقروء",
      markAsRead: "تعيين كمقروء",
      markAsUnread: "تعيين كغير مقروء",
      page: "صفحة",
      of: "من",
      date: "التاريخ",
      time: "الوقت",
      read: "مقروء",
      unread: "غير مقروء",
      filter: "تصفية",
      clear: "مسح"
    }
  };

  const currentTranslations = translations[currentLanguage] || translations.fr;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(getNotificationsList(newPage));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    
  };

  const getFilteredNotifications = () => {
    if (!data || !data.notifications) return [];
    
    switch (filter) {
      case 'unread':
        return data.notifications.filter(notification => !notification.vue);
      case 'read':
        return data.notifications.filter(notification => notification.vue);
      default:
        return data.notifications;
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.vue) {
      return <FaCheckDouble style={{ color: '#28a745', fontSize: '16px' }} />;
    } else {
      return <FaBell style={{ color: '#ffc107', fontSize: '16px' }} />;
    }
  };

  const getNotificationTypeIcon = (notification) => {
    
    if (notification.content && notification.content.includes('approuvée')) {
      return <FaCheck style={{ color: '#28a745' }} />;
    } else if (notification.content && notification.content.includes('refusée')) {
      return <FaTimes style={{ color: '#dc3545' }} />;
    } else if (notification.content && notification.content.includes('en cours')) {
      return <FaClock style={{ color: '#ffc107' }} />;
    } else {
      return <FaInfoCircle style={{ color: '#17a2b8' }} />;
    }
  };

  const renderPageLinks = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex align-items-center justify-content-center">
        <Button
          variant="light"
          size="sm"
          className={`rounded-pill px-2 ${isRTL ? 'me-1' : 'ms-1'}`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <i className={isRTL ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left'}></i>
        </Button>
        <Button
          variant="light"
          size="sm"
          className={`rounded-pill px-2 ${isRTL ? 'me-2' : 'ms-2'}`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <i className={isRTL ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'}></i>
        </Button>

        {(() => {
          const total = totalPages;
          const pages = [];
          const addPage = (p) => pages.push(
            <Button
              key={p}
              variant={p === currentPage ? 'primary' : 'light'}
              size="sm"
              className={`rounded-pill ${isRTL ? 'ms-1' : 'me-1'} ${p === currentPage ? 'shadow-sm' : ''}`}
              style={{ minWidth: 36 }}
              onClick={() => handlePageChange(p)}
              disabled={p === currentPage}
            >
              {p}
            </Button>
          );

          const showEllipsis = (key) => (
            <span key={key} className={`text-muted ${isRTL ? 'ms-1' : 'me-1'}`}>…</span>
          );

          if (total <= 7) {
            for (let p = 1; p <= total; p++) addPage(p);
          } else {
            addPage(1);
            if (currentPage > 4) pages.push(showEllipsis('l'));
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(total - 1, currentPage + 1);
            for (let p = start; p <= end; p++) addPage(p);
            if (currentPage < total - 3) pages.push(showEllipsis('r'));
            addPage(total);
          }
          return pages;
        })()}

        <Button
          variant="light"
          size="sm"
          className={`rounded-pill px-2 ${isRTL ? 'me-2' : 'ms-2'}`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <i className={isRTL ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right'}></i>
        </Button>
        <Button
          variant="light"
          size="sm"
          className={`rounded-pill px-2 ${isRTL ? 'me-1' : 'ms-1'}`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <i className={isRTL ? 'fa-solid fa-angles-left' : 'fa-solid fa-angles-right'}></i>
        </Button>
      </div>
    );
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
    if (data && data.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
      dispatch(makeAllNotificationsSeen());
      setTimeout(() => {
        dispatch({ type: NOTIFICATION_NOTSEEN_COUNT_SUCCESS, payload: 0 });
      }, 3000);
    }
  }, [data]);

  const filteredNotifications = getFilteredNotifications();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
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
      
      {}
      <div
        className="d-flex align-items-center mb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
      >
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>
            {currentTranslations.notifications}
          </h2>
          {data && data.notifications && data.notifications.filter(nt => !nt.vue).length > 0 && (
            <Badge bg="secondary" className="mt-1">
              {data.notifications.filter(nt => !nt.vue).length} {currentTranslations.unreadNotifications.toLowerCase()}
            </Badge>
          )}
        </div>
        <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
          {data && data.notifications && data.notifications.filter(nt => !nt.vue).length > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => dispatch(makeAllNotificationsSeen())}
              style={{
                padding: "6px 14px",
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaCheckDouble />
              {currentTranslations.markAllAsRead}
            </Button>
          )}
        </div>
      </div>

      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          {}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <span className="text-muted me-3">{currentTranslations.filter}:</span>
              <Button
                variant={filter === 'all' ? 'primary' : 'outline-secondary'}
                size="sm"
                className="me-2"
                onClick={() => handleFilterChange('all')}
              >
                {currentTranslations.allNotifications}
              </Button>
              <Button
                variant={filter === 'unread' ? 'warning' : 'outline-secondary'}
                size="sm"
                className="me-2"
                onClick={() => handleFilterChange('unread')}
              >
                {currentTranslations.unreadNotifications}
              </Button>
              <Button
                variant={filter === 'read' ? 'success' : 'outline-secondary'}
                size="sm"
                onClick={() => handleFilterChange('read')}
              >
                {currentTranslations.readNotifications}
              </Button>
            </div>
            <small className="text-muted">
              {filteredNotifications.length} {currentTranslations.notifications.toLowerCase()}
            </small>
          </div>
          {notificationListloading && (
            <div className="p-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="d-flex align-items-center p-3 mb-3" style={{ 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 12,
                  border: '1px solid var(--border-light)'
                }}>
                  <div 
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      background: '#f8f9fa'
                    }}
                  >
                    <Placeholder animation="glow" style={{ width: 20, height: 20, borderRadius: 4 }} />
                  </div>
                  <div className="flex-grow-1">
                    <Placeholder animation="glow">
                      <Placeholder xs={8} className="mb-2" />
                      <Placeholder xs={6} />
                    </Placeholder>
                  </div>
                  <div className="text-end">
                    <Placeholder animation="glow">
                      <Placeholder xs={4} />
                    </Placeholder>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!notificationListloading && filteredNotifications.length > 0 ? (
            <>
              <div className="table-responsive rounded border bg-body">
                <div className="p-0">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification._id}
                      className={`p-3 ${
                        index !== filteredNotifications.length - 1 ? 'border-bottom' : ''
                      }`}
                      style={{ 
                        background: notification.vue ? 'transparent' : '#f8f9fa',
                        borderLeft: notification.vue ? 'none' : '3px solid #dee2e6'
                      }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-3" style={{ flexShrink: 0 }}>
                          {getNotificationTypeIcon(notification)}
                        </div>
                        
                        <div className="flex-grow-1">
                          <div 
                            className="mb-2"
                            style={{ fontSize: '0.9rem', lineHeight: '1.4' }}
                            dangerouslySetInnerHTML={{
                              __html: notification.content,
                            }}
                          />
                          
                          <div className="d-flex align-items-center justify-content-between">
                            <small className={`${notification.vue ? 'text-muted' : 'text-primary'}`}>
                              {notification.vue ? currentTranslations.read : currentTranslations.unread}
                            </small>
                            
                            <small className="text-muted">
                              {new Date(notification.dateNotification).toLocaleDateString('fr-FR')}{" "}
                              {new Date(notification.dateNotification).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-center mt-3">
                  {renderPageLinks()}
                </div>
              )}
            </>
          ) : (
            !notificationListloading && (
              <Card className="border-0 bg-body-tertiary text-center py-5">
                <Card.Body>
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' }}>
                    <FaBellSlash style={{ color: '#0d6efd', fontSize: 28 }} />
                  </div>
                  <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{currentTranslations.noNotifications}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {currentLanguage === 'ar' ? 'لا توجد إشعارات متاحة حالياً' : 'Aucune notification disponible pour le moment'}
                  </div>
                </Card.Body>
              </Card>
            )
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage;

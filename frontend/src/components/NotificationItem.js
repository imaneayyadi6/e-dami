import Toast from 'react-bootstrap/Toast';
import TimeAgo from './TimeAgo';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeOneToastNotificationsSeen } from '../redux/notification/notificationActions';
import { useTranslation } from 'react-i18next';
import { useLanguageSync } from '../hooks/useLanguageSync';
import { FaBell, FaCheck, FaTimes, FaClock, FaInfoCircle, FaTimes as FaClose } from 'react-icons/fa';
import { useNotificationTranslation } from '../services/notificationTranslator';

const NotificationItem = ({ notification }) => {
    const [show, setShow] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { isRTL } = useLanguageSync();
    const { translateNotificationContent } = useNotificationTranslation();

    const closeHandler = () => {
        dispatch(makeOneToastNotificationsSeen(notification._id))
        setShow(false);
    }

    const getNotificationIcon = () => {
        const content = notification.content || '';
        
        if (content.includes('approuvée') || content.includes('موافق عليه') || content.includes('الموافقة')) {
            return <FaCheck style={{ color: '#28a745' }} />;
        } else if (content.includes('refusée') || content.includes('مرفوض') || content.includes('رفض')) {
            return <FaTimes style={{ color: '#dc3545' }} />;
        } else if (content.includes('en cours') || content.includes('قيد المعالجة') || content.includes('معالجة')) {
            return <FaClock style={{ color: '#ffc107' }} />;
        } else {
            return <FaInfoCircle style={{ color: '#17a2b8' }} />;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isHovered) {
                closeHandler();
            }
        }, 6000);
        
        return () => clearTimeout(timer);
    }, [isHovered]);

    return (
        <Toast 
            className="mt-2" 
            onClose={closeHandler} 
            show={show}
            style={{
                minWidth: '300px',
                maxWidth: '350px'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Toast.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {getNotificationIcon()}
                    <small className="ms-2">
                        {t('notifications.newNotification', { defaultValue: 'Notification' })}
                    </small>
                </div>
                <button
                    type="button"
                    className="btn-close"
                    onClick={closeHandler}
                />
            </Toast.Header>
            <Toast.Body 
                style={{ 
                    fontSize: '0.9rem',
                    direction: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left'
                }}
                dangerouslySetInnerHTML={{
                    __html: notification && notification.content ? 
                        translateNotificationContent(notification.content) : 
                        ''
                }}
            />
        </Toast>
    )
}

export default NotificationItem;
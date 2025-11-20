import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getToastNotificationsList } from '../redux/notification/notificationActions';
import NotificationItem from './NotificationItem';
import { useLanguageSync } from '../hooks/useLanguageSync';


const NotificationsToastContainer = () => {
    const [callOnce, setCallOnce] = useState(false);
    const { isRTL } = useLanguageSync();

    const notificationToatsList = useSelector(state => state.notificationToatsList);
    const { notifications } = notificationToatsList;
    
    const dispatch = useDispatch();

    useEffect(() => {
        if (!callOnce) {
            dispatch(getToastNotificationsList());
            setCallOnce(true);
        }
    }, [callOnce]);

    return (
        <div 
            className='position-fixed' 
            style={{ 
                zIndex: '9999',
                top: '20px',
                [isRTL ? 'left' : 'right']: '20px',
                maxWidth: '350px',
                pointerEvents: 'none'
            }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                {notifications && notifications.length > 0 &&
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                        />
                    ))}
            </div>
        </div>
    );
};

export default NotificationsToastContainer;
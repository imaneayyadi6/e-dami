import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { getToastNotificationsList } from '../redux/notification/notificationActions';
import NotificationItem from './NotificationItem';


const NotificationsToastContainer = () => {
    const [callOnce, setCallOnce] = useState(false);

    const notificationToatsList = useSelector(state => state.notificationToatsList);
    const { notifications } = notificationToatsList;

    const notificationToastMakeItSeen = useSelector(state => state.notificationToastMakeItSeen);
    const { success: notificationToastMakeItSeenSuccess } = notificationToastMakeItSeen

    const dispatch = useDispatch();


    useEffect(() => {
        if (!callOnce) {
            dispatch(getToastNotificationsList());
            setCallOnce(true);
        }
    }, [callOnce, notificationToastMakeItSeenSuccess]);

    return (
        <div className='w-100 d-flex justify-content-end'>
            <div className='position-absolute' style={{ zIndex: '2000' }}>
                {notifications &&
                    notifications.length > 0 &&
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                        />
                    ))}
            </div>
        </div>
    );
}

export default NotificationsToastContainer;
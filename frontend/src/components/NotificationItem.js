import Toast from 'react-bootstrap/Toast';
import TimeAgo from './TimeAgo';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeOneToastNotificationsSeen } from '../redux/notification/notificationActions';

const NotificationItem = ({ notification }) => {
    const [show, setShow] = useState(true);

    const dispatch = useDispatch();

    const closeHandler = () => {
        dispatch(makeOneToastNotificationsSeen(notification._id))
        setShow(false);
    }


    return (
        <Toast className="mt-1 mr-1" onClose={closeHandler} show={show}>
            <Toast.Header className='justify-content-end' closeButton>
                <small>{<TimeAgo date={notification && notification.dateNotification} />}</small>
            </Toast.Header>
            <Toast.Body
                dangerouslySetInnerHTML={{
                    __html: notification && notification.content
                }}
            ></Toast.Body>
        </Toast>
    )
}

export default NotificationItem;
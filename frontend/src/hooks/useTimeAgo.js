import { useState, useEffect } from 'react';

const useTimeAgo = (date) => {
    const [timeAgo, setTimeAgo] = useState('');
    const calculateTimeAgo = () => {
        const currentDate = new Date();
        const timestamp = new Date(date);
        const timeDifference = currentDate - timestamp;

        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (seconds < 60) {
            setTimeAgo(`il y a ${seconds} seconde${seconds === 1 ? '' : 's'}`);
        } else if (minutes < 60) {
            setTimeAgo(`il y a ${minutes} minute${minutes === 1 ? '' : 's'}`);
        } else if (hours < 24) {
            setTimeAgo(`il y a ${hours} heure${hours === 1 ? '' : 's'}`);
        } else if (days < 30) {
            setTimeAgo(`il ya ${days} jour${days === 1 ? '' : 's'} `);
        } else if (months < 12) {
            setTimeAgo(`il ya ${months} mois `);
        } else {
            setTimeAgo(`il ya ${years} année${years === 1 ? '' : 's'} `);
        }
    };
    useEffect(() => {
        calculateTimeAgo();

        
        const intervalId = setInterval(calculateTimeAgo, 60 * 1000);

        return () => clearInterval(intervalId);
    }, [date]);

    return timeAgo;
};

export default useTimeAgo;

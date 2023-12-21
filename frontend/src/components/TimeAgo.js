import React from 'react';
import { useTimeAgo } from '../hooks';

const TimeAgo = ({ date }) => {
    const timeAgo = useTimeAgo(date);

    return <span>{timeAgo}</span>;
};

export default TimeAgo;

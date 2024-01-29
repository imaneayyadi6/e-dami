const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            console.log('Socket: A user connected');
        });
    });
};

export default socketRoutes;
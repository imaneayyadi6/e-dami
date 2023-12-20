const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        // Listen for connection :
        console.log('Socket: A user connected');

        // Listen for disconnection :
        socket.on('disconnect', () => {
            console.log('Socket: A user connected');
        });
    });
};

export default socketRoutes;
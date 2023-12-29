const socketRoutes = (io) => {
    io.on('connection', (socket) => {
       
      

        // Listen for disconnection :
        socket.on('disconnect', () => {
            console.log('Socket: A user connected');
        });
    });
};

export default socketRoutes;
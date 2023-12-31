const { Server } = require('socket.io');

// Need to set cors to allow connections from our react front-end hosted at port 5173
const io = new Server({
    cors: "http://localhost:5173/"
})

// Event listener for whenever a client connects to the socket.io server
io.on('connection', function (socket) {
    // When a client sends the canvasImage event, we will broadcast it to the other clients. 
    socket.on('canvasImage', (data) => {
        socket.broadcast.emit('canvasImage', data);
    });
});

// Start server
io.listen(5000);
Summary
io(): Create a new Socket.IO server.
io.on(event, callback): Listen for incoming connections and predefined events.
socket.on(event, callback): Listen for specific events from the client.
socket.emit(event, data): Send an event to the client.
socket.broadcast.emit(event, data): Send an event to all clients except the sender.
io.emit(event, data): Send an event to all clients.
socket.join(room): Join a specific room.
socket.leave(room): Leave a specific room.
io.to(room).emit(event, data): Send an event to all clients in a specific room.
socket.disconnect(): Disconnect the socket from the server.
io.sockets: Access all connected sockets.
socket.to(room).emit(event, data): Send an event to all clients in a room except the sender.
These methods form the core of Socket.IO functionality, enabling real-time communication, event handling, and room-based messaging in web applications.


Socket.IO is a popular library for enabling real-time, bidirectional, and event-based communication between web clients and servers. It provides several important methods that are essential for building real-time web applications. Here is a list of the most important methods in Socket.IO along with explanations for each:

1. io()
This is the main entry point for creating a new Socket.IO server.

Example:

javascript
Copy code
const io = require('socket.io')(server);
2. io.on(event, callback)
This method is used to listen for incoming connections or other predefined events.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    console.log('A user connected');
});
3. socket.on(event, callback)
This method is used to listen for specific events emitted by the client.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        console.log('Message received: ' + msg);
    });
});
4. socket.emit(event, data)
This method is used to emit an event to the client along with optional data.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.emit('welcome', 'Hello, user!');
});
5. socket.broadcast.emit(event, data)
This method is used to send an event to all clients except the sender.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg);
    });
});
6. io.emit(event, data)
This method is used to send an event to all connected clients, including the sender.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    io.emit('announcement', 'A new user has joined');
});
7. socket.join(room)
This method allows a socket to join a specific room.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.join('room1');
});
8. socket.leave(room)
This method allows a socket to leave a specific room.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.leave('room1');
});
9. io.to(room).emit(event, data)
This method sends an event to all clients in a specific room.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        io.to('room1').emit('message', msg);
    });
});
10. socket.disconnect()
This method disconnects the socket from the server.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
11. io.sockets
This property provides access to the collection of all connected sockets.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    console.log(io.sockets.sockets);
});
12. socket.to(room).emit(event, data)
This method sends an event to all clients in a specific room, except the sender.

Example:

javascript
Copy code
io.on('connection', (socket) => {
    socket.on('private message', (msg) => {
        socket.to('room1').emit('private message', msg);
    });
});
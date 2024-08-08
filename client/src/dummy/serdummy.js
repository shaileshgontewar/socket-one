const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages
  socket.on('sendMessage', async (data) => {
    try {
      // Save message to database
      const message = new Message(data);
      await message.save();

      // Emit the message to the private chat channel
      io.to(data.channel).emit('message', data);
    } catch (error) {
      console.error(error);
    }
  });

  // Join private chat channel
  socket.on('joinChat', (channel) => {
    socket.join(channel);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

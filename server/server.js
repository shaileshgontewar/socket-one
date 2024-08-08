const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3002", // Allow your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  },
});
// Enable CORS for Express
app.use(
  cors({
    origin: "http://localhost:3002", // Allow requests from this origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());
// MongoDB connection
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  mongoose
    .connect("mongodb://127.0.0.1:27017/chatapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch((err) => {
      console.error(
        "MongoDB connection unsuccessful, retry after 5 seconds. Error:",
        err
      );
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();
// MongoDB connection
// mongoose.connect("mongodb://localhost:27017/chatapp", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", function () {
//   console.log("Connected to MongoDB");
// });

// Authentication Middleware

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).send("No token provided.");

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) return res.status(403).send("No token provided.");
  jwt.verify(token, "my_secret_key", (err, decoded) => {
    if (err) return res.status(500).send("Failed to authenticate token.");
    req.userId = decoded.id;
    next();
  });
};

// User Registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });
  try {
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send("Error registering user");
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("Invalid credentials");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, "my_secret_key", {
      expiresIn: 86400,
    }); // 24 hours
    // res.status(200).send({ auth: true, token });
    res
      .status(200)
      .json({ userId: user._id, username: user.username, auth: true, token });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});
app.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }, "username");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});
// Get messages for a conversation

app.get("/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversationId })
      .populate("sender", "username")
      .populate("recipient", "username")
      .sort("createdAt");
    if (!messages) {
      console.error(`No messages found for conversation ID: ${conversationId}`);
      return res.status(404).json({ error: "No messages found" });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Unable to retrieve messages" });
  }
});

// Socket.IO connections

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("joinChat", async ({ userId, recipientId }) => {
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
      });
      await conversation.save();
    }
    socket.join(conversation._id.toString());
    socket.emit("joinedChat", { conversationId: conversation._id.toString() });
    console.log(
      `User ${userId} and User ${recipientId} joined conversation ${conversation._id}`
    );
  });
  socket.on(
    "sendMessage",
    async ({ conversationId, senderId, recipientId, message }) => {
      try {
        const newMessage = new Message({
          conversationId,
          sender: senderId,
          recipient: recipientId,
          message: message,
          status: "sent",
        });
        await newMessage.save();
        io.to(conversationId).emit("message", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  );
  socket.on("updateMessageStatus", async ({ messageId, status }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { status },
        { new: true }
      ).populate("sender", "username")
        .populate("recipient", "username");

      io.to(updatedMessage.conversationId.toString()).emit("statusUpdate", updatedMessage);
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });
  // // Emit a notification event to all users except the sender
  // socket.broadcast.emit('notification', { message: 'New message received' });
   // Listen for typing event
   socket.on('typing', () => {
    socket.broadcast.emit('typing', { isTyping: true });
  });

  // Listen for stop typing event
  socket.on('stopTyping', () => {
    socket.broadcast.emit('typing', { isTyping: false });
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

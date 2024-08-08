import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

function Chat({ token, userId, recipientId, setRecipientId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [userList, setUserList] = useState([]);

  console.log(messages, "messages");
  console.log(userId, "userId");
  console.log(recipientId, "recipientId");
  const fetchUserList = () => {
    fetch("http://localhost:3001/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUserList(data))
      .catch((error) => console.error("Error fetching user list:", error));
  };
  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    if (userId && recipientId) {
      socket.emit("joinChat", { userId, recipientId });
      socket.on("joinedChat", ({ conversationId }) => {
        setConversationId(conversationId);
        fetchMessages(conversationId);
      });
    }
    socket.on("message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });
    socket.on("statusUpdate", (updatedMsg) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMsg._id ? updatedMsg : msg
        )
      );
    });
    return () => {
      socket.off("joinedChat");
      socket.off("message");
      socket.off("statusUpdate");
    //   socket.disconnect();
    // Clean up when component unmounts
    socket.emit('disconnect');
    };
  }, [userId, recipientId]);

  const fetchMessages = async (convId) => {
    try {
      const response = await fetch(`http://localhost:3001/messages/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Error fetching messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit("sendMessage", {
        conversationId,
        senderId: userId,
        recipientId,
        message: inputMessage,
      });
      setInputMessage("");
    }
  };
  const updateMessageStatus = (messageId, status) => {
    socket.emit("updateMessageStatus", { messageId, status });
  };
  const handleRecipientSelection = (recipientId) => {
    setRecipientId(recipientId);
    // setConversationId(`${userId}-${recipientId}`);
  };
  return (
    <div>
      <ul>
        {userList.map((user) => (
          <li key={user._id} onClick={() => handleRecipientSelection(user._id)}>
            {user.username}
          </li>
        ))}
      </ul>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
             {msg.sender.username}: {msg.message} ({msg.status})
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;

// const socket = io('http://localhost:3001', {
//     transports: ['websocket'],
//     auth: {
//       token: `Bearer ${token}`
//     }
//   });
// socket.emit("joinChat", { userId, recipientId });

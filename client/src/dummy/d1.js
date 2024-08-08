import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listen for typing event
    socket.on('typing', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    // Listen for notification event
    socket.on('notification', ({ message }) => {
      setNotification(message);
      setTimeout(() => {
        setNotification('');
      }, 3000); // Hide notification after 3 seconds
    });
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('sendMessage', { message: inputMessage });
      setInputMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing');
  };

  const handleStopTyping = () => {
    socket.emit('stopTyping');
  };

  return (
    <div>
      {notification && <div>{notification}</div>}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.sender}: {msg.message}</li>
        ))}
      </ul>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={handleTyping}
        onKeyUp={handleStopTyping}
      />
      <button onClick={sendMessage}>Send</button>
      {isTyping && <div>Someone is typing...</div>}
    </div>
  );
}

export default App;

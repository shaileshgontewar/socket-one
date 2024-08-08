import React, { useEffect, useState } from "react";
import "./App.css";
import Register from "./componant/Register";
import Login from "./componant/Login";
import Chat from "./componant/Chat";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(""); // This should be set after login
  const [recipientId, setRecipientId] = useState(""); // This should be set when selecting a chat recipient
  const handleSetUserId = (id) => {
    setUserId(id);
  };
  const handleSetRecipientId = (id) => {
    setRecipientId(id);
  };
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  return (
    <div className="App">
      {!token ? (
        <>
          <Register />
          <Login setToken={setToken} setUserId={handleSetUserId} />
        </>
      ) : (
        <Chat
          token={token}
          userId={userId}
          recipientId={recipientId}
          setRecipientId={handleSetRecipientId}
        />
      )}
    </div>
  );
}

export default App;

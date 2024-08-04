import React, { useEffect, useState, useRef } from "react";

const LiveStream = () => {
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const message = { type: "chat", content: chatInput };
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        setChatInput("");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mb-4">Live Stream</h1>
      <div className="text-center mb-4">
        <button
          className="btn btn-primary me-2"
          onClick={() => setStreaming(!streaming)}
        >
          {streaming ? "Stop Streaming" : "Start Streaming"}
        </button>
      </div>
      <div className="stream-video">
        {streaming && (
          <video
            src="/live" // This should point to your live stream endpoint
            controls
            autoPlay
            style={{ width: "100%", maxHeight: "400px", marginBottom: "20px" }}
          />
        )}
      </div>
      <div className="chat-box">
        <h2>Chat:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg.content}</li>
          ))}
        </ul>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "80%", padding: "10px", marginRight: "10px" }}
        />
        <button onClick={handleSendMessage} className="btn btn-success">
          Send
        </button>
      </div>
    </div>
  );
};

export default LiveStream;

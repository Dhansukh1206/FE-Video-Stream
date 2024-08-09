import React, { useEffect, useState, useRef, useCallback } from "react";

const LiveStream = () => {
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Initialize WebSocket
  const initializeWebSocket = useCallback(() => {
    const userId = localStorage.getItem("userId") || "guest";
    // const wsUrl = `ws://localhost:8080/?stream-id=${userId}`; // for local test
    const wsUrl = `wss://desolate-eyrie-13966-6cda0935eea4.herokuapp.com/?user-id=${userId}`; // for live testing
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);

      switch (data.type) {
        case "chat":
          setMessages((prevMessages) => [...prevMessages, data]);
          break;
        case "offer":
          await handleReceiveOffer(data.offer);
          break;
        case "answer":
          await handleReceiveAnswer(data.answer);
          break;
        case "candidate":
          setTimeout(() => {
            handleReceiveCandidate(data.candidate);
          }, 4000);
          break;
        default:
          console.log("Unknown message type:", data.type);
          break;
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, []);

  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [initializeWebSocket]);

  useEffect(() => {
    if (streaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
  }, [streaming]);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current.send(
            JSON.stringify({ type: "candidate", candidate: event.candidate })
          );
        }
      };

      peerConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      console.log("Creating offer...");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Offer created and set as local description:", offer);

      wsRef.current.send(JSON.stringify({ type: "offer", offer }));
    } catch (error) {
      console.error("Error starting streaming:", error);
    }
  };

  const stopStreaming = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    localStreamRef.current = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleReceiveOffer = async (offer) => {
    try {
      console.log("Received offer:", offer);

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current.send(
            JSON.stringify({ type: "candidate", candidate: event.candidate })
          );
        }
      };

      peerConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      console.log("Offer set as remote description.");

      console.log("Creating answer...");
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("Answer created and set as local description:", answer);

      wsRef.current.send(JSON.stringify({ type: "answer", answer }));
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleReceiveAnswer = async (answer) => {
    try {
      if (peerConnectionRef.current) {
        console.log(
          "Current signaling state:",
          peerConnectionRef.current.signalingState
        );
        console.log("Received answer:", answer);

        if (peerConnectionRef.current.signalingState === "have-local-offer") {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Answer set successfully.");
        } else {
          console.warn(
            "Received answer in wrong state:",
            peerConnectionRef.current.signalingState
          );
        }
      } else {
        console.error("Peer connection is not initialized.");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleReceiveCandidate = async (candidate) => {
    try {
      if (peerConnectionRef.current) {
        console.log("Adding ICE candidate:", candidate);
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        console.error("Peer connection is not ready.");
      }
    } catch (error) {
      console.error("Error adding received ICE candidate:", error);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const message = { type: "chat", content: chatInput };
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        setMessages((prevMessages) => [...prevMessages, message]); // Update the chat for the sender
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
      <div className="stream-video w-25">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: "100%", display: streaming ? "block" : "none" }}
        />
        {
          (console.log("streaming", streaming),
          console.log("localVideoRef", localVideoRef),
          console.log("remoteVideoRef", remoteVideoRef))
        }
        {remoteVideoRef !== null && (
          <video
            ref={remoteVideoRef}
            autoPlay
            style={{
              width: "100%",
              //  display: !streaming ? "block" : "none"
            }}
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

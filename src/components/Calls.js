import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  ListGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import axios from "../api/axios";

const CallComponent = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState(null);
  const [showCallTypeModal, setShowCallTypeModal] = useState(false); // New state for modal
  const ws = useRef(null);
  const localPeerConnection = useRef(null);
  const remoteStream = useRef(new MediaStream());
  const pendingCandidates = useRef([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Define the endCall function
  const endCall = useCallback(() => {
    if (localPeerConnection.current) {
      localPeerConnection.current.close();
      localPeerConnection.current = null;
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const localStream = localVideoRef.current.srcObject;
      localStream.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach((track) => track.stop());
      remoteStream.current = new MediaStream();
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setSelectedUser(null);

    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "end",
          target: selectedUser ? selectedUser._id : null,
          userId: localStorage.getItem("userId"),
        })
      );
    }
  }, [selectedUser]);

  // Define the handleOffer function
  const handleOffer = useCallback(async (offer, fromUserId) => {
    try {
      if (!offer || !offer.type || !offer.sdp) {
        throw new Error("Invalid offer received");
      }

      if (localPeerConnection.current) {
        localPeerConnection.current.close();
      }

      localPeerConnection.current = new RTCPeerConnection();

      localPeerConnection.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current.addTrack(track);
        });
        remoteVideoRef.current.srcObject = remoteStream.current;
      };

      localPeerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          ws.current.send(
            JSON.stringify({
              type: "candidate",
              candidate: event.candidate,
              target: fromUserId,
            })
          );
        }
      };

      await localPeerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideoRef.current.srcObject = localStream;

      localStream.getTracks().forEach((track) => {
        localPeerConnection.current.addTrack(track, localStream);
      });

      const answer = await localPeerConnection.current.createAnswer();
      await localPeerConnection.current.setLocalDescription(answer);

      ws.current.send(
        JSON.stringify({
          type: "answer",
          answer: answer,
          target: fromUserId,
          userId: localStorage.getItem("userId"),
        })
      );

      pendingCandidates.current.forEach((candidate) => {
        localPeerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });
      pendingCandidates.current = [];
      setIsCallActive(true);
    } catch (err) {
      setError("Could not handle the offer. Please try again.");
    }
  }, []);

  // Define the handleAnswer function
  const handleAnswer = useCallback(async (answer) => {
    try {
      await localPeerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (err) {
      setError("Could not handle the answer. Please try again.");
    }
  }, []);

  // Define the handleCandidate function
  const handleCandidate = useCallback(async (candidate) => {
    try {
      if (localPeerConnection.current) {
        await localPeerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        pendingCandidates.current.push(candidate);
      }
    } catch (err) {
      setError("Could not add ICE candidate.");
    }
  }, []);

  // Define the handleSignalingData function
  const handleSignalingData = useCallback(
    (message) => {
      const data = JSON.parse(message.data);

      switch (data.type) {
        case "incoming_call":
          const incomingUser = users.find((user) => user._id === data.from);
          if (incomingUser) {
            setSelectedUser(incomingUser);
            handleOffer(data.offer, incomingUser._id);
          } else {
            console.error("User not found for incoming call");
          }
          break;
        case "call_accepted":
          handleAnswer(data.answer);
          break;
        case "candidate":
          handleCandidate(data.candidate);
          break;
        case "end":
          endCall();
          break;
        default:
          break;
      }
    },
    [users, endCall, handleOffer, handleAnswer, handleCandidate]
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    // const wsUrl = `ws://localhost:8080/?user-id=${userId}`;     // for local test
    const wsUrl = `wss://desolate-eyrie-13966-6cda0935eea4.herokuapp.com/?user-id=${userId}`; // for live testing
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = handleSignalingData;

    return () => {
      ws.current.close();
    };
  }, [handleSignalingData]);

  // Define the startCall function
  const startCall = useCallback(async (user, video = true) => {
    if (!user) {
      setError("Please select a user to call.");
      return;
    }

    setSelectedUser(user);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true,
      });
      localVideoRef.current.srcObject = localStream;

      localPeerConnection.current = new RTCPeerConnection();

      localStream.getTracks().forEach((track) => {
        localPeerConnection.current.addTrack(track, localStream);
      });

      localPeerConnection.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current.addTrack(track);
        });
        remoteVideoRef.current.srcObject = remoteStream.current;
      };

      localPeerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          ws.current.send(
            JSON.stringify({
              type: "candidate",
              candidate: event.candidate,
              target: user._id,
            })
          );
        }
      };

      const offer = await localPeerConnection.current.createOffer();
      await localPeerConnection.current.setLocalDescription(offer);

      ws.current.send(
        JSON.stringify({
          type: "call",
          offer: offer,
          target: user._id,
          userId: localStorage.getItem("userId"),
          callType: video ? "video" : "voice",
        })
      );

      setIsCallActive(true);
    } catch (err) {
      setError("Could not start the call. Please try again.");
    }
  }, []);

  const handleUserSelection = (user) => {
    setSelectedUser(user);
    setShowCallTypeModal(true); // Show modal when a user is selected
  };

  const handleCallTypeSelection = (video) => {
    startCall(selectedUser, video);
    setShowCallTypeModal(false); // Hide modal after call type is selected
  };

  return (
    <Container>
      <Row>
        <Col md={6}>
          <h3>Users</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item
                key={user._id}
                action
                active={selectedUser && selectedUser._id === user._id}
                onClick={() => handleUserSelection(user)} // Use handleUserSelection
              >
                {user.username}
                {user.online && <Badge bg="success">Online</Badge>}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={6}>
          <h3>Video Call</h3>
          <div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{ width: "100%" }}
            />
            <video ref={remoteVideoRef} autoPlay style={{ width: "100%" }} />
          </div>
          <Button variant="danger" onClick={endCall} disabled={!isCallActive}>
            End Call
          </Button>
        </Col>
      </Row>

      <Modal
        show={showCallTypeModal}
        onHide={() => setShowCallTypeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Call Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            variant="primary"
            onClick={() => handleCallTypeSelection(true)}
            className="me-2"
          >
            Video Call
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCallTypeSelection(false)}
          >
            Voice Call
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CallComponent;

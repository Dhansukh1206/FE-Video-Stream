import React, { useState, useRef, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";

const CallComponent = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState(null);

  const ws = useRef(null);
  const localPeerConnection = useRef(null);
  const remoteStream = useRef(new MediaStream());

  const handleSignalingData = useCallback((message) => {
    const data = JSON.parse(message.data);

    switch (data.type) {
      case "offer":
        handleOffer(data.offer);
        break;
      case "answer":
        handleAnswer(data.answer);
        break;
      case "candidate":
        handleCandidate(data.candidate);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    ws.current = new WebSocket("ws://https://desolate-eyrie-13966-6cda0935eea4.herokuapp.com");
    ws.current.onmessage = handleSignalingData;

    return () => {
      ws.current.close();
    };
  }, [handleSignalingData]);

  const startCall = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
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
            })
          );
        }
      };

      const offer = await localPeerConnection.current.createOffer();
      await localPeerConnection.current.setLocalDescription(offer);

      ws.current.send(
        JSON.stringify({
          type: "offer",
          offer: offer,
        })
      );

      setIsCallActive(true);
    } catch (err) {
      setError("Could not start the call. Please try again.");
      console.error(err);
    }
  };

  const handleOffer = async (offer) => {
    try {
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
        })
      );
    } catch (err) {
      setError("Could not handle the offer. Please try again.");
      console.error(err);
    }
  };

  const handleAnswer = (answer) => {
    localPeerConnection.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleCandidate = (candidate) => {
    localPeerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const endCall = () => {
    localPeerConnection.current.close();
    setIsCallActive(false);
    remoteStream.current = new MediaStream();
  };

  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col md={6} className="text-center">
          <h2>Video Call</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-100 mb-3"
            style={{ maxHeight: "200px" }}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-100 mb-3"
            style={{ maxHeight: "200px" }}
          />
          {!isCallActive ? (
            <Button onClick={startCall} variant="success">
              Start Call
            </Button>
          ) : (
            <Button onClick={endCall} variant="danger">
              End Call
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CallComponent;

import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Alert,
  Button,
} from "react-bootstrap";
import axios from "../api/axios";

const ShortVideo = () => {
  const videoRefs = useRef([]);
  const fileInputRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

  const fetchVideos = async () => {
    try {
      const response = await axios.get("/videos");
      const ss = response.data.reverse();
      setVideos(ss);
    } catch (error) {
      console.error("Error fetching videos", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handlePlay = (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handlePlay, options);

    const currentVideos = videoRefs.current;

    currentVideos.forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      currentVideos.forEach((video) => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, [videos]);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await axios.post("/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response =>", response);
      setMessage("Upload successful!");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        setMessage("");
      }, [1500]);
      setVideos([]);
    } catch (error) {
      setMessage("Upload failed!");
    }
    fetchVideos();
  };

  return (
    <Container
      fluid
      className="d-flex flex-column"
      style={{ height: "100vh", overflowY: "auto", padding: "10px" }}
    >
      <Row className="justify-content-center">
        <Col md={6}>
          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h1 className="text-center mb-4">Upload Video</h1>
            <Form onSubmit={handleUpload}>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ padding: "6px 12px", borderRadius: "4px" }}
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={fileInputRef?.current?.value === "" ? true : false}
                style={{ padding: "10px", fontSize: "16px" }}
              >
                Upload
              </Button>
            </Form>
            {message && (
              <Alert
                variant={message.includes("success") ? "success" : "danger"}
                className="mt-3"
              >
                {message}
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {videos?.length === 0 ? (
        <div className="d-flex justify-content-center">
          <h2 className="text-secondary">There is no video!</h2>
        </div>
      ) : (
        <Row>
          {videos &&
            videos?.map((video, index) => (
              <Col key={index} xs={12} className="mt-3">
                <Card className="mx-auto" style={{ maxWidth: "550px" }}>
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    muted
                    controls
                    width="100%"
                    height="auto"
                    style={{ objectFit: "cover" }}
                  >
                    <source src={`${video.filePath}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <i
                      className="bi bi-hand-thumbs-up me-3"
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-chat-dots me-3"
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-share"
                      style={{ cursor: "pointer" }}
                    ></i>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      )}
    </Container>
  );
};

export default ShortVideo;

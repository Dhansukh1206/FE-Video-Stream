import React, { useState } from "react";
import axios from "../api/axios";

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

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
      setMessage("Upload successful!");
    } catch (error) {
      setMessage("Upload failed!");
    }
  };

  return (
    <div style={{ border: "1px solid black"}}>
      <h1>Upload Video</h1>
      <form onSubmit={handleUpload}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VideoUpload;

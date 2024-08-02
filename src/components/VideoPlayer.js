import React, { useState, useEffect } from "react";
import axios from "../api/axios";
const VideoPlayer = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("/videos");
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos", error);
      }
    };
    fetchVideos();
  }, []);

  console.log("videos", videos);

  return (
    <div style={{ border: "1px solid black" }}>
      <h1>Video Playback</h1>
      {videos.map((video) => {
        console.log("video", video);
        return (
          <div key={video.filePath} className="text-center">
            <video width="400" controls>
              <source src={`${video.filePath}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      })}
    </div>
  );
};

export default VideoPlayer;

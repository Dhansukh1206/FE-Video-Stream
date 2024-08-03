import axios from "axios";

const instance = axios.create({
  baseURL: "https://desolate-eyrie-13966-6cda0935eea4.herokuapp.com/api",
  // baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;

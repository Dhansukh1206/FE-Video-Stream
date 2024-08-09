import axios from "axios";

const token = localStorage.getItem("token");

const instance = axios.create({
  baseURL: "https://desolate-eyrie-13966-6cda0935eea4.herokuapp.com/api",
  // baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

if (token) {
  setAuthToken(token);
}
export default instance;

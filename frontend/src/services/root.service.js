import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default instance;

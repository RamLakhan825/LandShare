// src/utils/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://landshare-2.onrender.com",
  withCredentials: true,
});

export default instance;

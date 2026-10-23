// src/utils/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 30000,
});
export const warmUpServer = () => instance.get("/health").catch(() => {});

export default instance;

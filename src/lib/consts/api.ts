import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PLESK_URL,
  timeout: 1000,
  withCredentials: true
});

export default api;

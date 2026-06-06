//axios.ts
import axios from "axios";
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : (import.meta.env.VITE_API_URL || "/api");
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

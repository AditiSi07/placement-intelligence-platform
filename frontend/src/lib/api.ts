import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://placement-iq-api.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach auth token to every request
api.interceptors.request.use((config) => {
  // We'll add Clerk token here in Week 2
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);


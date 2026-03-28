// Import axios library for making HTTP requests
import axios from 'axios';

// Set the base URL for API calls, using environment variable or default to localhost
// Use 127.0.0.1 to avoid IPv6 resolution issues on Windows
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Create an axios instance with the base URL configured
export const api = axios.create({
  baseURL,
});

// Add request interceptor to automatically include authentication token in headers
api.interceptors.request.use((config) => {
  // Retrieve JWT token from localStorage
  const token = localStorage.getItem('token');
  // If token exists, add it to Authorization header as Bearer token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log the outgoing request for debugging purposes
  console.log('API request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Pass successful responses through unchanged
  (error) => {
    // Log error details for debugging
    console.error('API response error:', error.response?.status, error.response?.config?.url, error.response?.data);
    // Reject the promise to propagate the error to the calling code
    return Promise.reject(error);
  },
);


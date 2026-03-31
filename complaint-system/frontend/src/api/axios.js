/**
 * axios.js
 * Configured Axios instance for all API calls.
 * Handles:
 *   - Base URL from environment variable
 *   - Automatic JWT token attachment
 *   - Token refresh on 401 (expired token)
 */

import axios from 'axios';

// Create Axios instance with base URL from .env
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response Interceptor
 * If any request returns 401 (Unauthorized / token expired),
 * automatically try to refresh the access token using the refresh token.
 * If refresh also fails, log the user out.
 */
api.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const savedTokens = localStorage.getItem('tokens');
        if (!savedTokens) throw new Error('No tokens');

        const { refresh } = JSON.parse(savedTokens);

        // Request a new access token using the refresh token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
          { refresh }
        );

        const newAccessToken = response.data.access;

        // Update tokens in localStorage
        const updatedTokens = { ...JSON.parse(savedTokens), access: newAccessToken };
        localStorage.setItem('tokens', JSON.stringify(updatedTokens));

        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the original failed request with the new token
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token also failed → clear everything and redirect to login
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

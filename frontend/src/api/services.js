/**
 * services.js
 * Centralized API service functions.
 * All API calls go through here — keeps components clean.
 */

import api from './axios';

// ==============================================================================
// AUTH SERVICES
// ==============================================================================

/**
 * Register a new user account.
 * @param {object} data - { username, email, password, password2 }
 */
export const registerUser = (data) =>
  api.post('/auth/register/', data);

/**
 * Login with username and password.
 * @param {object} data - { username, password }
 */
export const loginUser = (data) =>
  api.post('/auth/login/', data);

/**
 * Get the current logged-in user's profile.
 */
export const getUserProfile = () =>
  api.get('/auth/profile/');


// ==============================================================================
// COMPLAINT SERVICES
// ==============================================================================

/**
 * Get all complaints for the current user (or all complaints if admin).
 */
export const getComplaints = () =>
  api.get('/complaints/');

/**
 * Get a single complaint by ID.
 * @param {number} id - Complaint ID
 */
export const getComplaint = (id) =>
  api.get(`/complaints/${id}/`);

/**
 * Create a new complaint with optional image upload.
 * Uses FormData because we're sending a file (multipart/form-data).
 * @param {object} data - { title, description, location, image (File) }
 */
export const createComplaint = (data) => {
  const formData = new FormData();
  formData.append('title',       data.title);
  formData.append('description', data.description);
  formData.append('location',    data.location);

  // Only append image if one was selected
  if (data.image) {
    formData.append('image', data.image);
  }

  return api.post('/complaints/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',  // Required for file uploads
    },
  });
};

/**
 * Update the status of a complaint (Admin only).
 * @param {number} id     - Complaint ID
 * @param {string} status - New status: "Pending" | "In Progress" | "Resolved"
 */
export const updateComplaintStatus = (id, status) =>
  api.patch(`/complaints/${id}/status/`, { status });

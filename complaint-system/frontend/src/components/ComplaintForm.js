/**
 * ComplaintForm.js
 * Form for submitting a new complaint with image upload support.
 * Uses FormData to send multipart/form-data to the backend.
 */

import React, { useState } from 'react';
import { createComplaint } from '../api/services';

const INITIAL_STATE = {
  title:       '',
  description: '',
  location:    '',
  image:       null,
};

const ComplaintForm = ({ onSuccess, onCancel }) => {
  const [form, setForm]           = useState(INITIAL_STATE);
  const [preview, setPreview]     = useState(null);   // Image preview URL
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      // Create a local URL for the image preview
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createComplaint(form);
      setSuccess(true);
      setForm(INITIAL_STATE);
      setPreview(null);

      // Notify parent to refresh the complaint list
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1500);

    } catch (err) {
      const data = err.response?.data;
      // Show the first error message from the API
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Failed to submit complaint. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-700 text-xl text-slate-800">New Complaint</h2>
          <p className="text-sm text-slate-500 mt-0.5">Report a local issue in your area</p>
        </div>
        <button onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl
                        flex items-center gap-2 text-sm text-emerald-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
          Complaint submitted successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl
                        text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Broken streetlight on Main Ave"
            required
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm
                       text-slate-800 placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail…"
            required
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm
                       text-slate-800 placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Location <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. 123 Main St, Block 4"
            required
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm
                       text-slate-800 placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Photo <span className="text-slate-400 font-normal">(optional)</span>
          </label>

          {/* Image preview */}
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow
                           hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2
                              border-dashed border-slate-200 rounded-xl cursor-pointer
                              hover:border-indigo-400 hover:bg-indigo-50/40 transition-all duration-200">
              <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01
                     M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm text-slate-500">Click to upload a photo</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
                     rounded-xl text-sm transition-colors duration-200 disabled:opacity-60
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Submitting…
            </>
          ) : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;

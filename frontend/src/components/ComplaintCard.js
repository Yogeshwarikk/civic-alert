/**
 * ComplaintCard.js
 * Displays a single complaint with all its details.
 * Admin users see a status dropdown to update the complaint.
 */

import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { updateComplaintStatus } from '../api/services';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

const ComplaintCard = ({ complaint, onStatusUpdate }) => {
  const { isAdmin } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError]       = useState('');

  /**
   * Handle admin status change from dropdown.
   */
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === complaint.status) return;

    setUpdating(true);
    setError('');
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      // Notify parent to refresh the list
      onStatusUpdate();
    } catch {
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  // Format date nicely
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm
                    hover:shadow-md transition-shadow duration-300 overflow-hidden">

      {/* Image (if uploaded) */}
      {complaint.image && (
        <div className="h-44 bg-slate-100 overflow-hidden">
          <img
            src={complaint.image}
            alt="Complaint"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold text-slate-800 text-base leading-snug flex-1">
            {complaint.title}
          </h3>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {complaint.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
          {/* Location */}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243
                   a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {complaint.location}
          </span>

          {/* Date */}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5
                   a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </span>

          {/* Submitted by (admin view) */}
          {isAdmin && complaint.user && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {complaint.user.username}
            </span>
          )}
        </div>

        {/* Admin status update dropdown */}
        {isAdmin && (
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Update Status
            </label>
            <select
              value={complaint.status}
              onChange={handleStatusChange}
              disabled={updating}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2
                         text-slate-700 bg-slate-50 focus:outline-none focus:ring-2
                         focus:ring-indigo-400 focus:border-transparent disabled:opacity-50
                         cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {updating && (
              <p className="text-xs text-indigo-500 mt-1">Updating…</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;

/**
 * Dashboard.js - Fixed version (no JSX syntax errors)
 */

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintForm from '../components/ComplaintForm';
import { getComplaints } from '../api/services';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Resolved'];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const [complaints, setComplaints]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getComplaints();
      setComplaints(response.data);
    } catch {
      setError('Failed to load complaints. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredComplaints = complaints.filter((c) =>
    statusFilter === 'All' ? true : c.status === statusFilter
  );

  const counts = {
    'All':         complaints.length,
    'Pending':     complaints.filter(c => c.status === 'Pending').length,
    'In Progress': complaints.filter(c => c.status === 'In Progress').length,
    'Resolved':    complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="page-enter">
            <h1 className="font-display font-800 text-3xl text-slate-800">
              {isAdmin ? 'All Complaints' : 'My Complaints'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isAdmin
                ? ('Managing ' + complaints.length + ' complaint' + (complaints.length !== 1 ? 's' : '') + ' from all users')
                : ('Welcome back, ' + user?.username + '! Track your submitted complaints here.')}
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors duration-200 shadow-sm flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              {showForm ? 'Cancel' : 'New Complaint'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {showForm && !isAdmin && (
            <div className="lg:col-span-1 page-enter">
              <ComplaintForm
                onSuccess={() => { setShowForm(false); fetchComplaints(); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          <div className={showForm && !isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={
                    'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ' +
                    (statusFilter === filter
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300')
                  }
                >
                  {filter}
                  <span className={
                    'text-xs px-1.5 py-0.5 rounded-full font-semibold ' +
                    (statusFilter === filter ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')
                  }>
                    {counts[filter]}
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"/>
                    <div className="h-3 bg-slate-100 rounded w-full mb-2"/>
                    <div className="h-3 bg-slate-100 rounded w-2/3"/>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredComplaints.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-slate-600 text-lg mb-1">
                  No complaints found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  {statusFilter !== 'All'
                    ? ('No complaints with status ' + statusFilter + ' yet.')
                    : isAdmin
                      ? 'No complaints have been submitted yet.'
                      : 'You have not submitted any complaints yet. Click New Complaint to get started.'}
                </p>
                {!isAdmin && statusFilter === 'All' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Submit Your First Complaint
                  </button>
                )}
              </div>
            )}

            {!loading && filteredComplaints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="page-enter">
                    <ComplaintCard
                      complaint={complaint}
                      onStatusUpdate={fetchComplaints}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

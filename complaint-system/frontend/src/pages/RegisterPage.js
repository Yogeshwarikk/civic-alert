/**
 * RegisterPage.js
 * User registration page.
 * On success, auto-logs in the user and redirects to Dashboard.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/services';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side password confirmation check
    if (form.password !== form.password2) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const response = await registerUser(form);
      const { user, tokens } = response.data;

      // Auto-login after successful registration
      login(user, tokens);
      navigate('/dashboard');

    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Show the first validation error from the backend
        const firstKey   = Object.keys(data)[0];
        const firstValue = data[firstKey];
        setError(Array.isArray(firstValue) ? firstValue[0] : firstValue);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900
                    flex items-center justify-center px-4 py-10">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl
                        shadow-2xl p-8 page-enter">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-violet-600 rounded-2xl items-center
                            justify-center mb-4 shadow-lg shadow-violet-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h1 className="font-display font-800 text-2xl text-white">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join CivicAlert to report local issues</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl
                            text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text" name="username" value={form.username}
                onChange={handleChange} placeholder="choose_a_username"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-slate-500 text-sm focus:outline-none
                           focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-slate-500 text-sm focus:outline-none
                           focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="at least 8 characters"
                required minLength={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-slate-500 text-sm focus:outline-none
                           focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password" name="password2" value={form.password2}
                onChange={handleChange} placeholder="repeat your password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-slate-500 text-sm focus:outline-none
                           focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 mt-2 bg-violet-600 hover:bg-violet-500 text-white
                         font-semibold rounded-xl text-sm transition-all duration-200
                         shadow-lg shadow-violet-500/20 disabled:opacity-60
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

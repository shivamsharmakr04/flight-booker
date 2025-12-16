// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import './Register.css';
import { useNotify } from '../components/NotificationSystem';

export default function Register() {
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      notify('warning', 'All fields are required');
      return;
    }

    setLoading(true);

    try {
      const { user, token } = await registerUser(name, email, password);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      notify('success', 'Registration successful 🎉');
      navigate('/signin');
    } catch (err) {
      notify('error', err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
        {/* Header with animated gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-blue-100 text-center text-sm">Register to store your bookings and use wallet features</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="relative group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
              <div className="relative">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="relative group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="you@example.com"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <div 
                  className="absolute right-3 top-3 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    password.length < 6 ? 'bg-red-200' : 
                    password.length < 10 ? 'bg-yellow-200' : 'bg-green-200'
                  }`}></div>
                  <span className={`text-xs ${
                    password.length < 6 ? 'text-red-600' : 
                    password.length < 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {password.length < 6 ? 'Weak' : password.length < 10 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.25 4.67c-.22-.67-.82-1.18-1.5-1.27H2.25c-.68.09-1.28.6-1.5 1.27-.15.45-.15.95 0 1.4.22.67.82 1.18 1.5 1.27h19.5c.68-.09 1.28-.6 1.5-1.27.15-.45.15-.95 0-1.4zM2.25 12c-.68.09-1.28.6-1.5 1.27-.15.45-.15.95 0 1.4.22.67.82 1.18 1.5 1.27h19.5c.68-.09 1.28-.6 1.5-1.27.15-.45.15-.95 0-1.4-.22-.67-.82-1.18-1.5-1.27H2.25zm0 9.33c-.68.09-1.28.6-1.5 1.27-.15.45-.15.95 0 1.4.22.67.82 1.18 1.5 1.27h19.5c.68-.09 1.28-.6 1.5-1.27.15-.45.15-.95 0-1.4-.22-.67-.82-1.18-1.5-1.27H2.25z" />
                </svg>
                Email
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
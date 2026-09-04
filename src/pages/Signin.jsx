import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { useNotify } from '../components/NotificationSystem';

export default function Signin({ setUser }) {
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDemoFill = () => {
    setEmail('john@example.com');
    setPassword('password123');
    notify('info', 'Demo credentials filled');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password) {
      notify('warning', 'Email and password required');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await loginUser(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);
      notify('success', 'Login successful');
      navigate('/');
    } catch {
      notify('error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-sky-400">
            ✈
          </div>
          <h2 className="text-xl font-black">Sign In to Flight Booker</h2>
          <p className="text-xs text-slate-300 mt-1">Access your bookings & SkyWallet balance</p>
          
          <button
            type="button"
            onClick={handleDemoFill}
            className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold text-sky-300 border border-slate-700"
          >
            Auto-fill Demo Account
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-2">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-700 font-bold hover:underline"
            >
              Register here
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
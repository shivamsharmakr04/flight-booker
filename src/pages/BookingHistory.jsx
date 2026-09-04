import React, { useEffect, useState, useMemo } from 'react';
import { useNotify } from '../components/NotificationSystem';
import { getHistory } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const { notify } = useNotify();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    getHistory()
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        notify('error', 'Failed to load booking history');
        setBookings([]);
        setLoading(false);
      });
  }, [token]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        (b.passenger_name || '').toLowerCase().includes(q) ||
        (b.pnr || '').toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.booking_time) - new Date(b.booking_time));
        break;
      case 'amount-asc':
        result.sort((a, b) => (a.amount_paid || 0) - (b.amount_paid || 0));
        break;
      case 'amount-desc':
        result.sort((a, b) => (b.amount_paid || 0) - (a.amount_paid || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time));
    }

    return result;
  }, [bookings, search, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        <p className="text-xs font-semibold text-slate-600">Retrieving boarding passes...</p>
      </div>
    );
  }

  if (!token || bookings.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
          ✈
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {!token ? 'Sign In Required' : 'No Bookings Found'}
        </h2>
        <p className="text-xs text-slate-600">
          {!token
            ? 'Please sign in to view your booking history and digital boarding passes.'
            : 'You haven’t booked any flight tickets yet.'}
        </p>
        <button
          onClick={() => navigate(!token ? '/signin' : '/')}
          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs"
        >
          {!token ? 'Sign In Now' : 'Search Flights'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Boarding Passes</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Manage and download your flight e-tickets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search Passenger or PNR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High ➔ Low</option>
          </select>
        </div>
      </div>

      {/* Boarding Passes */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredBookings.map((b, idx) => (
            <motion.div
              key={b._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Header Banner */}
              <div className="bg-slate-900 p-3.5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-sky-400">Boarding Pass</span>
                  <span className="text-slate-400 text-xs">• Confirmed Ticket</span>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-800 rounded font-mono text-xs font-bold text-slate-200">
                  PNR: {b.pnr}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passenger</div>
                  <div className="text-base font-extrabold text-slate-900">{b.passenger_name}</div>
                  <div className="text-xs text-slate-500">Booked On: {new Date(b.booking_time).toLocaleDateString()}</div>
                </div>

                <div className="text-left lg:text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Paid</div>
                  <div className="text-xl font-black text-slate-900">₹{Number(b.amount_paid).toLocaleString('en-IN')}</div>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <a
                    href={`http://localhost:4000/tickets/${b.pnr}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => notify('success', 'Downloading PDF ticket...')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm"
                  >
                    Download E-Ticket
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

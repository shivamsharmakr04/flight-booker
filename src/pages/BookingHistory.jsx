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
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm font-semibold text-slate-600">Retrieving your boarding passes...</p>
      </div>
    );
  }

  if (!token || bookings.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto my-16 p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4"
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {!token ? 'Sign In Required' : 'No Bookings Found'}
        </h2>
        <p className="text-xs text-slate-500">
          {!token
            ? 'Please sign in to view your flight reservations and digital boarding passes.'
            : 'You haven’t booked any flight tickets yet. Explore flights to get started!'}
        </p>
        <button
          onClick={() => navigate(!token ? '/signin' : '/')}
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all"
        >
          {!token ? 'Sign In Now' : 'Search Flights'}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Boarding Passes</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage and download your flight e-tickets</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by Passenger or PNR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="date-desc">Newest Bookings</option>
            <option value="date-asc">Oldest Bookings</option>
            <option value="amount-desc">Amount: High ➔ Low</option>
          </select>
        </div>
      </div>

      {/* Boarding Pass Ticket Grid */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredBookings.map((b, idx) => (
            <motion.div
              key={b._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden hover:shadow-xl transition-all group relative"
            >
              {/* Boarding Pass Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 font-bold text-sm">
                    ✈
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-300">Boarding Pass</div>
                    <div className="text-xs text-slate-300">Confirmed Flight Ticket</div>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-mono text-xs font-bold">
                  PNR: {b.pnr}
                </span>
              </div>

              {/* Ticket Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                
                {/* Passenger & Date */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Passenger</div>
                  <div className="text-lg font-extrabold text-slate-800">{b.passenger_name}</div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Booked On: {new Date(b.booking_time).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-600">Active</strong></span>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="text-left lg:text-center space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid</div>
                  <div className="text-2xl font-extrabold text-blue-700">₹{Number(b.amount_paid).toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-slate-400">Tax & Fees Included</div>
                </div>

                {/* Download Ticket Action & Simulated Barcode */}
                <div className="flex flex-col items-start lg:items-end justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  
                  {/* Barcode Graphic */}
                  <div className="h-6 w-32 bg-slate-200/70 rounded flex items-center justify-between px-1 opacity-60">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`h-full bg-slate-800 ${i % 3 === 0 ? 'w-1' : 'w-0.5'}`}></div>
                    ))}
                  </div>

                  <a
                    href={`http://localhost:4000/tickets/${b.pnr}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => notify('success', 'Downloading PDF ticket...')}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download E-Ticket</span>
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

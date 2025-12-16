import React, { useEffect, useState, useMemo } from 'react';
import { useNotify } from '../components/NotificationSystem';
import { getHistory } from '../api';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const { notify } = useNotify();
  const token = localStorage.getItem('token');

  // ✅ FETCH HISTORY + CLEAR ON LOGOUT
  useEffect(() => {
    // 🚨 USER LOGGED OUT
    if (!token) {
      setBookings([]);     // 🔥 REMOVE ALL DATA
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
  }, [token]); // 👈 REACTS TO LOGOUT

  // FILTER + SORT
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.passenger_name.toLowerCase().includes(q) ||
        b.pnr.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.booking_time) - new Date(b.booking_time));
        break;
      case 'amount-asc':
        result.sort((a, b) => a.amount_paid - b.amount_paid);
        break;
      case 'amount-desc':
        result.sort((a, b) => b.amount_paid - a.amount_paid);
        break;
      default:
        result.sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time));
    }

    return result;
  }, [bookings, search, sortBy]);

  // LOADING
  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ✅ LOGOUT OR EMPTY STATE
  if (!token || bookings.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-16">
        <h2 className="text-xl font-semibold">
          {!token ? 'Please login' : 'No bookings found'}
        </h2>
        <p className="mt-2">
          {!token
            ? 'Login to view your booking history.'
            : 'You haven’t booked any tickets yet.'}
        </p>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        My Booking History
      </h2>

      {/* FILTER */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search by Passenger or PNR"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      {/* BOOKINGS */}
      {filteredBookings.map(b => (
        <div
          key={b._id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">PNR</p>
              <p className="text-lg font-semibold text-indigo-600">{b.pnr}</p>

              <p className="mt-2 text-gray-700">
                <span className="font-medium">Passenger:</span> {b.passenger_name}
              </p>

              <p className="text-gray-700">
                <span className="font-medium">Booked On:</span>{' '}
                {new Date(b.booking_time).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-green-600">
                ₹{b.amount_paid}
              </p>

              {b.price_breakdown && (
                <div className="text-sm text-gray-600 mt-2">
                  Tax: ₹{b.price_breakdown.tax} | Service: ₹{b.price_breakdown.serviceCharge}
                </div>
              )}

              <a
                href={`http://localhost:4000/tickets/${b.pnr}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => notify('success', 'Downloading ticket...')}
                className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Download Ticket
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

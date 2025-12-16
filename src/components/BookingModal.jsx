// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotify } from './NotificationSystem';

export default function BookingModal({ flight, open, onClose, onConfirm, user }) {
  const { notify } = useNotify();

  /* ===== STATES (must come BEFORE useEffect) ===== */
  const [passengers, setPassengers] = useState([
    {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      passport: '',
      seat: '',
      class: 'economy'
    }
  ]);
  const [travelDate, setTravelDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  /* ===== PREVIEW PRICE + TIMER ===== */
  useEffect(() => {
    if (!open) return;

    fetch('http://localhost:4000/api/bookings/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ flightId: flight.flight_id,travelDate })
    })
      .then(r => r.json())
      .then(d => {
        setPriceBreakdown(d.priceBreakdown);
        setTimeLeft(Math.floor((d.expiresAt - Date.now()) / 1000));
      })
      .catch(() => {});
  }, [open, flight.flight_id]);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    if (!timeLeft) return;
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const addPassenger = () => {
    setPassengers([...passengers, {
      name: '',
      email: '',
      phone: '',
      passport: '',
      seat: '',
      class: 'economy'
    }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleConfirm = async () => {
    if (!travelDate) {
  notify('warning', 'Please select a travel date');
  return;
}
    if (!paymentMethod) {
  notify('warning', 'Please select a payment method');
  return;
}
    if (passengers.some(p => !p.name || !p.email || !p.phone)) {
      notify('warning', 'Please fill all required passenger details'); // ✅ replaced alert
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm({ passengers, paymentMethod });
      onClose();
    } catch (err) {
      console.error(err);
      notify('error', 'Booking failed. Please try again.'); // ✅ failure alert
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></motion.div>
      
      <motion.div 
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.95 }}
        className="z-50 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold">Confirm Booking</h3>
              <p className="text-blue-100 text-sm mt-1">Complete your flight reservation</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">{flight.airline}</div>
              <div className="text-sm text-blue-100">Flight {flight.flight_id}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Flight Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">From</div>
                <div className="font-semibold">{flight.departure_city}</div>
                <div className="text-sm text-gray-500">{flight.departure_time &&
   !isNaN(new Date(flight.departure_time)) &&
   new Date(flight.departure_time).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">To</div>
                <div className="font-semibold">{flight.arrival_city}</div>
                <div className="text-sm text-gray-500"> {flight.arrival_time &&
   !isNaN(new Date(flight.arrival_time)) &&
   new Date(flight.arrival_time).toLocaleString()}</div>
              </div>
            </div>
          </div>
                {/* Travel Date Selection */}
<div className="bg-gray-50 rounded-lg p-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Travel Date
  </label>
  <input
    type="date"
    value={travelDate}
    min={new Date().toISOString().split('T')[0]}
    onChange={(e) => setTravelDate(e.target.value)}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    required
  />

  {travelDate && (
    <div className="mt-2 text-sm text-gray-600">
      Selected Date: <span className="font-medium">{travelDate}</span>
    </div>
  )}
</div>

          {/* Passengers Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Passengers</h4>
              <button 
                onClick={addPassenger}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Passenger
              </button>
            </div>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">Passenger {index + 1}</h5>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                         type="tel"
                                                      value={passenger.phone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                updatePassenger(index, 'phone', val);
                              }}
                              pattern="[0-9]{10,15}"
                              minLength={10}
                              maxLength={15}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Enter 10–15 digit phone number"
                              required
                            />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seat Preference</label>
                      <select
                        value={passenger.seat}
                        onChange={(e) => updatePassenger(index, 'seat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Any</option>
                        <option value="window">Window</option>
                        <option value="aisle">Aisle</option>
                        <option value="middle">Middle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={passenger.class}
                        onChange={(e) => updatePassenger(index, 'class', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Payment Options */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  paymentMethod === 'wallet' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Wallet</div>
                    <div className="text-sm text-gray-500">Use wallet balance</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a1 1 0 011 1v4a1 1 0 01-1 1h-3a1 1 0 01-1-1V8a1 1 0 011-1h3zm-4 8v2m4-2v2" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-500">Pay with card</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  paymentMethod === 'upi' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">UPI</div>
                    <div className="text-sm text-gray-500">Pay via UPI</div>
                  </div>
                </div>
              </button>
              <button
  onClick={() => setPaymentMethod('netbanking')}
  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
    paymentMethod === 'netbanking'
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-gray-300'
  }`}
>
  <div className="font-medium">Net Banking</div>
</button>

<button
  onClick={() => setPaymentMethod('emi')}
  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
    paymentMethod === 'emi'
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-gray-300'
  }`}
>
  <div className="font-medium">EMI</div>
</button>

<button
  onClick={() => setPaymentMethod('counter')}
  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
    paymentMethod === 'counter'
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-gray-300'
  }`}
>
  <div className="font-medium">Pay at Counter</div>
</button>

            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">
  ₹{priceBreakdown?.baseFare ?? flight.base_price}
</span>

              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & Fees</span>
               <span className="font-medium">
  ₹{priceBreakdown?.tax ?? 0}
</span>

              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-medium">
  ₹{priceBreakdown?.serviceCharge ?? 0}
</span>

              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Total</span>
               <span className="font-bold text-lg text-blue-600">
  ₹{priceBreakdown?.total ?? flight.current_price}
</span>
              {timeLeft > 0 && (
  <div className="text-sm text-orange-600 font-medium mt-2">
    ⏳ Complete payment within {Math.floor(timeLeft / 60)}:
    {String(timeLeft % 60).padStart(2, '0')}
  </div>
)}

              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay & Book'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
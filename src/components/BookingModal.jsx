import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from './NotificationSystem';

export default function BookingModal({ flight, open, onClose, onConfirm, user }) {
  const { notify } = useNotify();

  const [step, setStep] = useState(1); // Step 1: Seat & Class, Step 2: Passenger Info, Step 3: Payment & Confirm

  const [passengers, setPassengers] = useState([
    {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      seat: '12A',
      class: 'economy'
    }
  ]);

  const [selectedSeatType, setSelectedSeatType] = useState('window'); // window, aisle, middle
  const [selectedSeatNo, setSelectedSeatNo] = useState('12A');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minute price lock timer

  const availableSeats = [
    { no: '12A', type: 'window', priceBonus: 0 },
    { no: '12B', type: 'middle', priceBonus: 0 },
    { no: '12C', type: 'aisle', priceBonus: 200 },
    { no: '14A', type: 'window', priceBonus: 0 },
    { no: '14B', type: 'middle', priceBonus: 0 },
    { no: '14C', type: 'aisle', priceBonus: 200 }
  ];

  /* ===== PREVIEW PRICE & TIMER ===== */
  useEffect(() => {
    if (!open) return;
    setStep(1);

    fetch('http://localhost:4000/api/bookings/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ flightId: flight.flight_id, travelDate })
    })
      .then(r => r.json())
      .then(d => {
        if (d.priceBreakdown) {
          setPriceBreakdown(d.priceBreakdown);
        }
        if (d.expiresAt) {
          setTimeLeft(Math.max(0, Math.floor((d.expiresAt - Date.now()) / 1000)));
        }
      })
      .catch(() => {});
  }, [open, flight.flight_id, travelDate]);

  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [open, timeLeft]);

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        name: '',
        email: '',
        phone: '',
        seat: `1${passengers.length + 4}A`,
        class: 'economy'
      }
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!travelDate) {
        notify('warning', 'Please select a valid travel date');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (passengers.some(p => !p.name || !p.email || !p.phone)) {
        notify('warning', 'Please fill in required details for all passengers');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      notify('warning', 'Please select a payment method');
      return;
    }

    if (paymentMethod === 'wallet' && user) {
      const totalAmount = priceBreakdown?.total ?? flight.current_price * passengers.length;
      if (user.wallet_balance < totalAmount) {
        notify('warning', `Insufficient wallet balance (₹${user.wallet_balance}). Please select another payment method.`);
        return;
      }
    }

    setLoading(true);
    try {
      await onConfirm({ passengers, paymentMethod });
      onClose();
    } catch (err) {
      console.error(err);
      notify('error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const totalAmountPaid = (priceBreakdown?.total ?? flight.current_price) * passengers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.96 }}
        className="z-50 bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 flex flex-col"
      >
        {/* Header with Flight Info */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase text-blue-100">
                {flight.airline} • {flight.flight_id}
              </span>
              <h3 className="text-2xl font-black mt-2 tracking-tight">Flight Reservation</h3>
              <p className="text-blue-100 text-xs mt-1">
                {flight.departure_city} ➔ {flight.arrival_city}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center text-xs font-semibold">
            <div className={`py-1.5 rounded-xl transition-all ${step === 1 ? 'bg-white text-blue-900 font-bold shadow-md' : 'text-blue-200'}`}>
              1. Seat & Date
            </div>
            <div className={`py-1.5 rounded-xl transition-all ${step === 2 ? 'bg-white text-blue-900 font-bold shadow-md' : 'text-blue-200'}`}>
              2. Passengers
            </div>
            <div className={`py-1.5 rounded-xl transition-all ${step === 3 ? 'bg-white text-blue-900 font-bold shadow-md' : 'text-blue-200'}`}>
              3. Payment
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 flex-1 space-y-6">
          
          {/* STEP 1: Date & Seat Selector */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Preferred Seat Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'window', label: 'Window Seat', desc: 'Best View' },
                    { id: 'aisle', label: 'Aisle Seat', desc: 'Extra Space' },
                    { id: 'middle', label: 'Middle Seat', desc: 'Standard' }
                  ].map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => setSelectedSeatType(seat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedSeatType === seat.id
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{seat.label}</div>
                      <div className="text-[11px] text-slate-500">{seat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Seat Picker Simulator Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                  <span>Available Flight Seats</span>
                  <span className="text-[11px] text-blue-600 font-semibold">Selected: {selectedSeatNo}</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {availableSeats.map((s) => (
                    <button
                      key={s.no}
                      type="button"
                      onClick={() => {
                        setSelectedSeatNo(s.no);
                        setSelectedSeatType(s.type);
                        updatePassenger(0, 'seat', s.no);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedSeatNo === s.no
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.no}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Passengers Information */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Passenger Details</h4>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"
                >
                  + Add Passenger
                </button>
              </div>

              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Passenger #{idx + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(idx)}
                        className="text-xs text-rose-600 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={p.name}
                      onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={p.email}
                      onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                      value={p.phone}
                      onChange={(e) => updatePassenger(idx, 'phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <select
                      value={p.class}
                      onChange={(e) => updatePassenger(idx, 'class', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="economy">Economy Class</option>
                      <option value="premium">Premium Economy</option>
                      <option value="business">Business Class</option>
                    </select>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: Payment Method & Confirmation */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'wallet', title: 'Wallet Balance', desc: user ? `Balance: ₹${user.wallet_balance}` : 'Sign in required' },
                    { id: 'card', title: 'Credit/Debit Card', desc: 'Instant Processing' },
                    { id: 'upi', title: 'UPI / GPay', desc: 'Google Pay, PhonePe' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === m.id
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{m.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Base Price ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
                  <span className="font-semibold">₹{(priceBreakdown?.baseFare ?? flight.current_price) * passengers.length}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Taxes & Convenience Fee</span>
                  <span className="font-semibold">₹{(priceBreakdown?.tax ?? 0) * passengers.length}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Grand Total</span>
                  <span className="text-xl font-extrabold text-blue-700">₹{totalAmountPaid.toLocaleString('en-IN')}</span>
                </div>

                {timeLeft > 0 && (
                  <div className="pt-2 text-[11px] text-amber-700 font-semibold flex items-center justify-between bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
                    <span>⏱ Fare Price Lock Active</span>
                    <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} min remaining</span>
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span>Confirming Booking...</span>
              ) : (
                <span>Pay & Book Now (₹{totalAmountPaid.toLocaleString('en-IN')})</span>
              )}
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
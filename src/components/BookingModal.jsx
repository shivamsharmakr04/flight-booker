import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from './NotificationSystem';
import { addWalletBalance } from '../api';

export default function BookingModal({ flight, open, onClose, onConfirm, user, setUser }) {
  const { notify } = useNotify();

  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState([
    {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      seat: '12A',
      class: 'economy'
    }
  ]);

  const [selectedSeatType, setSelectedSeatType] = useState('window');
  const [selectedSeatNo, setSelectedSeatNo] = useState('12A');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    name: user?.name || '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);

  const availableSeats = [
    { no: '12A', type: 'window' },
    { no: '12B', type: 'middle' },
    { no: '12C', type: 'aisle' },
    { no: '14A', type: 'window' },
    { no: '14B', type: 'middle' },
    { no: '14C', type: 'aisle' }
  ];

  const banks = [
    { id: 'HDFC', name: 'HDFC Bank' },
    { id: 'ICICI', name: 'ICICI Bank' },
    { id: 'SBI', name: 'State Bank of India' },
    { id: 'AXIS', name: 'Axis Bank' },
    { id: 'KOTAK', name: 'Kotak Bank' }
  ];

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

  const handleTopupWallet = async (amount = 2000) => {
    try {
      const res = await addWalletBalance(amount);
      if (res.user && setUser) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      notify('success', `Added ₹${amount.toLocaleString('en-IN')} to SkyWallet!`);
    } catch {
      notify('error', 'Wallet top-up failed');
    }
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
        notify('warning', 'Please fill in required passenger details');
        return;
      }
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    const totalAmount = (priceBreakdown?.total ?? flight.current_price) * passengers.length;

    if (paymentMethod === 'upi' && !upiId.trim()) {
      notify('warning', 'Please enter a valid UPI ID');
      return;
    }
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.cvv)) {
      notify('warning', 'Please complete Card Number and CVV details');
      return;
    }
    if (paymentMethod === 'wallet' && user) {
      if ((user.wallet_balance || 0) < totalAmount) {
        notify('warning', `Insufficient wallet balance. Tap "+ Top-up" to add funds.`);
        return;
      }
    }

    setProcessingPayment(true);
    setProcessingStatus('Connecting to SSL Gateway...');

    setTimeout(() => {
      setProcessingStatus(`Processing ${paymentMethod.toUpperCase()} Payment for ₹${totalAmount.toLocaleString('en-IN')}...`);
    }, 1000);

    setTimeout(async () => {
      setProcessingStatus('Payment Approved ✔ Generating E-Ticket...');
      try {
        await onConfirm({
          passengers,
          paymentMethod,
          paymentDetails: {
            upiId: paymentMethod === 'upi' ? upiId : undefined,
            cardLast4: paymentMethod === 'card' ? cardDetails.number.slice(-4) : undefined,
            bank: paymentMethod === 'netbanking' ? selectedBank : undefined
          }
        });
      } catch (err) {
        console.error(err);
        notify('error', 'Booking failed. Please try again.');
      } finally {
        setProcessingPayment(false);
      }
    }, 2000);
  };

  if (!open) return null;

  const totalAmountPaid = (priceBreakdown?.total ?? flight.current_price) * passengers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="z-50 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col relative"
      >
        
        {/* Processing Overlay */}
        <AnimatePresence>
          {processingPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-8 text-center text-white space-y-4 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              <h3 className="text-lg font-bold">Processing Real-Time Payment</h3>
              <p className="text-xs text-slate-300 font-mono animate-pulse">{processingStatus}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-slate-900 p-6 text-white rounded-t-2xl relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="px-2.5 py-0.5 bg-slate-800 rounded text-xs font-bold uppercase tracking-wider text-slate-300">
                {flight.airline} • {flight.flight_id}
              </span>
              <h3 className="text-xl font-extrabold mt-2">Flight Reservation & Payment</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {flight.departure_city} ➔ {flight.arrival_city}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-xs font-bold">
            <div className={`py-1 rounded-lg ${step === 1 ? 'bg-white text-slate-900 font-extrabold' : 'text-slate-400'}`}>
              1. Seat & Date
            </div>
            <div className={`py-1 rounded-lg ${step === 2 ? 'bg-white text-slate-900 font-extrabold' : 'text-slate-400'}`}>
              2. Passengers
            </div>
            <div className={`py-1 rounded-lg ${step === 3 ? 'bg-white text-slate-900 font-extrabold' : 'text-slate-400'}`}>
              3. Payment
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 space-y-5 text-slate-800">
          
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Preferred Seat Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'window', label: 'Window Seat' },
                    { id: 'aisle', label: 'Aisle Seat' },
                    { id: 'middle', label: 'Middle Seat' }
                  ].map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => setSelectedSeatType(seat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSeatType === seat.id
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">{seat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat Selection Simulator */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Available Seats</span>
                  <span className="text-blue-800">Selected: {selectedSeatNo}</span>
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
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        selectedSeatNo === s.no
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {s.no}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Passenger Details</h4>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  + Add Passenger
                </button>
              </div>

              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Passenger #{idx + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(idx)}
                        className="text-rose-700 hover:underline"
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={p.email}
                      onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                      value={p.phone}
                      onChange={(e) => updatePassenger(idx, 'phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                      required
                    />
                    <select
                      value={p.class}
                      onChange={(e) => updatePassenger(idx, 'class', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                    >
                      <option value="economy">Economy Class</option>
                      <option value="premium">Premium Economy</option>
                      <option value="business">Business Class</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Credit/Debit Card' },
                    { id: 'netbanking', label: 'Net Banking' },
                    { id: 'wallet', label: 'SkyWallet' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-300 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      <div className="text-xs truncate font-bold">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details Form */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                {paymentMethod === 'upi' && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Enter UPI ID</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. rahul@okicici"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-semibold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setUpiId('demo.passenger@upi')}
                        className="absolute right-2 top-1.5 text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Card Details</span>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setCardDetails({ name: user?.name || 'Rahul Sharma', number: '4532 8912 3456 7890', expiry: '12/28', cvv: '789' })}
                        className="absolute right-2 top-1.5 text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Select Net Banking Provider</span>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2 rounded-lg border text-left text-xs font-semibold ${
                            selectedBank === b.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          🏦 {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">SkyWallet Balance</div>
                      <div className="text-sm font-extrabold text-emerald-800">
                        ₹{Number(user?.wallet_balance || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTopupWallet(2000)}
                      className="px-3 py-1 bg-emerald-800 text-white rounded-lg text-xs font-bold"
                    >
                      + Top-up ₹2,000
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Base Price ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
                  <span className="font-bold">₹{(priceBreakdown?.baseFare ?? flight.current_price) * passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span className="font-bold">₹{(priceBreakdown?.tax ?? 0) * passengers.length}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">Total Payable</span>
                  <span className="text-lg font-black text-slate-900">₹{totalAmountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processingPayment}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm disabled:opacity-50"
            >
              Pay & Confirm Ticket (₹{totalAmountPaid.toLocaleString('en-IN')})
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
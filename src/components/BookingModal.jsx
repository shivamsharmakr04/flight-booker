import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from './NotificationSystem';
import { addWalletBalance } from '../api';

export default function BookingModal({ flight, open, onClose, onConfirm, user, setUser }) {
  const { notify } = useNotify();

  const [step, setStep] = useState(1); // Step 1: Seat & Date, Step 2: Passengers, Step 3: Payment & Confirm

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
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, wallet
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  
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

  const handleTopupWallet = async (amount = 2000) => {
    try {
      const res = await addWalletBalance(amount);
      if (res.user && setUser) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      notify('success', `Added ₹${amount.toLocaleString('en-IN')} to SkyWallet! 💳`);
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

    // Validate payment inputs
    if (paymentMethod === 'upi' && !upiId.trim()) {
      notify('warning', 'Please enter a valid UPI ID (e.g. name@upi)');
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

    // Start Real-Time Animated Payment Simulation
    setProcessingPayment(true);
    setProcessingStatus('Connecting to 256-Bit SSL Payment Gateway...');

    setTimeout(() => {
      setProcessingStatus(`Authorizing ${paymentMethod.toUpperCase()} Payment for ₹${totalAmount.toLocaleString('en-IN')}...`);
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
    }, 2200);
  };

  if (!open) return null;

  const totalAmountPaid = (priceBreakdown?.total ?? flight.current_price) * passengers.length;

  const getCardBrand = (num) => {
    if (num.startsWith('4')) return 'VISA';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('3')) return 'AMEX';
    if (num.startsWith('6')) return 'RuPay';
    return 'Card';
  };

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
        className="z-50 bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 flex flex-col relative"
      >
        
        {/* Real-time Payment Processing Overlay */}
        <AnimatePresence>
          {processingPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center text-white space-y-4 rounded-3xl"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-sky-400 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-sky-400">
                  🔒
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Real-Time Payment Processing</h3>
              <p className="text-xs text-sky-200 font-mono animate-pulse">{processingStatus}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white rounded-t-3xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase text-blue-100">
                {flight.airline} • {flight.flight_id}
              </span>
              <h3 className="text-2xl font-black mt-2 tracking-tight">Checkout & Payment</h3>
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
              3. Custom Payment
            </div>
          </div>
        </div>

        {/* Body Content */}
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
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

              {/* Seat Picker Grid */}
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

          {/* STEP 2: Passengers */}
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

          {/* STEP 3: Real-Time Payment Method Sub-Forms */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              
              {/* Payment Method Selector Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Real-Time Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: '📱' },
                    { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
                    { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                    { id: 'wallet', label: 'SkyWallet', icon: '👛' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 font-bold text-blue-800'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="text-lg">{m.icon}</div>
                      <div className="text-xs mt-1 truncate">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Payment Input Sub-Forms */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                
                {/* 1. UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Enter UPI ID / VPA</span>
                      <div className="flex gap-1">
                        {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              selectedUpiApp === app ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. rahul@okicici or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setUpiId('demo.passenger@upi')}
                        className="absolute right-2 top-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold"
                      >
                        Auto-Fill Demo UPI
                      </button>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      {['@okaxis', '@icici', '@ybl', '@paytm'].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => setUpiId((prev) => (prev.split('@')[0] || 'user') + handle)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Credit/Debit Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Card Details</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {getCardBrand(cardDetails.number)}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4532 8912 3456 7890)"
                        value={cardDetails.number}
                        maxLength={19}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCardDetails({ name: user?.name || 'Rahul Sharma', number: '4532 8912 3456 7890', expiry: '12/28', cvv: '789' })}
                        className="absolute right-2 top-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold"
                      >
                        Auto-Fill Demo Card
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="CVV (3 Digits)"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Net Banking Selector */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Select Your Net Banking Provider</span>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            selectedBank === b.id
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🏦 {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SkyWallet Form */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SkyWallet Balance</div>
                        <div className="text-lg font-extrabold text-emerald-600">
                          ₹{Number(user?.wallet_balance || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTopupWallet(2000)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                      >
                        + Top-up ₹2,000
                      </button>
                    </div>

                    {(user?.wallet_balance || 0) < totalAmountPaid && (
                      <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200/70">
                        ⚠️ Wallet balance is lower than total fare (₹{totalAmountPaid.toLocaleString('en-IN')}). Tap "+ Top-up" above to add funds instantly!
                      </p>
                    )}
                  </div>
                )}

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
              </div>

            </motion.div>
          )}

        </div>

        {/* Footer Buttons */}
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
              disabled={processingPayment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              🔒 Pay ₹{totalAmountPaid.toLocaleString('en-IN')} Now
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
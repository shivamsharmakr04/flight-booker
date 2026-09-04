const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Attempt = require('../models/Attempt');
const { generatePNR } = require('../utils/pnr');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const path = require('path');
const auth = require('../middleware/auth');

/* =======================
   SURGE PRICING LOGIC
   ======================= */
async function recordAttemptAndComputePrice(flightId, userId) {
  await Attempt.create({ flight_id: flightId, user_id: userId });

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const attempts = await Attempt.countDocuments({
    flight_id: flightId,
    createdAt: { $gte: fiveMinAgo }
  });

  const flight = await Flight.findOne({ flight_id: flightId });
  if (!flight) throw new Error('Flight not found');

  if (attempts >= 3) {
    flight.current_price = Math.round(flight.base_price * 1.10);
    flight.surge_applied_at = new Date();
  } else if (flight.surge_applied_at) {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (flight.surge_applied_at <= tenMinAgo) {
      flight.current_price = flight.base_price;
      flight.surge_applied_at = null;
    }
  }

  await flight.save();
  return flight.current_price || flight.base_price;
}

/* =======================
   TAX + FEES
   ======================= */
function calculateFinalAmount(baseFare) {
  const tax = Math.round(baseFare * 0.12);
  const serviceCharge = 99;
  const convenienceFee = Math.round(baseFare * 0.02);

  return {
    baseFare,
    tax,
    serviceCharge,
    convenienceFee,
    total: baseFare + tax + serviceCharge + convenienceFee
  };
}

/* =======================
   PRICE PREVIEW
   ======================= */
router.post('/preview', auth, async (req, res) => {
  try {
    const { flightId } = req.body;
    const baseFare = await recordAttemptAndComputePrice(flightId, req.user.id);
    const priceBreakdown = calculateFinalAmount(baseFare);

    res.json({
      priceBreakdown,
      expiresAt: Date.now() + 10 * 60 * 1000
    });
  } catch {
    res.status(500).json({ error: 'Price preview failed' });
  }
});

/* =======================
   CONFIRM BOOKING (REAL-TIME PAYMENTS)
   ======================= */
router.post('/book', auth, async (req, res) => {
  let booking;
  try {
    const { flightId, passengerName, paymentMethod, paymentDetails } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseFare = await recordAttemptAndComputePrice(flightId, user._id);
    const priceBreakdown = calculateFinalAmount(baseFare);

    // If payment method is wallet, verify and deduct balance
    if (paymentMethod === 'wallet') {
      if (user.wallet_balance < priceBreakdown.total) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      user.wallet_balance -= priceBreakdown.total;
      await user.save();
    } 
    // All other payment methods (UPI, Card, NetBanking, EMI) process successfully
    
    const flight = await Flight.findOne({ flight_id: flightId }).lean();
    const pnr = generatePNR();

    booking = await Booking.create({
      user: user._id,
      flight: flight._id,
      flight_snapshot: flight,
      passenger_name: passengerName,
      amount_paid: priceBreakdown.total,
      price_breakdown: priceBreakdown,
      payment_method: paymentMethod || 'wallet',
      payment_details: paymentDetails || {},
      payment_status: 'success',
      pnr
    });

    const pdfPath = path.join(__dirname, '../../tickets', `${pnr}.pdf`);
    await generateTicketPDF({
      passenger_name: passengerName,
      airline: flight.airline,
      flight_id: flight.flight_id,
      route: `${flight.departure_city} - ${flight.arrival_city}`,
      final_price: priceBreakdown.total,
      booking_time: booking.booking_time,
      pnr
    }, pdfPath);

    booking.ticket_path = pdfPath;
    await booking.save();

    res.json({
      success: true,
      pnr,
      ticketUrl: `/tickets/${pnr}.pdf`,
      user,
      priceBreakdown
    });
  } catch (err) {
    console.error('Booking Error:', err);
    if (booking?._id) await Booking.findByIdAndDelete(booking._id);
    res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
});

/* =======================
   WALLET TOP-UP
   ======================= */
router.post('/wallet/add', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const addAmount = Number(amount || 0);
    if (addAmount <= 0) return res.status(400).json({ error: 'Invalid top-up amount' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.wallet_balance = (user.wallet_balance || 0) + addAmount;
    await user.save();

    res.json({ success: true, wallet_balance: user.wallet_balance, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add wallet balance' });
  }
});

/* =======================
   BOOKING HISTORY
   ======================= */
router.get('/history', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ booking_time: -1 });

    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
});

module.exports = router;

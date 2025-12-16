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
  // record every attempt
  await Attempt.create({ flight_id: flightId, user_id: userId });

  // count attempts in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const attempts = await Attempt.countDocuments({
    flight_id: flightId,
    createdAt: { $gte: fiveMinAgo }
  });

  const flight = await Flight.findOne({ flight_id: flightId });
  if (!flight) throw new Error('Flight not found');

  // apply surge
  if (attempts >= 3) {
    flight.current_price = Math.round(flight.base_price * 1.10);
    flight.surge_applied_at = new Date();
  }
  // reset surge after 10 minutes
  else if (flight.surge_applied_at) {
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
   CONFIRM BOOKING
   ======================= */
router.post('/book', auth, async (req, res) => {
  let booking;
  try {
    const { flightId, passengerName, paymentMethod } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseFare = await recordAttemptAndComputePrice(flightId, user._id);
    const priceBreakdown = calculateFinalAmount(baseFare);

    if (paymentMethod === 'wallet') {
      if (user.wallet_balance < priceBreakdown.total) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      user.wallet_balance -= priceBreakdown.total;
      await user.save();
    } else {
      return res.status(402).json({
        error: 'Payment required',
        paymentMethod,
        amount: priceBreakdown.total
      });
    }

    const flight = await Flight.findOne({ flight_id: flightId }).lean();
    const pnr = generatePNR();

    booking = await Booking.create({
      user: user._id,
      flight: flight._id,
      flight_snapshot: flight,
      passenger_name: passengerName,
      amount_paid: priceBreakdown.total,
      price_breakdown: priceBreakdown,
      payment_method: paymentMethod,
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
    if (booking?._id) await Booking.findByIdAndDelete(booking._id);
    res.status(500).json({ error: 'Booking failed' });
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

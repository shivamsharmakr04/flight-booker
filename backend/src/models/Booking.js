const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },

  flight_snapshot: Object,
  passenger_name: String,

  amount_paid: Number,

  price_breakdown: {
    baseFare: Number,
    tax: Number,
    serviceCharge: Number,
    convenienceFee: Number,
    total: Number
  },

  payment_method: String,
  payment_status: String,

  booking_time: { type: Date, default: Date.now },
  pnr: String,
  ticket_path: String
});

module.exports = mongoose.model('Booking', BookingSchema);

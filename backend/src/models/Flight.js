const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  flight_id: { type: String, unique: true },
  airline: String,
  departure_city: String,
  arrival_city: String,
  base_price: Number,
  current_price: Number,
  surge_applied_at: Date
});

module.exports = mongoose.model('Flight', FlightSchema);

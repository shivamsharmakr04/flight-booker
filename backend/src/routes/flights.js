const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Attempt = require('../models/Attempt');
const mongoose = require('mongoose');

// search: returns 10 flights from DB. Support optional q params: departure, arrival, page/limit
router.get('/search', async (req, res) => {
  try {
    const { departure, arrival, page = 1 } = req.query;
    const filter = {};
    if(departure) filter.departure_city = { $regex: new RegExp(departure, 'i') };
    if(arrival) filter.arrival_city = { $regex: new RegExp(arrival, 'i') };

    const flights = await Flight.find(filter).limit(10).skip((page - 1) * 10).lean();
    // ensure current_price is set
    const now = new Date();
    const out = flights.map(f => {
      // reset surge if 10 minutes passed
      if(f.surge_applied_at) {
        const applied = new Date(f.surge_applied_at);
        if(now - applied > 1000 * 60 * 10) {
          f.current_price = f.base_price;
        } else {
          f.current_price = f.current_price || f.base_price;
        }
      } else {
        f.current_price = f.current_price || f.base_price;
      }
      return f;
    });

    res.json({ flights: out });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

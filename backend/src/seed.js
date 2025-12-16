require('dotenv').config();
const mongoose = require('mongoose');
const Flight = require('./models/Flight');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flightdb';

const seedFlights = [
  { flight_id: 'XG101', airline: 'AirX', departure_city: 'Delhi', arrival_city: 'Mumbai', base_price: 2200 },
  { flight_id: 'XG102', airline: 'AirX', departure_city: 'Mumbai', arrival_city: 'Delhi', base_price: 2300 },
  { flight_id: 'AB201', airline: 'BlueAir', departure_city: 'Bengaluru', arrival_city: 'Hyderabad', base_price: 2100 },
  { flight_id: 'AB202', airline: 'BlueAir', departure_city: 'Hyderabad', arrival_city: 'Bengaluru', base_price: 2150 },
  { flight_id: 'GO303', airline: 'GoFly', departure_city: 'Chennai', arrival_city: 'Kolkata', base_price: 2500 },
  { flight_id: 'GO304', airline: 'GoFly', departure_city: 'Kolkata', arrival_city: 'Chennai', base_price: 2450 },
  { flight_id: 'SK404', airline: 'SkyHigh', departure_city: 'Pune', arrival_city: 'Delhi', base_price: 2700 },
  { flight_id: 'SK405', airline: 'SkyHigh', departure_city: 'Delhi', arrival_city: 'Pune', base_price: 2600 },
  { flight_id: 'TR505', airline: 'TransIndia', departure_city: 'Surat', arrival_city: 'Ahmedabad', base_price: 2000 },
  { flight_id: 'TR506', airline: 'TransIndia', departure_city: 'Ahmedabad', arrival_city: 'Surat', base_price: 2050 },
  { flight_id: 'IN707', airline: 'IndiJet', departure_city: 'Varanasi', arrival_city: 'Lucknow', base_price: 2300 },
  { flight_id: 'IN708', airline: 'IndiJet', departure_city: 'Lucknow', arrival_city: 'Varanasi', base_price: 2350 }
];

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB for seeding');
  await Flight.deleteMany({});
  for (const f of seedFlights) {
    await Flight.create({
      ...f,
      current_price: f.base_price
    });
    console.log('Seeded', f.flight_id);
  }
  console.log('Seeding complete');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

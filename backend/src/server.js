require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const getMongoUri = require('./utils/mongoUri');

const PORT = process.env.PORT || 4000;

const defaultSeedFlights = [
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

async function autoSeedIfEmpty() {
  try {
    const count = await Flight.countDocuments();
    if (count === 0) {
      console.log('No flights in database. Auto-seeding initial flight inventory...');
      for (const f of defaultSeedFlights) {
        await Flight.create({ ...f, current_price: f.base_price });
      }
      console.log('Auto-seed completed successfully.');
    }
  } catch (err) {
    console.warn('Auto-seed check error:', err.message);
  }
}

async function startServer() {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET is required. Configure a long, random secret before starting the backend.');
  }

  await mongoose.connect(getMongoUri(), { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected successfully');
  await autoSeedIfEmpty();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch(async (err) => {
  console.error('Application startup failed:', err.message);
  process.exitCode = 1;
  await mongoose.disconnect();
});

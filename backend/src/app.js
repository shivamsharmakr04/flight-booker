const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const flightsRoute = require('./routes/flights');
const authRoute = require('./routes/auth');
const bookingsRoute = require('./routes/bookings');
const contactRoutes = require('./routes/contact');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(bodyParser.json());
app.use(express.json());

const pdfStorage = process.env.PDF_STORAGE || './tickets';
if(!fs.existsSync(pdfStorage)) fs.mkdirSync(pdfStorage, { recursive: true });

app.use('/api/flights', flightsRoute);
app.use('/api/auth', authRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/contact', contactRoutes);
app.use('/tickets', express.static(path.resolve(__dirname, '../tickets' )));

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const flightsRoute = require('./routes/flights');
const authRoute = require('./routes/auth');
const bookingsRoute = require('./routes/bookings');
const contactRoutes = require('./routes/contact');
const assistantRoute = require('./routes/assistant');
const fs = require('fs');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/+$/, ''))
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());

const pdfStorage = process.env.PDF_STORAGE || './tickets';
if(!fs.existsSync(pdfStorage)) fs.mkdirSync(pdfStorage, { recursive: true });

app.use('/api/flights', flightsRoute);
app.use('/api/auth', authRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/contact', contactRoutes);
app.use('/api/assistant', assistantRoute);
app.use('/tickets', express.static(path.resolve(__dirname, '../tickets' )));

// Health check endpoint for Render monitoring
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'flight-backend', timestamp: new Date().toISOString() }));

// If frontend build exists (dist), serve it automatically
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/tickets') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

module.exports = app;

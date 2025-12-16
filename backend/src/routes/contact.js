const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const contact = await Contact.create({ name, email, subject, message });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

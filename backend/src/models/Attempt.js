const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  flight_id: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// auto-delete attempts after 11 minutes
AttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 11 });

module.exports = mongoose.model('Attempt', AttemptSchema);

const mongoose = require('mongoose');

const watchListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
    // example: 'RELIANCE.BSE'
  },
  companyName: {
    type: String,
    required: true
    // example: 'Reliance Industries Ltd'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
    // user can add personal notes
  }
}, { timestamps: true });

// One user can't add same stock twice
watchListSchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('WatchList', watchListSchema);
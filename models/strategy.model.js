const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  infosStrategy: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Map',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bombSiteLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BombMapLocation',
    required: true,
  },
}, { timestamps: true });

const Strategy = mongoose.model('Strategy', strategySchema);
module.exports = Strategy;
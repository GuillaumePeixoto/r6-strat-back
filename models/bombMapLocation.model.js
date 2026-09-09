const mongoose = require('mongoose');

const bombMapLocationSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
    trim: true,
  },
  siteA: {
    x: { type: String, required: true },
    y: { type: String, required: true },
  },
  siteB: {
    x: { type: String, required: true },
    y: { type: String, required: true },
  },
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Map',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('BombMapLocation', bombMapLocationSchema);
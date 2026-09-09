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

const BombMapLocation = mongoose.model('BombMapLocation', bombMapLocationSchema);

module.exports = BombMapLocation;
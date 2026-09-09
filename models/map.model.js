const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  thumbnail: String,
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  floorCount: {
    type: Number,
    required: true,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Map', mapSchema);
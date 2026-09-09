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

mapSchema.virtual('bombMapLocations', {
  ref: 'BombMapLocation', // Collection to Link
  localField: '_id', // Key
  foreignField: 'map' // Element where the key is stored inside the linked collection
});

const Map = mongoose.model('Map', mapSchema);

module.exports = Map;
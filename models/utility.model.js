const mongoose = require('mongoose');

const utilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  iconUtility: {
    type: String,
    required: true,
  },
  maxUse: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Utility', utilitySchema);
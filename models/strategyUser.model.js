const mongoose = require('mongoose');

const strategyUserSchema = new mongoose.Schema({
  strategy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

strategyUserSchema.index({ strategy: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('StrategyUser', strategyUserSchema);
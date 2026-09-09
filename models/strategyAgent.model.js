const mongoose = require('mongoose');

const strategyAgentSchema = new mongoose.Schema({
  strategy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
}, { timestamps: true });

strategyAgentSchema.index({ strategy: 1, agent: 1 }, { unique: true });

module.exports = mongoose.model('StrategyAgent', strategyAgentSchema);
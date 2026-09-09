const mongoose = require('mongoose');

const agentUtilitySchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  utility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utility',
    required: true,
  },
}, { timestamps: true });

agentUtilitySchema.index({ agent: 1, utility: 1 }, { unique: true });

module.exports = mongoose.model('AgentUtility', agentUtilitySchema);
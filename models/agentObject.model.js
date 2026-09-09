const mongoose = require('mongoose');

const agentObjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  iconObject: {
    type: String,
    required: true,
  },
  maxUse: {
    type: Number,
    required: true,
    min: 0,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('AgentObject', agentObjectSchema);
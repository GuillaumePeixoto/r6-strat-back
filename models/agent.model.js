const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  iconAgent: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  utilities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utility',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

agentSchema.virtual('agentObject', {
  ref: 'AgentObject',
  localField: '_id',
  foreignField: 'agent',
});

module.exports = mongoose.model('Agent', agentSchema);
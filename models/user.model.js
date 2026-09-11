const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ['ROLE_USER'],
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Strategy',
    },
  ],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
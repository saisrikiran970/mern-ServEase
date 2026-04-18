const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // nullable for Google users
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    default: 'user'
  },
  googleId: String,
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 5
  }, // for workers
  totalEarnings: {
    type: Number,
    default: 0
  }, // for workers
  completedJobs: {
    type: Number,
    default: 0
  },
  serviceType: String, // for workers (e.g., "Plumbing")
  phone: String,
  avatar: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

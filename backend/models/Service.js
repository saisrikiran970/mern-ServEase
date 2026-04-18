const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Salon', 'Cleaning', 'Repair', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Service', 'Other'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);

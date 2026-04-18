const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  address: {
    street: String,
    city: String,
    pincode: String,
    landmark: String
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    enum: ['before', 'after'],
    required: true
  },
  totalAmount: Number,
  workerNote: String,
  rating: Number,
  review: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);

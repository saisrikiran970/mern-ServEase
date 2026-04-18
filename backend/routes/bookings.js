const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, getBookingById, cancelBooking, rateBooking } = require('../controllers/bookingController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/', protect, requireRole('user'), createBooking);
router.get('/my', protect, requireRole('user'), getMyBookings);
router.get('/', protect, requireRole('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, requireRole('user'), cancelBooking);
router.put('/:id/rate', protect, requireRole('user'), rateBooking);

module.exports = router;

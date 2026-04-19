const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, getWorkers, suspendUser, assignWorker, getRevenue, getAnalytics, getBookingPayment } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/workers', getWorkers);
router.put('/users/:id/suspend', suspendUser);
router.put('/bookings/:id/assign', assignWorker);
router.get('/bookings/:id/payment', getBookingPayment);
router.get('/revenue', getRevenue);
router.get('/analytics', getAnalytics);

module.exports = router;

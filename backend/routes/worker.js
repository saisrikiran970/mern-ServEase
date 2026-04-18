const express = require('express');
const router = express.Router();
const { getWorkerJobs, acceptJob, rejectJob, updateJobStatus, getEarnings, getStats } = require('../controllers/workerController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);
router.use(requireRole('worker'));

router.get('/jobs', getWorkerJobs);
router.put('/jobs/:id/accept', acceptJob);
router.put('/jobs/:id/reject', rejectJob);
router.put('/jobs/:id/status', updateJobStatus);
router.get('/earnings', getEarnings);
router.get('/stats', getStats);

module.exports = router;

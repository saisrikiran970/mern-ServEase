const express = require('express');
const router = express.Router();
const { getServices, getServiceById, getServicesByCategory, getWorkersByCategory, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/category/:cat', getServicesByCategory);
router.get('/workers/:cat', getWorkersByCategory);

router.post('/', protect, requireRole('admin'), createService);
router.put('/:id', protect, requireRole('admin'), updateService);
router.delete('/:id', protect, requireRole('admin'), deleteService);

module.exports = router;

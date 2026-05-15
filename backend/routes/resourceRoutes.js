const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  addResource,
  getAllResources,
  getResourceById,
  updateResourceQuantity,
  restockResource,
  getLowStockResources,
  getResourceStatistics,
} = require('../controllers/resourceController');

// All routes require authentication
router.use(auth);

// Get all resources
router.get('/', getAllResources);

// Get resource statistics
router.get('/stats/overview', getResourceStatistics);

// Get low stock resources
router.get('/alerts/low-stock', getLowStockResources);

// Add new resource
router.post('/', authorize('admin'), addResource);

// Get resource by ID
router.get('/:id', getResourceById);

// Update resource quantity (use)
router.put('/:id/use', authorize('staff', 'admin'), updateResourceQuantity);

// Restock resource
router.put('/:id/restock', authorize('admin'), restockResource);

module.exports = router;

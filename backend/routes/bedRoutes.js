const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  addBed,
  getAllBeds,
  getBedById,
  assignBedToPatient,
  freeBed,
  getBedStatistics,
} = require('../controllers/bedController');

// All routes require authentication
router.use(auth);

// Get all beds
router.get('/', getAllBeds);

// Get bed statistics
router.get('/stats/overview', getBedStatistics);

// Add new bed
router.post('/', authorize('admin'), addBed);

// Get bed by ID
router.get('/:id', getBedById);

// Assign bed to patient
router.post('/assign', authorize('staff', 'admin'), assignBedToPatient);

// Free bed
router.post('/free', authorize('staff', 'admin'), freeBed);

module.exports = router;

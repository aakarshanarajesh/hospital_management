const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  addSchedule,
  getAllSchedules,
  getScheduleById,
  getDoctorSchedule,
  assignPatientToSchedule,
  updateSchedule,
} = require('../controllers/doctorScheduleController');

// All routes require authentication
router.use(auth);

// Get all schedules
router.get('/', getAllSchedules);

// Add new schedule
router.post('/', authorize('admin'), addSchedule);

// Get doctor's schedule
router.get('/doctor/:doctorId', getDoctorSchedule);

// Get schedule by ID
router.get('/:id', getScheduleById);

// Assign patient to schedule
router.post('/assign', authorize('doctor', 'admin'), assignPatientToSchedule);

// Update schedule
router.put('/:id', authorize('doctor', 'admin'), updateSchedule);

module.exports = router;

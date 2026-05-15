const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  addPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  dischargePatient,
  deletePatient,
} = require('../controllers/patientController');

// All routes require authentication
router.use(auth);

// Get all patients
router.get('/', getAllPatients);

// Add new patient
router.post('/', authorize('doctor', 'admin'), addPatient);

// Get patient by ID
router.get('/:id', getPatientById);

// Update patient
router.put('/:id', authorize('doctor', 'admin'), updatePatient);

// Discharge patient
router.put('/:id/discharge', authorize('doctor', 'admin'), dischargePatient);

// Delete patient
router.delete('/:id', authorize('admin'), deletePatient);

module.exports = router;

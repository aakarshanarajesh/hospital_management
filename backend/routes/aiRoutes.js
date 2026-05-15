/**
 * AI/ML Features Routes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public endpoints
router.get('/service-health', aiController.getServiceHealth);
router.get('/hospital-stats', aiController.getHospitalStats);

// Protected endpoints (all authenticated users)
router.post('/predict-risk', auth, aiController.predictPatientRisk);
router.get('/patient-risk/:patientId', auth, aiController.getPatientRiskPrediction);
router.get('/high-risk-patients', auth, aiController.getHighRiskPatients);
router.get('/dashboard-stats', auth, aiController.getAIDashboardStats);
router.post('/ask-assistant', auth, aiController.askHospitalAssistant);

module.exports = router;

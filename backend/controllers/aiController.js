/**
 * AI/ML Features Controller
 * - Patient risk prediction
 * - Hospital assistant
 */

const Patient = require('../models/Patient');
const User = require('../models/User');
const Bed = require('../models/Bed');
const Resource = require('../models/Resource');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:10000';

/**
 * Predict patient risk
 * POST /api/ai/predict-risk
 */
exports.predictPatientRisk = async (req, res) => {
  try {
    const { patientId } = req.body;
    const healthMetrics = normalizeRiskInput(req.body);

    // Validate required fields
    if (!healthMetrics) {
      return res.status(400).json({ error: 'Health metrics required' });
    }

    const requiredMetrics = [
      'age',
      'heart_rate',
      'systolic_bp',
      'diastolic_bp',
      'spo2',
      'fever',
      'cough',
      'breathing_difficulty',
    ];

    for (const metric of requiredMetrics) {
      if (healthMetrics[metric] === undefined) {
        return res.status(400).json({ error: `Missing metric: ${metric}` });
      }
    }

    // Call ML service
    let prediction;
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict-risk`, {
        age: healthMetrics.age,
        heart_rate: healthMetrics.heart_rate,
        systolic_bp: healthMetrics.systolic_bp,
        diastolic_bp: healthMetrics.diastolic_bp,
        spo2: healthMetrics.spo2,
        fever: healthMetrics.fever,
        cough: healthMetrics.cough,
        breathing_difficulty: healthMetrics.breathing_difficulty,
      });

      prediction = response.data;
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      return res.status(503).json({
        error: 'ML Service unavailable. Please ensure the ML service is running.',
      });
    }

    // If patientId provided, update patient with prediction
    if (patientId) {
      const patient = await Patient.findByIdAndUpdate(
        patientId,
        {
          riskLevel: prediction.risk_label || prediction.risk,
          riskPrediction: {
            riskLevel: prediction.risk_level,
            riskLabel: prediction.risk_label || prediction.risk,
            probability: prediction.probability || prediction.confidence,
            probabilities: prediction.probabilities,
            predictedAt: new Date(),
            healthMetrics: {
              heartRate: healthMetrics.heart_rate,
              systolicBp: healthMetrics.systolic_bp,
              diastolicBp: healthMetrics.diastolic_bp,
              spo2: healthMetrics.spo2,
              fever: healthMetrics.fever,
              cough: healthMetrics.cough,
              breathingDifficulty: healthMetrics.breathing_difficulty,
            },
          },
        },
        { new: true }
      );

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      return res.status(200).json({
        message: 'Risk prediction saved',
        risk: prediction.risk_label || prediction.risk,
        confidence: prediction.probability || prediction.confidence,
        patient,
        prediction,
      });
    }

    res.status(200).json({
      message: 'Risk prediction generated',
      risk: prediction.risk_label || prediction.risk,
      confidence: prediction.probability || prediction.confidence,
      prediction,
    });
  } catch (error) {
    console.error('Risk prediction error:', error);
    res.status(500).json({ error: 'Risk prediction failed' });
  }
};

function normalizeRiskInput(body) {
  if (body.healthMetrics) return body.healthMetrics;

  const symptoms = Array.isArray(body.symptoms)
    ? body.symptoms.map((symptom) => String(symptom).toLowerCase())
    : [];

  return {
    age: body.age,
    heart_rate: body.heart_rate,
    systolic_bp: body.systolic_bp || body.bp,
    diastolic_bp: body.diastolic_bp || (body.bp ? Number(body.bp) - 40 : undefined),
    spo2: body.spo2,
    fever: body.fever ?? (symptoms.includes('fever') ? 1 : 0),
    cough: body.cough ?? (symptoms.includes('cough') ? 1 : 0),
    breathing_difficulty:
      body.breathing_difficulty ??
      (symptoms.includes('breathing difficulty') ||
      symptoms.includes('breathing_difficulty')
        ? 1
        : 0),
  };
}

/**
 * Get high risk patients
 * GET /api/ai/high-risk-patients
 */
exports.getHighRiskPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      $or: [{ riskLevel: 'High' }, { 'riskPrediction.riskLevel': 2 }],
      status: 'admitted',
    })
      .select(
        'name age disease status bedId riskPrediction assignedDoctor'
      )
      .populate('assignedDoctor', 'name')
      .populate('bedId', 'bedNumber wardType');

    res.status(200).json({
      count: patients.length,
      patients: patients,
    });
  } catch (error) {
    console.error('High risk patients error:', error);
    res.status(500).json({ error: 'Failed to fetch high risk patients' });
  }
};

/**
 * Get risk prediction for a patient
 * GET /api/ai/patient-risk/:patientId
 */
exports.getPatientRiskPrediction = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).select(
      'name riskPrediction'
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!patient.riskPrediction) {
      return res.status(404).json({
        error: 'No risk prediction available for this patient',
      });
    }

    res.status(200).json({
      patientId: patient._id,
      patientName: patient.name,
      riskPrediction: patient.riskPrediction,
    });
  } catch (error) {
    console.error('Get patient risk error:', error);
    res.status(500).json({ error: 'Failed to fetch patient risk' });
  }
};

/**
 * Get AI dashboard statistics
 * GET /api/ai/dashboard-stats
 */
exports.getAIDashboardStats = async (req, res) => {
  try {
    // Get high risk count
    const highRiskCount = await Patient.countDocuments({
      $or: [{ riskLevel: 'High' }, { 'riskPrediction.riskLevel': 2 }],
      status: 'admitted',
    });

    // Get medium risk count
    const mediumRiskCount = await Patient.countDocuments({
      $or: [{ riskLevel: 'Medium' }, { 'riskPrediction.riskLevel': 1 }],
      status: 'admitted',
    });

    // Get low risk count
    const lowRiskCount = await Patient.countDocuments({
      $or: [{ riskLevel: 'Low' }, { 'riskPrediction.riskLevel': 0 }],
      status: 'admitted',
    });

    // Get total patients with predictions
    const totalWithPredictions = await Patient.countDocuments({
      'riskPrediction.riskLevel': { $exists: true },
      status: 'admitted',
    });

    // Get total admitted patients
    const totalAdmitted = await Patient.countDocuments({
      status: 'admitted',
    });

    res.status(200).json({
      highRiskPatients: highRiskCount,
      mediumRiskPatients: mediumRiskCount,
      lowRiskPatients: lowRiskCount,
      totalWithPredictions: totalWithPredictions,
      totalAdmitted: totalAdmitted,
      predictionCoverage: totalAdmitted > 0 ? (totalWithPredictions / totalAdmitted) * 100 : 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

/**
 * Ask hospital assistant
 * POST /api/ai/ask-assistant
 */
exports.askHospitalAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question cannot be empty' });
    }

    // Call ML service assistant
    let response;
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ask-assistant`, {
        question: question,
      });

      response = mlResponse.data;
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      return res.status(503).json({
        error: 'Assistant service unavailable. Please ensure the ML service is running.',
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({ error: 'Assistant query failed' });
  }
};

/**
 * Get hospital statistics for assistant context
 * GET /api/ai/hospital-stats
 */
exports.getHospitalStats = async (req, res) => {
  try {
    // Call ML service to get formatted stats
    let stats;
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/api/hospital-stats`);
      stats = response.data;
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      // Fallback: get stats from database
      stats = await getStatsFromDatabase();
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Hospital stats error:', error);
    res.status(500).json({ error: 'Failed to fetch hospital stats' });
  }
};

/**
 * Get hospital stats from database (fallback if ML service unavailable)
 */
async function getStatsFromDatabase() {
  const stats = {
    icu_beds_available: 0,
    general_beds_available: 0,
    private_beds_available: 0,
    total_patients: 0,
    high_risk_patients: 0,
    oxygen_cylinders_available: 0,
    ventilators_available: 0,
    beds_occupied: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    // Get bed stats
    const bedStats = await Bed.aggregate([
      {
        $group: {
          _id: '$wardType',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] },
          },
        },
      },
    ]);

    for (const stat of bedStats) {
      const available = stat.total - stat.occupied;
      if (stat._id === 'ICU') {
        stats.icu_beds_available = available;
      } else if (stat._id === 'General') {
        stats.general_beds_available = available;
      } else if (stat._id === 'Private') {
        stats.private_beds_available = available;
      }
    }

    // Get patient stats
    stats.total_patients = await Patient.countDocuments({
      status: 'admitted',
    });
    stats.high_risk_patients = await Patient.countDocuments({
      $or: [{ riskLevel: 'High' }, { 'riskPrediction.riskLevel': 2 }],
      status: 'admitted',
    });
    stats.beds_occupied = await Bed.countDocuments({ status: 'occupied' });

    // Get resource stats
    const resources = await Resource.find({});
    for (const resource of resources) {
      if (resource.resourceName === 'Oxygen_Cylinders') {
        stats.oxygen_cylinders_available = resource.availableQuantity;
      } else if (resource.resourceName === 'Ventilators') {
        stats.ventilators_available = resource.availableQuantity;
      }
    }
  } catch (error) {
    console.error('Database stats error:', error);
  }

  return stats;
}

/**
 * Get ML service health status
 * GET /api/ai/service-health
 */
exports.getServiceHealth = async (req, res) => {
  try {
    let mlServiceHealth = { status: 'unknown' };

    try {
      const response = await axios.get(`${ML_SERVICE_URL}/`);
      mlServiceHealth = response.data;
    } catch (error) {
      mlServiceHealth = {
        status: 'offline',
        error: 'ML Service is not responding',
      };
    }

    res.status(200).json({
      backend: { status: 'ok' },
      mlService: mlServiceHealth,
    });
  } catch (error) {
    console.error('Service health error:', error);
    res.status(500).json({ error: 'Failed to check service health' });
  }
};

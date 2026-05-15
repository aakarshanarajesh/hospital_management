const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide patient name'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Please provide patient age'],
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    disease: {
      type: String,
      required: [true, 'Please provide disease/condition'],
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Not predicted'],
      default: 'Not predicted',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    dischargeDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['admitted', 'discharged', 'critical'],
      default: 'admitted',
    },
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    medicalHistory: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    riskPrediction: {
      riskLevel: {
        type: Number,
        enum: [0, 1, 2], // 0: Low, 1: Medium, 2: High
      },
      riskLabel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
      },
      probability: Number,
      probabilities: {
        low: Number,
        medium: Number,
        high: Number,
      },
      predictedAt: Date,
      healthMetrics: {
        heartRate: Number,
        systolicBp: Number,
        diastolicBp: Number,
        spo2: Number,
        fever: Number, // 0 or 1
        cough: Number, // 0 or 1
        breathingDifficulty: Number, // 0 or 1
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);

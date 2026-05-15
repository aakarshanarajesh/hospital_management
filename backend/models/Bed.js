const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: [true, 'Please provide bed number'],
      unique: true,
    },
    wardType: {
      type: String,
      enum: ['ICU', 'General', 'Private'],
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['occupied', 'free', 'maintenance'],
      default: 'free',
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    amenities: {
      type: [String],
      default: [],
    },
    costPerDay: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bed', bedSchema);

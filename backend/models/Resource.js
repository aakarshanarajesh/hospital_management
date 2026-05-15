const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: [true, 'Please provide resource name'],
      enum: ['ICU_Beds', 'Ventilators', 'Oxygen_Cylinders', 'Monitors'],
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please provide total quantity'],
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    usedQuantity: {
      type: Number,
      default: 0,
    },
    ward: {
      type: String,
      enum: ['ICU', 'General', 'Emergency'],
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lowStockAlert: {
      type: Number,
      default: 5,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);

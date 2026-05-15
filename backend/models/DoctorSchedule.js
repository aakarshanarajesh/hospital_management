const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide schedule date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    patientsAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
    ],
  },
  { timestamps: true }
);

// Prevent double booking
doctorScheduleSchema.index(
  { doctorId: 1, date: 1, shift: 1 },
  { unique: true }
);

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);

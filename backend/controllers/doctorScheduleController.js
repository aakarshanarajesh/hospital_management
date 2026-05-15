const DoctorSchedule = require('../models/DoctorSchedule');
const User = require('../models/User');
const mongoose = require('mongoose');

// Add Doctor Schedule
const addSchedule = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, endTime, shift } = req.body;

    if (!doctorId || !date || !startTime || !endTime || !shift) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Please select a valid doctor' });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res
        .status(404)
        .json({ message: 'Doctor not found or invalid role' });
    }

    // Check for double booking
    const existingSchedule = await DoctorSchedule.findOne({
      doctorId,
      date: new Date(date),
      shift,
    });

    if (existingSchedule) {
      return res.status(400).json({
        message: 'Doctor already has a schedule for this date and shift',
      });
    }

    const schedule = new DoctorSchedule({
      doctorId,
      date,
      startTime,
      endTime,
      shift,
    });

    await schedule.save();

    res.status(201).json({
      message: 'Schedule added successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Schedules
const getAllSchedules = async (req, res, next) => {
  try {
    const { doctorId, date, shift } = req.query;
    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (shift) filter.shift = shift;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const schedules = await DoctorSchedule.find(filter)
      .populate('doctorId', 'name email department phone')
      .populate('patientsAssigned', 'name disease status');

    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// Get Schedule by ID
const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await DoctorSchedule.findById(req.params.id)
      .populate('doctorId', 'name email department phone')
      .populate('patientsAssigned', 'name disease status');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

// Get Doctor's Schedule
const getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const filter = { doctorId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const schedules = await DoctorSchedule.find(filter)
      .populate('doctorId', 'name email department')
      .populate('patientsAssigned', 'name disease status');

    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// Assign Patient to Schedule
const assignPatientToSchedule = async (req, res, next) => {
  try {
    const { scheduleId, patientId } = req.body;

    if (!scheduleId || !patientId) {
      return res.status(400).json({
        message: 'Schedule ID and Patient ID are required',
      });
    }

    const schedule = await DoctorSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (!schedule.patientsAssigned.includes(patientId)) {
      schedule.patientsAssigned.push(patientId);
      await schedule.save();
    }

    res.json({
      message: 'Patient assigned to schedule successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Update Schedule
const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, status } = req.body;

    const schedule = await DoctorSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (status) schedule.status = status;

    await schedule.save();

    res.json({
      message: 'Schedule updated successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSchedule,
  getAllSchedules,
  getScheduleById,
  getDoctorSchedule,
  assignPatientToSchedule,
  updateSchedule,
};

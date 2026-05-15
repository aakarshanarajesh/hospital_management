const Patient = require('../models/Patient');
const Bed = require('../models/Bed');

// Add Patient
const addPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      disease,
      medicalHistory,
      emergencyContact,
    } = req.body;

    if (!name || !age || !gender || !phone || !disease) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const patient = new Patient({
      name,
      age,
      gender,
      phone,
      disease,
      medicalHistory,
      emergencyContact,
      assignedDoctor: req.user.userId,
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient added successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Patients
const getAllPatients = async (req, res, next) => {
  try {
    const { status, riskLevel } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;

    const patients = await Patient.find(filter)
      .populate('bedId')
      .populate('assignedDoctor', 'name department');

    res.json(patients);
  } catch (error) {
    next(error);
  }
};

// Get Patient by ID
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('bedId')
      .populate('assignedDoctor', 'name department');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
};

// Update Patient
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age, phone, disease, status, medicalHistory } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (name) patient.name = name;
    if (age) patient.age = age;
    if (phone) patient.phone = phone;
    if (disease) patient.disease = disease;
    if (status) patient.status = status;
    if (medicalHistory) patient.medicalHistory = medicalHistory;

    await patient.save();

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    next(error);
  }
};

// Discharge Patient
const dischargePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: 'free',
        patientId: null,
      });
    }

    patient.status = 'discharged';
    patient.dischargeDate = new Date();
    patient.bedId = null;

    await patient.save();

    res.json({ message: 'Patient discharged successfully', patient });
  } catch (error) {
    next(error);
  }
};

// Delete Patient
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: 'free',
        patientId: null,
      });
    }

    await Patient.findByIdAndDelete(id);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  dischargePatient,
  deletePatient,
};

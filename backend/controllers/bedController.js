const Bed = require('../models/Bed');
const Patient = require('../models/Patient');

// Add Bed
const addBed = async (req, res, next) => {
  try {
    const { bedNumber, wardType, floor, amenities, costPerDay } = req.body;

    if (!bedNumber || !wardType || floor === undefined || !costPerDay) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingBed = await Bed.findOne({ bedNumber });
    if (existingBed) {
      return res.status(400).json({ message: 'Bed number already exists' });
    }

    const bed = new Bed({
      bedNumber,
      wardType,
      floor,
      amenities: amenities || [],
      costPerDay,
    });

    await bed.save();

    res.status(201).json({
      message: 'Bed added successfully',
      bed,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Beds
const getAllBeds = async (req, res, next) => {
  try {
    const { wardType, status } = req.query;
    const filter = {};
    if (wardType) filter.wardType = wardType;
    if (status) filter.status = status;

    const beds = await Bed.find(filter).populate('patientId');
    res.json(beds);
  } catch (error) {
    next(error);
  }
};

// Get Bed by ID
const getBedById = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id).populate('patientId');

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.json(bed);
  } catch (error) {
    next(error);
  }
};

// Assign Bed to Patient
const assignBedToPatient = async (req, res, next) => {
  try {
    const { bedId, patientId } = req.body;

    if (!bedId || !patientId) {
      return res
        .status(400)
        .json({ message: 'Bed ID and Patient ID are required' });
    }

    const bed = await Bed.findById(bedId);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.status === 'occupied') {
      return res.status(400).json({ message: 'Bed is already occupied' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // If patient already has a bed, free it
    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: 'free',
        patientId: null,
      });
    }

    bed.patientId = patientId;
    bed.status = 'occupied';
    await bed.save();

    patient.bedId = bedId;
    await patient.save();

    res.json({
      message: 'Bed assigned successfully',
      bed,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// Free Bed
const freeBed = async (req, res, next) => {
  try {
    const { bedId } = req.body;

    if (!bedId) {
      return res.status(400).json({ message: 'Bed ID is required' });
    }

    const bed = await Bed.findById(bedId);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.patientId) {
      await Patient.findByIdAndUpdate(bed.patientId, { bedId: null });
    }

    bed.patientId = null;
    bed.status = 'free';
    await bed.save();

    res.json({
      message: 'Bed freed successfully',
      bed,
    });
  } catch (error) {
    next(error);
  }
};

// Get Bed Statistics
const getBedStatistics = async (req, res, next) => {
  try {
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
    const freeBeds = await Bed.countDocuments({ status: 'free' });
    const maintenanceBeds = await Bed.countDocuments({ status: 'maintenance' });

    const icuBeds = await Bed.countDocuments({ wardType: 'ICU' });
    const occupiedICU = await Bed.countDocuments({
      wardType: 'ICU',
      status: 'occupied',
    });

    const icuOccupancyPercentage =
      icuBeds > 0 ? Math.round((occupiedICU / icuBeds) * 100) : 0;

    res.json({
      totalBeds,
      occupiedBeds,
      freeBeds,
      maintenanceBeds,
      occupancyPercentage: Math.round((occupiedBeds / totalBeds) * 100),
      icuOccupancyPercentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBed,
  getAllBeds,
  getBedById,
  assignBedToPatient,
  freeBed,
  getBedStatistics,
};

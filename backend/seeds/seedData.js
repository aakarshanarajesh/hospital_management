require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const DoctorSchedule = require('../models/DoctorSchedule');
const Resource = require('../models/Resource');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Bed.deleteMany({});
    await DoctorSchedule.deleteMany({});
    await Resource.deleteMany({});

    console.log('👥 Creating users...');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
    });

    // Create Doctors
    const doctor1 = await User.create({
      name: 'Dr. John Smith',
      email: 'john@hospital.com',
      password: 'doctor123',
      phone: '8765432109',
      role: 'doctor',
      department: 'Cardiology',
    });

    const doctor2 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@hospital.com',
      password: 'doctor123',
      phone: '7654321098',
      role: 'doctor',
      department: 'Neurology',
    });

    // Create Staff
    const staff1 = await User.create({
      name: 'Nurse Mary',
      email: 'mary@hospital.com',
      password: 'staff123',
      phone: '6543210987',
      role: 'staff',
    });

    const staff2 = await User.create({
      name: 'Technician Bob',
      email: 'bob@hospital.com',
      password: 'staff123',
      phone: '5432109876',
      role: 'staff',
    });

    console.log('🛏️ Creating beds...');

    // Create ICU Beds
    const icuBeds = await Bed.insertMany([
      {
        bedNumber: 'ICU-101',
        wardType: 'ICU',
        floor: 3,
        amenities: ['Ventilator', 'Monitor', 'Oxygen'],
        costPerDay: 5000,
      },
      {
        bedNumber: 'ICU-102',
        wardType: 'ICU',
        floor: 3,
        amenities: ['Ventilator', 'Monitor', 'Oxygen'],
        costPerDay: 5000,
      },
      {
        bedNumber: 'ICU-103',
        wardType: 'ICU',
        floor: 3,
        amenities: ['Ventilator', 'Monitor', 'Oxygen'],
        costPerDay: 5000,
      },
    ]);

    // Create General Ward Beds
    const generalBeds = await Bed.insertMany([
      {
        bedNumber: 'GW-201',
        wardType: 'General',
        floor: 2,
        amenities: ['Monitor', 'Oxygen'],
        costPerDay: 2000,
      },
      {
        bedNumber: 'GW-202',
        wardType: 'General',
        floor: 2,
        amenities: ['Monitor', 'Oxygen'],
        costPerDay: 2000,
      },
      {
        bedNumber: 'GW-203',
        wardType: 'General',
        floor: 2,
        amenities: ['Monitor', 'Oxygen'],
        costPerDay: 2000,
      },
      {
        bedNumber: 'GW-204',
        wardType: 'General',
        floor: 2,
        amenities: ['Monitor'],
        costPerDay: 1500,
      },
    ]);

    // Create Private Beds
    const privateBeds = await Bed.insertMany([
      {
        bedNumber: 'PV-301',
        wardType: 'Private',
        floor: 4,
        amenities: ['TV', 'WiFi', 'Attached Bath', 'Monitor'],
        costPerDay: 8000,
      },
      {
        bedNumber: 'PV-302',
        wardType: 'Private',
        floor: 4,
        amenities: ['TV', 'WiFi', 'Attached Bath', 'Monitor'],
        costPerDay: 8000,
      },
    ]);

    console.log('👨‍⚕️ Creating patients...');

    // Create Patients
    const patient1 = await Patient.create({
      name: 'Raj Kumar',
      age: 45,
      gender: 'male',
      phone: '9999999999',
      disease: 'Heart Attack',
      admissionDate: new Date(),
      status: 'admitted',
      assignedDoctor: doctor1._id,
      bedId: icuBeds[0]._id,
      medicalHistory: 'Hypertension, Diabetes',
      emergencyContact: {
        name: 'Priya Kumar',
        phone: '9999999998',
        relation: 'Spouse',
      },
    });

    const patient2 = await Patient.create({
      name: 'Anjali Verma',
      age: 38,
      gender: 'female',
      phone: '8888888888',
      disease: 'Pneumonia',
      admissionDate: new Date(),
      status: 'admitted',
      assignedDoctor: doctor2._id,
      bedId: generalBeds[0]._id,
      medicalHistory: 'Asthma',
      emergencyContact: {
        name: 'Vikram Verma',
        phone: '8888888887',
        relation: 'Brother',
      },
    });

    const patient3 = await Patient.create({
      name: 'Arjun Singh',
      age: 55,
      gender: 'male',
      phone: '7777777777',
      disease: 'Stroke',
      admissionDate: new Date(),
      status: 'critical',
      assignedDoctor: doctor2._id,
      bedId: icuBeds[1]._id,
      medicalHistory: 'High Blood Pressure',
      emergencyContact: {
        name: 'Neha Singh',
        phone: '7777777776',
        relation: 'Daughter',
      },
    });

    // Update bed status to occupied
    await Bed.findByIdAndUpdate(icuBeds[0]._id, {
      status: 'occupied',
      patientId: patient1._id,
    });
    await Bed.findByIdAndUpdate(generalBeds[0]._id, {
      status: 'occupied',
      patientId: patient2._id,
    });
    await Bed.findByIdAndUpdate(icuBeds[1]._id, {
      status: 'occupied',
      patientId: patient3._id,
    });

    console.log('📅 Creating doctor schedules...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule1 = await DoctorSchedule.create({
      doctorId: doctor1._id,
      date: today,
      startTime: '08:00',
      endTime: '14:00',
      shift: 'morning',
      patientsAssigned: [patient1._id],
    });

    const schedule2 = await DoctorSchedule.create({
      doctorId: doctor2._id,
      date: today,
      startTime: '14:00',
      endTime: '20:00',
      shift: 'afternoon',
      patientsAssigned: [patient2._id, patient3._id],
    });

    const schedule3 = await DoctorSchedule.create({
      doctorId: doctor1._id,
      date: tomorrow,
      startTime: '08:00',
      endTime: '14:00',
      shift: 'morning',
      patientsAssigned: [patient1._id],
    });

    console.log('📊 Creating resources...');

    const resources = await Resource.insertMany([
      {
        resourceName: 'ICU_Beds',
        totalQuantity: 10,
        availableQuantity: 7,
        usedQuantity: 3,
        ward: 'ICU',
        lowStockAlert: 3,
        isLowStock: true,
      },
      {
        resourceName: 'Ventilators',
        totalQuantity: 15,
        availableQuantity: 12,
        usedQuantity: 3,
        ward: 'ICU',
        lowStockAlert: 5,
      },
      {
        resourceName: 'Oxygen_Cylinders',
        totalQuantity: 50,
        availableQuantity: 35,
        usedQuantity: 15,
        ward: 'ICU',
        lowStockAlert: 10,
      },
      {
        resourceName: 'Monitors',
        totalQuantity: 40,
        availableQuantity: 32,
        usedQuantity: 8,
        ward: 'General',
        lowStockAlert: 8,
      },
    ]);

    console.log('✅ Database seeding completed!');
    console.log(`✅ Created: 1 Admin, 2 Doctors, 2 Staff`);
    console.log(`✅ Created: 9 Beds (3 ICU, 4 General, 2 Private)`);
    console.log(`✅ Created: 3 Patients`);
    console.log(`✅ Created: 3 Doctor Schedules`);
    console.log(`✅ Created: 4 Resources`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

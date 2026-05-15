const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  register,
  login,
  getProfile,
  getAllUsers,
  updateUser,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateUser);
router.get('/users', auth, authorize('admin'), getAllUsers);

module.exports = router;

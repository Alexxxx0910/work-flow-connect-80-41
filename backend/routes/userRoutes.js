
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Update user profile
router.put('/profile', userController.updateProfile);

// Update user photo
router.post('/profile/photo', userController.updatePhoto);

module.exports = router;

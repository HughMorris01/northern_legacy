const express = require('express');
const router = express.Router();
const { authUser, logoutUser } = require('../controllers/userController');

// When a POST request hits /api/users/login, trigger the authUser function
router.post('/login', authUser);

// When a POST request hits /api/users/logout, trigger the logoutUser function
router.post('/logout', logoutUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authUser, logoutUser, registerUser } = require('../controllers/userController');

// When a POST request hits /api/users/login, trigger the authUser function
router.post('/login', authUser);

// When a POST request hits /api/users/logout, trigger the logoutUser function
router.post('/logout', logoutUser);

router.post('/register', registerUser);

module.exports = router;
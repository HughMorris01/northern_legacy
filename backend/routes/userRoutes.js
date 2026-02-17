const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authUser, logoutUser, registerUser, saveUserCart, getUserCart, deleteAccount, getUserProfile, updateUserProfile } = require('../controllers/userController');

// When a POST request hits /api/users/login, trigger the authUser function
router.post('/login', authUser);

// When a POST request hits /api/users/logout, trigger the logoutUser function
router.post('/logout', logoutUser);

router.post('/register', registerUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteAccount);

// Retrieve user's cart from database on login and store to database on logout
router.route('/cart').get(protect, getUserCart).put(protect, saveUserCart);

module.exports = router;
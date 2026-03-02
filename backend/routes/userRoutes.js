const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authUser, logoutUser, registerUser, saveUserCart, getUserCart, deleteAccount, getUserProfile, updateUserProfile, googleAuth } = require('../controllers/userController');

router.post('/login', authUser);

router.post('/google', googleAuth);

router.post('/logout', logoutUser);

router.post('/register', registerUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteAccount);

router.route('/cart').get(protect, getUserCart).put(protect, saveUserCart);

module.exports = router;
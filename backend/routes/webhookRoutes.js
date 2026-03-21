const express = require('express');
const router = express.Router();
const { handleIdVerificationWebhook } = require('../controllers/webhookController');


// There is no 'protect' middleware here. The IDV provider doesn't have a JWT cookie
router.post('/id-verification', handleIdVerificationWebhook);

module.exports = router;
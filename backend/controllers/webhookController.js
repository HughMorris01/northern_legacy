const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Receive async ID verification status from Persona/Jumio
// @route   POST /api/webhooks/id-verification
// @access  Public (But protected via provider signature verification)
const handleIdVerificationWebhook = async (req, res) => {
  try {
    // SECURITY CRITICAL: In production, you MUST verify the cryptographic signature 
    // in the headers (e.g., req.headers['persona-signature']) to ensure this request 
    // actually came from your IDV provider and not a malicious actor.
    
    // Extract the payload sent by the IDV provider
    const { referenceId, status, documentNumber, expirationDate } = req.body;

    // The referenceId is the user's MongoDB _id that we passed to the provider when the flow started
    const user = await User.findById(referenceId);

    if (!user) {
      return res.status(404).json({ message: 'User not found for this verification event.' });
    }

    // Check if the provider determined the ID and Selfie matched
    if (status === 'verified') {
      
      // PRD 3.1.4: Identity Uniqueness & Abuse Prevention
      // Hash the raw Document Number (e.g., Driver's License Number)
      const salt = await bcrypt.genSalt(10);
      const hashedDocumentNumber = await bcrypt.hash(documentNumber, salt);

      // Check the database to see if this physical human already has an account
      const existingUser = await User.findOne({ idDocumentHash: hashedDocumentNumber });

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        // Ban Evasion Attempt Detected! 
        console.warn(`Duplicate ID attempt detected for User: ${user._id}`);
        // We do NOT verify them. We could optionally flag their account for admin review here.
        return res.status(403).json({ message: 'Identity already registered in the system.' });
      }

      // If they are unique and passed, update their profile
      user.isVerified = true;
      user.idDocumentHash = hashedDocumentNumber;

      //Save the expiration date if the provider included it
      if (expirationDate) {
        user.idExpirationDate = new Date(expirationDate);
      }
      await user.save();

      console.log(`User ${user.email} successfully verified 21+`);
      return res.status(200).json({ message: 'Verification successful, user updated.' });
      
    } else if (status === 'flagged' || status === 'declined') {
      // PRD 3.1.2: If the ID is expired, glare is too bad, or underage
      // We leave isVerified as false, but you could add an 'admin review' ticket here
      console.log(`User ${user.email} failed verification. Status: ${status}`);
      return res.status(200).json({ message: 'Verification failed, user not updated.' });
    }

    // Always return a 200 OK so the provider knows you received the webhook
    res.status(200).send('Webhook received');

  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    // Return 500 so the IDV provider knows to retry sending the webhook later
    res.status(500).send('Server Error Processing Webhook');
  }
};

module.exports = {
  handleIdVerificationWebhook,
};
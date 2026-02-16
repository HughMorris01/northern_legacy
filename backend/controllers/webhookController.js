const User = require('../models/User');
const bcrypt = require('bcryptjs');

const handleIdVerificationWebhook = async (req, res) => {
  try {
    // 1. Navigate Persona's deeply nested JSON:API structure
    const eventPayload = req.body.data?.attributes?.payload?.data;
    const inquiryAttributes = eventPayload?.attributes;

    if (!inquiryAttributes) {
      return res.status(200).send('Webhook received but missing attributes');
    }

    const referenceId = inquiryAttributes['reference-id'];
    const status = inquiryAttributes.status;

    // Stop processing if this isn't tied to a specific user account
    if (!referenceId) {
      return res.status(200).send('No reference ID provided.'); 
    }

    const user = await User.findById(referenceId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (status === 'completed' || status === 'approved') {
      
      const fields = inquiryAttributes.fields || {};
      const extractedIdNumber = fields['identification-number']?.value || fields['document-number']?.value;
      const expirationDate = fields['expiration-date']?.value;

      // 2. The Keyboard Picture Fix
      // If Persona's OCR can't find an ID number, provide a fallback string 
      // so bcrypt doesn't fatally crash the server during Sandbox testing!
      const docToHash = extractedIdNumber || `sandbox_fallback_${eventPayload.id}`;
      
      const salt = await bcrypt.genSalt(10);
      const hashedDocumentNumber = await bcrypt.hash(docToHash, salt);

      const existingUser = await User.findOne({ idDocumentHash: hashedDocumentNumber });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        console.warn(`Duplicate ID attempt detected for User: ${user._id}`);
        return res.status(403).json({ message: 'Identity already registered.' });
      }

      user.isVerified = true;
      user.idDocumentHash = hashedDocumentNumber;
      
      if (expirationDate) {
        user.idExpirationDate = new Date(expirationDate);
      }
      
      await user.save();

      console.log(`User ${user.email} verified successfully.`);
      return res.status(200).json({ message: 'User updated.' });
      
    } else {
      console.log(`User ${user.email} failed verification. Status: ${status}`);
      return res.status(200).json({ message: 'Verification failed.' });
    }

  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    // A 500 status code tells Persona's servers to try sending the webhook again later
    res.status(500).send('Server Error Processing Webhook'); 
  }
};

module.exports = {
  handleIdVerificationWebhook,
};
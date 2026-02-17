const User = require('../models/User');
const bcrypt = require('bcryptjs');

const handleIdVerificationWebhook = async (req, res) => {
  try {
    const eventPayload = req.body.data?.attributes?.payload?.data;
    const inquiryAttributes = eventPayload?.attributes;

    if (!inquiryAttributes) {
      return res.status(200).send('Webhook received but missing attributes');
    }

    const referenceId = inquiryAttributes['reference-id'];
    const status = inquiryAttributes.status;

    if (!referenceId) {
      return res.status(200).send('No reference ID provided.'); 
    }

    const user = await User.findById(referenceId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (status === 'completed' || status === 'approved') {
      const fields = inquiryAttributes.fields || {};
      const expirationDate = fields['expiration-date']?.value;

      // --- THE FIX: We must define this variable before using it! ---
      const extractedIdNumber = fields['identification-number']?.value || fields['document-number']?.value;

      // Now this line will work because extractedIdNumber actually exists (even if it's undefined)
      const docToHash = extractedIdNumber || `sandbox_fallback_${eventPayload.id}`;
      
      const salt = await bcrypt.genSalt(10);
      const hashedDocumentNumber = await bcrypt.hash(docToHash, salt);

      // Check for duplicate IDs (Ban Evasion Protection)
      const existingUser = await User.findOne({ idDocumentHash: hashedDocumentNumber });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        console.warn(`Duplicate ID attempt detected for User: ${user._id}`);
        return res.status(403).json({ message: 'Identity already registered.' });
      }

      user.isVerified = true;
      user.verificationRefNumber = eventPayload.id;
      user.idExpirationDate = expirationDate || 'Sandbox Mode';
      
      await user.save();
      console.log(`User ${user.email} verified. Expiry: ${user.idExpirationDate}`);
      return res.status(200).json({ message: 'User updated.' });
    }
     else {
      console.log(`User ${user.email} failed verification. Status: ${status}`);
      return res.status(200).json({ message: 'Verification failed.' });
    }

  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    res.status(500).send('Server Error Processing Webhook'); 
  }
};

module.exports = {
  handleIdVerificationWebhook,
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- THE MOCK DATA GENERATOR ---
const generateMockIDData = () => {
  const today = new Date();

  // 1. Generate DOB (Randomly between 22 and 50 years old to guarantee 21+)
  const age = Math.floor(Math.random() * (50 - 22 + 1)) + 22;
  const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());

  // 2. Generate Expiration Date (Randomly between 1 and 5 years in the future)
  const expYears = Math.floor(Math.random() * 5) + 1;
  const expDate = new Date(today.getFullYear() + expYears, today.getMonth(), today.getDate());

  // Returns strict YYYY-MM-DD format Strings
  return {
    dateOfBirth: dob.toISOString().split('T')[0],
    idExpirationDate: expDate.toISOString().split('T')[0]
  };
};

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
      
      // Fire the generator to get our compliant dates
      const mockData = generateMockIDData();
      
      // If Persona provides an actual expiration date, use it; otherwise use our mock date
      const expirationDate = fields['expiration-date']?.value || mockData.idExpirationDate;

      const extractedIdNumber = fields['identification-number']?.value || fields['document-number']?.value;
      const docToHash = extractedIdNumber || `sandbox_fallback_${eventPayload.id}`;
      
      const salt = await bcrypt.genSalt(10);
      const hashedDocumentNumber = await bcrypt.hash(docToHash, salt);

      const existingUser = await User.findOne({ idDocumentHash: hashedDocumentNumber });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        console.warn(`Duplicate ID attempt detected for User: ${user._id}`);
        return res.status(403).json({ message: 'Identity already registered.' });
      }

      // Stamp the user with the verified status and the new mock dates!
      user.isVerified = true;
      user.verificationRefNumber = eventPayload.id;
      user.dateOfBirth = mockData.dateOfBirth; // Guaranteed 21+
      user.idExpirationDate = expirationDate; 
      
      await user.save();
      console.log(`User ${user.email} verified. Mock DOB: ${user.dateOfBirth}, Expiry: ${user.idExpirationDate}`);
      return res.status(200).json({ message: 'User updated.' });
    } else {
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
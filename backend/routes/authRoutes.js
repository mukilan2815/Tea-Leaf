const express = require('express');
const User = require('../models/User');
const router = express.Router();
const crypto = require('crypto');

// Mock OTP Sender
const sendOtp = (phoneNumber, otp) => {
  console.log(`OTP for ${phoneNumber}: ${otp}`);
};

// Route to request OTP
router.post('/request-otp', async (req, res) => {
  const { phoneNumber, latitude, longitude } = req.body;

  if (!phoneNumber || phoneNumber.length !== 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const otp = crypto.randomInt(1000, 9999).toString(); // Generate 4-digit OTP
  sendOtp(phoneNumber, otp);

  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({ phoneNumber, otp, location: { latitude, longitude } });
    } else {
      user.otp = otp;
      user.location = { latitude, longitude };
    }

    await user.save();
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  try {
    const user = await User.findOne({ phoneNumber, otp });

    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

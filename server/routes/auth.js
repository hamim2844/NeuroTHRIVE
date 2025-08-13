const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendEmailVerification, sendSMSVerification } = require('../utils/notifications');
const { detectCountry, validatePhoneNumber } = require('../utils/geo');
const { generateDeviceFingerprint } = require('../utils/security');
const auth = require('../middleware/auth');
const router = express.Router();

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('username').trim().isLength({ min: 3 }),
  body('country').isIn(['BD', 'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN', 'PK', 'OTHER']),
  body('phoneNumber').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, firstName, lastName, username, country, phoneNumber, referralCode } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Validate phone number for Bangladesh users
    if (country === 'BD' && phoneNumber) {
      if (!validatePhoneNumber(phoneNumber, 'BD')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid phone number format for Bangladesh' 
        });
      }
    }

    // Detect country from IP if not provided
    const detectedCountry = country || detectCountry(req.ip);
    
    // Find referrer if referral code provided
    let referredBy = null;
    if (referralCode) {
      referredBy = await User.findByReferralCode(referralCode);
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username,
      country: detectedCountry,
      phoneNumber: country === 'BD' ? phoneNumber : undefined,
      referredBy: referredBy ? referredBy._id : null,
      ipAddress: req.ip,
      timezone: req.headers['x-timezone'] || 'UTC'
    });

    await user.save();

    // Send verification emails/SMS
    if (detectedCountry === 'BD' && phoneNumber) {
      await sendSMSVerification(phoneNumber, user.phoneVerificationCode);
    } else {
      await sendEmailVerification(email, user.emailVerificationToken);
    }

    // Create referral bonus transaction if applicable
    if (referredBy) {
      const referralBonus = Math.floor(user.points * 0.1); // 10% of initial points
      if (referralBonus > 0) {
        const transaction = new Transaction({
          user: referredBy._id,
          type: 'referral_bonus',
          points: referralBonus,
          previousBalance: referredBy.points,
          newBalance: referredBy.points + referralBonus,
          referral: user._id,
          description: `Referral bonus from ${username}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        await transaction.save();
        
        // Update referrer's points
        referredBy.points += referralBonus;
        referredBy.referralEarnings += referralBonus;
        referredBy.referralCount += 1;
        await referredBy.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          points: user.points,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        success: false, 
        message: 'Account is temporarily locked due to too many failed login attempts' 
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is banned: ' + user.banReason 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    
    // Add login history
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          points: user.points,
          totalEarned: user.totalEarned,
          referralCode: user.referralCode,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          role: user.role,
          theme: user.theme,
          language: user.language
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty()
], async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
});

// Verify phone (for Bangladesh users)
router.post('/verify-phone', [
  body('phoneNumber').isMobilePhone(),
  body('code').isLength({ min: 4, max: 6 })
], async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    const user = await User.findOne({
      phoneNumber,
      phoneVerificationCode: code,
      phoneVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code' 
      });
    }

    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Phone verification failed' 
    });
  }
});

// Resend verification
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.country === 'BD' && user.phoneNumber && !user.phoneVerified) {
      // Resend SMS verification
      user.phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
      
      await sendSMSVerification(user.phoneNumber, user.phoneVerificationCode);
      
      res.json({
        success: true,
        message: 'SMS verification code sent'
      });
    } else if (!user.emailVerified) {
      // Resend email verification
      user.emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();
      
      await sendEmailVerification(user.email, user.emailVerificationToken);
      
      res.json({
        success: true,
        message: 'Email verification sent'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No verification needed'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend verification' 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -emailVerificationToken -phoneVerificationCode');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user data' 
    });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

module.exports = router;

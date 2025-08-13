const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.facebookId; },
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  
  // Authentication
  googleId: String,
  facebookId: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Phone Verification (for Bangladesh users)
  phoneNumber: {
    type: String,
    required: function() { return this.country === 'BD'; }
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  
  // Location & Country
  country: {
    type: String,
    required: true,
    enum: ['BD', 'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN', 'PK', 'OTHER']
  },
  ipAddress: String,
  timezone: String,
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'bn']
  },
  
  // Earning System
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  
  // Daily Bonus System
  dailyBonusStreak: {
    type: Number,
    default: 0
  },
  lastDailyBonus: Date,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  // Payout Information
  payoutMethods: [{
    type: {
      type: String,
      enum: ['bkash', 'nagad', 'rocket', 'paypal', 'payoneer', 'wise']
    },
    accountId: String,
    accountName: String,
    isDefault: Boolean
  }],
  
  // Security & Fraud Prevention
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Theme
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ country: 1 });
userSchema.index({ points: -1 });
userSchema.index({ totalEarned: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for referral link
userSchema.virtual('referralLink').get(function() {
  return `${process.env.CLIENT_URL}/register?ref=${this.referralCode}`;
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  
  next();
});

// Instance methods
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addPoints = function(amount, reason = 'Offer completion') {
  this.points += amount;
  this.totalEarned += amount;
  return this.save();
};

userSchema.methods.canWithdraw = function() {
  const minPoints = this.country === 'BD' ? 200 : 500; // $2 for BD, $5 for others
  return this.points >= minPoints;
};

userSchema.methods.getMinimumWithdrawal = function() {
  return this.country === 'BD' ? 200 : 500;
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static methods
userSchema.statics.findByReferralCode = function(code) {
  return this.findOne({ referralCode: code });
};

userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .sort({ totalEarned: -1 })
    .limit(limit)
    .select('username firstName lastName totalEarned points country');
};

module.exports = mongoose.model('User', userSchema);

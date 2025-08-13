const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction Details
  type: {
    type: String,
    required: true,
    enum: [
      'offer_completion',
      'referral_bonus',
      'daily_bonus',
      'quiz_reward',
      'video_reward',
      'admin_adjustment',
      'withdrawal',
      'refund',
      'bonus',
      'penalty'
    ]
  },
  
  // Amount
  points: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    required: true
  },
  newBalance: {
    type: Number,
    required: true
  },
  
  // Reference Information
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  payout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout'
  },
  
  // Description
  description: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  
  // Fraud Prevention
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
  
  // Verification
  requiresVerification: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  
  // Admin Notes
  adminNotes: String,
  
  // External Data
  externalId: String,
  externalData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ offer: 1 });
transactionSchema.index({ referral: 1 });

// Virtual for transaction value in USD
transactionSchema.virtual('usdValue').get(function() {
  return this.points / 100; // 100 points = $1
});

// Instance methods
transactionSchema.methods.isPositive = function() {
  return this.points > 0;
};

transactionSchema.methods.isNegative = function() {
  return this.points < 0;
};

// Static methods
transactionSchema.statics.getUserTransactions = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('offer', 'title imageUrl')
    .populate('referral', 'username firstName lastName');
};

transactionSchema.statics.getUserEarnings = function(userId, startDate, endDate) {
  const query = {
    user: userId,
    points: { $gt: 0 },
    status: 'completed'
  };
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$points' },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);
};

transactionSchema.statics.getReferralEarnings = function(userId, startDate, endDate) {
  const query = {
    user: userId,
    type: 'referral_bonus',
    status: 'completed'
  };
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalReferralEarnings: { $sum: '$points' },
        totalReferrals: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);

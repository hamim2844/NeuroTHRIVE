const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payout Details
  amount: {
    points: {
      type: Number,
      required: true,
      min: 1
    },
    usdValue: {
      type: Number,
      required: true
    },
    localValue: {
      type: Number,
      required: true
    },
    localCurrency: {
      type: String,
      required: true
    }
  },
  
  // Payment Method
  paymentMethod: {
    type: {
      type: String,
      required: true,
      enum: ['bkash', 'nagad', 'rocket', 'paypal', 'payoneer', 'wise']
    },
    accountId: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Processing
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  processingNotes: String,
  
  // Rejection
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  
  // External Payment Info
  externalTransactionId: String,
  externalPaymentData: mongoose.Schema.Types.Mixed,
  
  // Fees
  processingFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  
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
  
  // Fraud Prevention
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
  
  // Admin Notes
  adminNotes: String,
  
  // Auto-processing
  autoProcessed: {
    type: Boolean,
    default: false
  },
  autoProcessAttempts: {
    type: Number,
    default: 0
  },
  lastAutoProcessAttempt: Date
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ user: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ 'paymentMethod.type': 1 });
payoutSchema.index({ processedBy: 1 });
payoutSchema.index({ autoProcessed: 1 });

// Virtual for formatted amount
payoutSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.localValue} ${this.amount.localCurrency}`;
});

// Virtual for status color
payoutSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'warning',
    approved: 'info',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'secondary'
  };
  return colors[this.status] || 'secondary';
});

// Instance methods
payoutSchema.methods.canBeProcessed = function() {
  return this.status === 'pending' || this.status === 'approved';
};

payoutSchema.methods.canBeRejected = function() {
  return this.status === 'pending' || this.status === 'approved';
};

payoutSchema.methods.markAsProcessing = function(adminId) {
  this.status = 'processing';
  this.processedBy = adminId;
  this.processedAt = new Date();
  return this.save();
};

payoutSchema.methods.markAsCompleted = function(adminId, externalTransactionId = null) {
  this.status = 'completed';
  this.processedBy = adminId;
  this.processedAt = new Date();
  if (externalTransactionId) {
    this.externalTransactionId = externalTransactionId;
  }
  return this.save();
};

payoutSchema.methods.markAsRejected = function(adminId, reason) {
  this.status = 'rejected';
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static methods
payoutSchema.statics.getUserPayouts = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

payoutSchema.statics.getPendingPayouts = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'username firstName lastName email country')
    .sort({ createdAt: 1 });
};

payoutSchema.statics.getPayoutStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.usdValue' },
        totalPoints: { $sum: '$amount.points' }
      }
    }
  ]);
};

payoutSchema.statics.getPayoutsByMethod = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'completed'
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMethod.type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.usdValue' },
        totalPoints: { $sum: '$amount.points' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payout', payoutSchema);

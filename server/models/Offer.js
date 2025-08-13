const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  
  // Offer Details
  offerId: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['adgatemedia', 'cpalead', 'ogads', 'internal']
  },
  category: {
    type: String,
    required: true,
    enum: ['survey', 'app_install', 'video', 'signup', 'purchase', 'quiz', 'game']
  },
  
  // Rewards
  pointsReward: {
    type: Number,
    required: true,
    min: 1
  },
  originalReward: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'BDT', 'EUR', 'GBP']
  },
  
  // Targeting
  countries: [{
    type: String,
    enum: ['BD', 'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN', 'PK', 'ALL']
  }],
  minAge: {
    type: Number,
    default: 13
  },
  maxAge: {
    type: Number,
    default: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'all'],
    default: 'all'
  },
  
  // Requirements
  requirements: {
    type: String,
    default: 'Complete the offer to earn points'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  
  // Media
  imageUrl: String,
  thumbnailUrl: String,
  videoUrl: String,
  
  // URLs
  offerUrl: {
    type: String,
    required: true
  },
  trackingUrl: String,
  
  // Status & Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Performance Metrics
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  
  // Limits
  dailyLimit: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  totalLimit: {
    type: Number,
    default: -1
  },
  userDailyLimit: {
    type: Number,
    default: 1
  },
  userTotalLimit: {
    type: Number,
    default: 1
  },
  
  // Timing
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  
  // Fraud Prevention
  requiresScreenshot: {
    type: Boolean,
    default: false
  },
  requiresVerification: {
    type: Boolean,
    default: false
  },
  minTimeOnPage: {
    type: Number, // in seconds
    default: 0
  },
  
  // Admin Settings
  adminNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // API Integration
  externalId: String,
  externalData: mongoose.Schema.Types.Mixed,
  
  // Tags for better organization
  tags: [String]
}, {
  timestamps: true
});

// Indexes
offerSchema.index({ provider: 1, offerId: 1 });
offerSchema.index({ category: 1 });
offerSchema.index({ countries: 1 });
offerSchema.index({ isActive: 1, isFeatured: 1 });
offerSchema.index({ pointsReward: -1 });
offerSchema.index({ conversionRate: -1 });

// Virtual for conversion rate
offerSchema.virtual('calculatedConversionRate').get(function() {
  if (this.clicks === 0) return 0;
  return (this.conversions / this.clicks) * 100;
});

// Virtual for EPC (Earnings Per Click)
offerSchema.virtual('epc').get(function() {
  if (this.clicks === 0) return 0;
  return (this.pointsReward * this.conversions) / this.clicks;
});

// Instance methods
offerSchema.methods.isAvailableForCountry = function(country) {
  return this.countries.includes('ALL') || this.countries.includes(country);
};

offerSchema.methods.isAvailableForUser = function(user) {
  if (!this.isActive) return false;
  if (!this.isAvailableForCountry(user.country)) return false;
  if (this.endDate && this.endDate < new Date()) return false;
  return true;
};

offerSchema.methods.incrementImpression = function() {
  this.impressions += 1;
  return this.save();
};

offerSchema.methods.incrementClick = function() {
  this.clicks += 1;
  this.conversionRate = this.calculatedConversionRate;
  return this.save();
};

offerSchema.methods.incrementConversion = function() {
  this.conversions += 1;
  this.conversionRate = this.calculatedConversionRate;
  return this.save();
};

// Static methods
offerSchema.statics.findByCountry = function(country, limit = 50) {
  return this.find({
    isActive: true,
    $or: [
      { countries: 'ALL' },
      { countries: country }
    ]
  })
  .sort({ isFeatured: -1, pointsReward: -1 })
  .limit(limit);
};

offerSchema.statics.findPremiumOffers = function(country) {
  return this.find({
    isActive: true,
    isPremium: true,
    $or: [
      { countries: 'ALL' },
      { countries: country }
    ]
  })
  .sort({ pointsReward: -1 });
};

offerSchema.statics.findByCategory = function(category, country) {
  return this.find({
    isActive: true,
    category: category,
    $or: [
      { countries: 'ALL' },
      { countries: country }
    ]
  })
  .sort({ pointsReward: -1 });
};

module.exports = mongoose.model('Offer', offerSchema);

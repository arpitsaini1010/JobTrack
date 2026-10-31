const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    industry: {
      type: String,
      trim: true,
      default: 'Technology & Software'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4
    },
    status: {
      type: String,
      enum: ['Target', 'Applied', 'Interviewing', 'Offer', 'Archived'],
      default: 'Target'
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: ''
    },
    logoColor: {
      type: String,
      default: '#0d5c4d'
    },
    similarCompanies: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);


const mongoose = require('mongoose');

const jobFeedSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote / India'
    },
    type: {
      type: String,
      enum: ['Job', 'Internship'],
      default: 'Job'
    },
    salary: {
      type: String,
      trim: true,
      default: 'Competitive'
    },
    salaryNumeric: {
      type: Number,
      default: 0
    },
    portal: {
      type: String,
      required: true,
      default: 'LinkedIn'
    },
    portalColor: {
      type: String,
      default: '#0a66c2'
    },
    jobUrl: {
      type: String,
      required: [true, 'Job URL is required'],
      trim: true
    },
    experience: {
      type: String,
      trim: true,
      default: '0-2 Years'
    },
    skills: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ''
    },
    postedDate: {
      type: Date,
      default: Date.now
    },
    deadlineDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active',
      index: true
    },
    applicantsCount: {
      type: Number,
      default: 12
    }
  },
  {
    timestamps: true
  }
);

jobFeedSchema.index({ status: 1, postedDate: -1 });

module.exports = mongoose.model('JobFeed', jobFeedSchema);

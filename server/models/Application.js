const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  round: {
    type: String,
    required: [true, 'Interview round name is required (e.g. Technical Round 1)'],
    trim: true,
    maxlength: [100, 'Round name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['HR', 'Technical', 'Managerial', 'Aptitude', 'Group Discussion', 'Other'],
      message: '{VALUE} is not a valid interview type'
    },
    default: 'Technical'
  },
  date: {
    type: Date,
    required: [true, 'Interview date and time is required']
  },
  meetingLink: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Interview notes cannot exceed 1000 characters']
  }
}, { _id: true, timestamps: true });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      'Bookmarked',
      'Applying',
      'Applied',
      'Shortlisted',
      'Interviewing',
      'Interview',
      'Negotiating',
      'Offer',
      'Accepted',
      'Rejected',
      'Withdrawn'
    ]
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const offerSchema = new mongoose.Schema({
  ctc: {
    type: Number,
    min: [0, 'CTC cannot be negative']
  },
  joiningDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  decision: {
    type: String,
    enum: {
      values: ['Pending', 'Accepted', 'Declined'],
      message: '{VALUE} is not a valid offer decision'
    },
    default: 'Pending'
  }
}, { _id: false });

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    role: {
      type: String,
      required: [true, 'Role/position title is required'],
      trim: true,
      maxlength: [100, 'Role title cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: ''
    },
    type: {
      type: String,
      enum: {
        values: ['Job', 'Internship'],
        message: '{VALUE} must be either Job or Internship'
      },
      default: 'Job'
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative']
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      default: Date.now
    },
    jobUrl: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: [
          'Bookmarked',
          'Applying',
          'Applied',
          'Shortlisted',
          'Interviewing',
          'Interview',
          'Negotiating',
          'Offer',
          'Accepted',
          'Rejected',
          'Withdrawn'
        ],
        message: '{VALUE} is not a valid application status'
      },
      default: 'Applied'
    },
    excitement: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    dateSaved: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date
    },
    followUpDate: {
      type: Date
    },
    source: {
      type: String,
      default: 'Manual',
      trim: true
    },
    externalJobId: {
      type: String,
      trim: true,
      index: true
    },
    listingStatus: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active'
    },
    skills: {
      type: [String],
      default: []
    },
    statusHistory: [statusHistorySchema],
    interviews: [interviewSchema],
    offer: {
      type: offerSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index on user and appliedDate descending for fast queries
applicationSchema.index({ user: 1, appliedDate: -1 });

module.exports = mongoose.model('Application', applicationSchema);

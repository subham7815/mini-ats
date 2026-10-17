const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema({
  fromStage: {
    type: String,
    default: null
  },
  toStage: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  actor: {
    type: String,
    default: 'System'
  }
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  resumeUrl: {
    type: String,
    trim: true,
    default: ''
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Indeed', 'Glassdoor', 'Other'],
    default: 'Other'
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  stage: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  stageHistory: [stageHistorySchema]
}, {
  timestamps: true
});

// Index for search
candidateSchema.index({ name: 'text', email: 'text' });
candidateSchema.index({ stage: 1 });
candidateSchema.index({ jobId: 1 });
candidateSchema.index({ source: 1 });
candidateSchema.index({ applicationDate: -1 });

// Add initial stage to history on creation
candidateSchema.pre('save', function (next) {
  if (this.isNew && this.stageHistory.length === 0) {
    this.stageHistory.push({
      fromStage: null,
      toStage: this.stage,
      changedAt: new Date(),
      actor: 'System'
    });
  }
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: [
      'candidate_added',
      'candidate_updated',
      'candidate_deleted',
      'stage_changed',
      'job_created',
      'job_updated',
      'job_closed',
      'job_reopened',
      'job_deleted',
      'interview_scheduled',
      'offer_extended',
      'candidate_hired'
    ]
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    default: null
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null
  },
  description: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

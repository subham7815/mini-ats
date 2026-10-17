const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  openings: {
    type: Number,
    min: [1, 'At least 1 opening required'],
    default: 1
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', department: 'text' });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);

const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');

// GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const jobs = await Job.find(filter).sort(sort).lean();

    // Add applicant counts
    const jobIds = jobs.map(j => j._id);
    const counts = await Candidate.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const jobsWithCounts = jobs.map(j => ({
      ...j,
      applicantCount: countMap[j._id.toString()] || 0
    }));

    res.json({ success: true, data: jobsWithCounts });
  } catch (error) {
    console.error('getJobs error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
};

// GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicantCount = await Candidate.countDocuments({ jobId: job._id });
    const candidates = await Candidate.find({ jobId: job._id })
      .select('name email stage applicationDate experience skills')
      .sort({ applicationDate: -1 })
      .lean();

    res.json({ success: true, data: { ...job, applicantCount, candidates } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    console.error('getJob error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching job' });
  }
};

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, department, description, requiredSkills, location, employmentType, openings, status } = req.body;

    const job = new Job({
      title,
      department,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [],
      location,
      employmentType,
      openings,
      status: status || 'Open'
    });

    await job.save();

    await Activity.create({
      actionType: 'job_created',
      jobId: job._id,
      description: `New job posting created: ${job.title} in ${job.department}`
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createJob error:', error);
    res.status(500).json({ success: false, message: 'Server error creating job' });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const { title, department, description, requiredSkills, location, employmentType, openings } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (title) job.title = title;
    if (department) job.department = department;
    if (description !== undefined) job.description = description;
    if (requiredSkills) {
      job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    }
    if (location) job.location = location;
    if (employmentType) job.employmentType = employmentType;
    if (openings) job.openings = openings;

    await job.save();

    await Activity.create({
      actionType: 'job_updated',
      jobId: job._id,
      description: `Job posting updated: ${job.title}`
    });

    res.json({ success: true, data: job });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('updateJob error:', error);
    res.status(500).json({ success: false, message: 'Server error updating job' });
  }
};

// PATCH /api/jobs/:id/status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Open or Closed' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const previousStatus = job.status;
    job.status = status;
    await job.save();

    const actionType = status === 'Closed' ? 'job_closed' : 'job_reopened';
    await Activity.create({
      actionType,
      jobId: job._id,
      description: `${job.title} was ${status === 'Closed' ? 'closed' : 'reopened'}`
    });

    res.json({ success: true, data: job });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    console.error('updateJobStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating job status' });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if job has candidates
    const candidateCount = await Candidate.countDocuments({ jobId: job._id });
    if (candidateCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this job. It has ${candidateCount} candidate(s) associated with it. Remove or reassign candidates first.`
      });
    }

    await Activity.create({
      actionType: 'job_deleted',
      jobId: job._id,
      description: `Job posting deleted: ${job.title}`
    });

    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }
    console.error('deleteJob error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting job' });
  }
};

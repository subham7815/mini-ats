const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Activity = require('../models/Activity');

// GET /api/candidates
exports.getCandidates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      stage,
      jobId,
      source,
      sortBy = 'applicationDate',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (stage) {
      filter.stage = stage;
    }

    if (jobId) {
      filter.jobId = jobId;
    }

    if (source) {
      filter.source = source;
    }

    if (dateFrom || dateTo) {
      filter.applicationDate = {};
      if (dateFrom) filter.applicationDate.$gte = new Date(dateFrom);
      if (dateTo) filter.applicationDate.$lte = new Date(dateTo);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .populate('jobId', 'title department status')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Candidate.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: candidates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getCandidates error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching candidates' });
  }
};

// GET /api/candidates/:id
exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'title department status location employmentType');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Fetch activities for this candidate
    const activities = await Activity.find({ candidateId: candidate._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: { ...candidate.toObject(), activities }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID' });
    }
    console.error('getCandidate error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching candidate' });
  }
};

// POST /api/candidates
exports.createCandidate = async (req, res) => {
  try {
    const { name, email, phone, jobId, resumeUrl, source, experience, skills, notes, stage } = req.body;

    // Check job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(400).json({ success: false, message: 'Selected job does not exist' });
    }
    if (job.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Cannot apply to a closed job' });
    }

    // Check duplicate email for same job
    const existing = await Candidate.findOne({ email: email.toLowerCase(), jobId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A candidate with this email has already applied to this job'
      });
    }

    const candidate = new Candidate({
      name,
      email,
      phone,
      jobId,
      resumeUrl,
      source,
      experience,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [],
      notes,
      stage: stage || 'Applied'
    });

    await candidate.save();

    // Populate job info for response
    await candidate.populate('jobId', 'title department status');

    // Record activity
    await Activity.create({
      actionType: 'candidate_added',
      candidateId: candidate._id,
      jobId: candidate.jobId._id,
      description: `${candidate.name} applied for ${candidate.jobId.title}`
    });

    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createCandidate error:', error);
    res.status(500).json({ success: false, message: 'Server error creating candidate' });
  }
};

// PUT /api/candidates/:id
exports.updateCandidate = async (req, res) => {
  try {
    const { name, email, phone, jobId, resumeUrl, source, experience, skills, notes } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // If changing job, validate
    if (jobId && jobId !== candidate.jobId.toString()) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(400).json({ success: false, message: 'Selected job does not exist' });
      }
      if (job.status === 'Closed') {
        return res.status(400).json({ success: false, message: 'Cannot assign to a closed job' });
      }
    }

    // Check duplicate email for same job if email changed
    if (email && email.toLowerCase() !== candidate.email) {
      const targetJob = jobId || candidate.jobId;
      const existing = await Candidate.findOne({
        email: email.toLowerCase(),
        jobId: targetJob,
        _id: { $ne: candidate._id }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A candidate with this email has already applied to this job'
        });
      }
    }

    // Update fields
    if (name) candidate.name = name;
    if (email) candidate.email = email;
    if (phone !== undefined) candidate.phone = phone;
    if (jobId) candidate.jobId = jobId;
    if (resumeUrl !== undefined) candidate.resumeUrl = resumeUrl;
    if (source) candidate.source = source;
    if (experience !== undefined) candidate.experience = experience;
    if (skills) candidate.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (notes !== undefined) candidate.notes = notes;

    await candidate.save();
    await candidate.populate('jobId', 'title department status');

    await Activity.create({
      actionType: 'candidate_updated',
      candidateId: candidate._id,
      jobId: candidate.jobId._id,
      description: `${candidate.name}'s profile was updated`
    });

    res.json({ success: true, data: candidate });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('updateCandidate error:', error);
    res.status(500).json({ success: false, message: 'Server error updating candidate' });
  }
};

// PATCH /api/candidates/:id/stage
exports.updateCandidateStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const previousStage = candidate.stage;
    if (previousStage === stage) {
      return res.status(400).json({ success: false, message: 'Candidate is already in this stage' });
    }

    candidate.stage = stage;
    candidate.stageHistory.push({
      fromStage: previousStage,
      toStage: stage,
      changedAt: new Date(),
      actor: 'HR Manager'
    });

    await candidate.save();
    await candidate.populate('jobId', 'title department status');

    // Determine activity type
    let actionType = 'stage_changed';
    if (stage === 'Interview') actionType = 'interview_scheduled';
    if (stage === 'Offer') actionType = 'offer_extended';
    if (stage === 'Hired') actionType = 'candidate_hired';

    await Activity.create({
      actionType,
      candidateId: candidate._id,
      jobId: candidate.jobId._id,
      description: `${candidate.name} moved from ${previousStage} to ${stage} for ${candidate.jobId.title}`
    });

    res.json({ success: true, data: candidate });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID' });
    }
    console.error('updateCandidateStage error:', error);
    res.status(500).json({ success: false, message: 'Server error updating stage' });
  }
};

// DELETE /api/candidates/:id
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId', 'title');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    await Activity.create({
      actionType: 'candidate_deleted',
      candidateId: candidate._id,
      jobId: candidate.jobId?._id,
      description: `${candidate.name} was removed from ${candidate.jobId?.title || 'unknown job'}`
    });

    await Candidate.findByIdAndDelete(req.params.id);

    // Clean up activities referencing this candidate (except the delete record)
    // We keep delete activity for audit trail

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID' });
    }
    console.error('deleteCandidate error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting candidate' });
  }
};

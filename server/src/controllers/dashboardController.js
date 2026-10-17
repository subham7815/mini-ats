const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Activity = require('../models/Activity');

// GET /api/dashboard/metrics
exports.getMetrics = async (req, res) => {
  try {
    const [
      totalCandidates,
      activeJobs,
      inInterview,
      offersExtended,
      hiredCandidates
    ] = await Promise.all([
      Candidate.countDocuments(),
      Job.countDocuments({ status: 'Open' }),
      Candidate.countDocuments({ stage: 'Interview' }),
      Candidate.countDocuments({ stage: 'Offer' }),
      Candidate.countDocuments({ stage: 'Hired' })
    ]);

    res.json({
      success: true,
      data: {
        totalCandidates,
        activeJobs,
        inInterview,
        offersExtended,
        hiredCandidates
      }
    });
  } catch (error) {
    console.error('getMetrics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching metrics' });
  }
};

// GET /api/dashboard/pipeline
exports.getPipeline = async (req, res) => {
  try {
    const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
    const pipeline = await Candidate.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const pipelineMap = {};
    pipeline.forEach(p => { pipelineMap[p._id] = p.count; });

    const data = stages.map(stage => ({
      stage,
      count: pipelineMap[stage] || 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('getPipeline error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pipeline' });
  }
};

// GET /api/dashboard/applications-over-time
exports.getApplicationsOverTime = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Candidate.aggregate([
      { $match: { applicationDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$applicationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = data.map(d => ({
      date: d._id,
      count: d.count
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getApplicationsOverTime error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications over time' });
  }
};

// GET /api/dashboard/sources
exports.getSources = async (req, res) => {
  try {
    const data = await Candidate.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = data.map(d => ({
      source: d._id || 'Other',
      count: d.count
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getSources error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching sources' });
  }
};

// GET /api/dashboard/activity
exports.getActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;

    const activities = await Activity.find()
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('getActivity error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching activity' });
  }
};

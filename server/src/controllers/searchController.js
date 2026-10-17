const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// GET /api/search?q=searchTerm
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { candidates: [], jobs: [] } });
    }

    const searchRegex = { $regex: q.trim(), $options: 'i' };

    const [candidates, jobs] = await Promise.all([
      Candidate.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      })
        .populate('jobId', 'title')
        .select('name email stage jobId applicationDate')
        .limit(10)
        .lean(),
      Job.find({
        $or: [
          { title: searchRegex },
          { department: searchRegex }
        ]
      })
        .select('title department status location')
        .limit(10)
        .lean()
    ]);

    res.json({
      success: true,
      data: { candidates, jobs }
    });
  } catch (error) {
    console.error('globalSearch error:', error);
    res.status(500).json({ success: false, message: 'Server error performing search' });
  }
};

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/jobController');

// GET /api/jobs
router.get('/', ctrl.getJobs);

// GET /api/jobs/:id
router.get('/:id', ctrl.getJob);

// POST /api/jobs
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('employmentType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']),
    body('openings').optional().isInt({ min: 1 }).withMessage('Openings must be at least 1'),
    body('status').optional().isIn(['Open', 'Closed'])
  ],
  validate,
  ctrl.createJob
);

// PUT /api/jobs/:id
router.put('/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
    body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
    body('employmentType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']),
    body('openings').optional().isInt({ min: 1 }).withMessage('Openings must be at least 1')
  ],
  validate,
  ctrl.updateJob
);

// PATCH /api/jobs/:id/status
router.patch('/:id/status',
  [
    body('status').notEmpty().isIn(['Open', 'Closed']).withMessage('Status must be Open or Closed')
  ],
  validate,
  ctrl.updateJobStatus
);

// DELETE /api/jobs/:id
router.delete('/:id', ctrl.deleteJob);

module.exports = router;

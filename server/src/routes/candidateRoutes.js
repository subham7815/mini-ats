const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/candidateController');

// GET /api/candidates - list with search, filter, sort, paginate
router.get('/', ctrl.getCandidates);

// GET /api/candidates/:id
router.get('/:id', ctrl.getCandidate);

// POST /api/candidates
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('jobId').trim().notEmpty().withMessage('Job is required'),
    body('source').optional().isIn(['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Indeed', 'Glassdoor', 'Other']),
    body('experience').optional().isFloat({ min: 0 }).withMessage('Experience must be a positive number'),
    body('stage').optional().isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'])
  ],
  validate,
  ctrl.createCandidate
);

// PUT /api/candidates/:id
router.put('/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required'),
    body('source').optional().isIn(['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Indeed', 'Glassdoor', 'Other']),
    body('experience').optional().isFloat({ min: 0 }).withMessage('Experience must be a positive number')
  ],
  validate,
  ctrl.updateCandidate
);

// PATCH /api/candidates/:id/stage
router.patch('/:id/stage',
  [
    body('stage').notEmpty().isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'])
      .withMessage('Valid stage is required')
  ],
  validate,
  ctrl.updateCandidateStage
);

// DELETE /api/candidates/:id
router.delete('/:id', ctrl.deleteCandidate);

module.exports = router;

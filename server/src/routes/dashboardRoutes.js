const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');

router.get('/metrics', ctrl.getMetrics);
router.get('/pipeline', ctrl.getPipeline);
router.get('/applications-over-time', ctrl.getApplicationsOverTime);
router.get('/sources', ctrl.getSources);
router.get('/activity', ctrl.getActivity);

module.exports = router;

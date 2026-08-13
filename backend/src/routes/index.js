const express = require('express');

const authRoutes = require('./authRoutes');
const candidateRoutes = require('./candidateRoutes');
const companyRoutes = require('./companyRoutes');
const jobRoutes = require('./jobRoutes');
const resumeRoutes = require('./resumeRoutes');
const applicationRoutes = require('./applicationRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const aiRoutes = require('./aiRoutes');
const offerRoutes = require('./offerRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HireLoop API is healthy', data: { timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/ai', aiRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;

const express = require('express');
const resumeController = require('../controllers/resumeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const uploadResume = require('../middleware/uploadResume');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/upload',
  authorize(ROLES.CANDIDATE),
  uploadResume.single('resume'),
  resumeController.uploadResumeHandler
);

router.get('/mine/list', authorize(ROLES.CANDIDATE), resumeController.listMyResumes);

router.get('/:id', resumeController.downloadResume);
router.get('/:id/metadata', resumeController.getResumeMetadata);
router.delete('/:id', authorize(ROLES.CANDIDATE), resumeController.deleteResumeHandler);

module.exports = router;

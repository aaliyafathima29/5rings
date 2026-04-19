const express = require('express');
const router = express.Router();
const coachController = require('../controller/coachController');
const { verifyToken: auth } = require('../middleware/auth');
const { checkRole, checkApprovalStatus } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');

// Public routes
router.get('/programs', coachController.getAllPrograms);
router.get('/programs/:id', coachController.getProgram);

// Coach routes - Program management
router.post('/programs', auth, checkRole('coach'), checkApprovalStatus, coachController.createProgram);
router.get('/coach/programs', auth, checkRole('coach'), coachController.getCoachPrograms);
router.put('/programs/:id', auth, checkRole('coach', 'admin'), coachController.updateProgram);
router.delete('/programs/:id', auth, checkRole('coach', 'admin'), coachController.deleteProgram);
router.get('/coach/profile', auth, checkRole('coach'), coachController.getCoachProfile);
router.put('/coach/profile', auth, checkRole('coach'), upload.single('image'), coachController.updateCoachProfile);

// Coach routes - Enrollment management
router.get('/coach/enrollments', auth, checkRole('coach'), coachController.getCoachEnrollments);
router.put('/enrollments/:id/progress', auth, checkRole('coach', 'admin'), coachController.updateEnrollmentProgress);

// User routes - Enrollment
router.post('/enrollments', auth, coachController.enrollProgram);
router.get('/enrollments', auth, coachController.getUserEnrollments);
router.post('/enrollments/:id/rate', auth, checkRole('user'), coachController.rateCoach);

module.exports = router;

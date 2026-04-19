const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { verifyToken: auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAuth');

// All routes require admin role
router.use(auth);
router.use(checkRole('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.post('/users/create', adminController.createSpecialUser);
router.put('/users/approve', adminController.updateUserApproval);
router.delete('/users/:id', adminController.deleteUser);
router.put('/events/:id/featured', adminController.toggleEventFeatured);

module.exports = router;

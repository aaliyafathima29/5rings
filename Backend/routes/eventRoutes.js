const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const { verifyToken: auth } = require('../middleware/auth');
const { checkRole, checkApprovalStatus } = require('../middleware/roleAuth');

// Public routes
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEvent);

// Protected routes - Event Organizer or Coach
router.post('/events', auth, checkRole('event_organizer', 'coach'), checkApprovalStatus, eventController.createEvent);
router.put('/events/:id', auth, checkRole('event_organizer', 'coach', 'admin'), eventController.updateEvent);
router.delete('/events/:id', auth, checkRole('event_organizer', 'coach', 'admin'), eventController.deleteEvent);
router.get('/organizer/events', auth, checkRole('event_organizer', 'coach'), eventController.getOrganizerEvents);

// Protected routes - User ticket booking
router.post('/tickets', auth, eventController.bookTicket);
router.get('/tickets', auth, eventController.getUserTickets);
router.get('/tickets/:id/pdf', auth, eventController.getTicketPdf);

module.exports = router;

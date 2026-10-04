const express = require('express');
const router = express.Router();
const controller = require('./nannies.me.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Toutes ces routes sont reservees aux nounous
router.use(authenticate, authorize('NANNY'));

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);
router.patch('/availability', controller.toggleAvailability);
router.get('/bookings', controller.getBookings);
router.get('/stats', controller.getStats);
router.patch('/bookings/:id/respond', controller.respondBooking);
router.patch('/bookings/:id/complete', controller.completeBooking);

module.exports = router;
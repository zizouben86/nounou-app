const router = require('express').Router();
const controller = require('./admin.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireAdmin } = require('../../middlewares/admin.middleware');

router.use(authenticate, requireAdmin);

router.get('/stats', controller.stats);
router.get('/nannies/pending', controller.pendingNannies);
router.patch('/nannies/:id/verify', controller.verifyNanny);
router.get('/users', controller.users);
router.patch('/users/:id/role', controller.updateRole);
router.delete('/users/:id', controller.deleteUser);
router.get('/bookings', controller.bookings);

module.exports = router;
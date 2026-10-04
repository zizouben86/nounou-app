const router = require('express').Router();
const controller = require('./bookings.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorize('PARENT'), controller.create);
router.get('/me', controller.listMine);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
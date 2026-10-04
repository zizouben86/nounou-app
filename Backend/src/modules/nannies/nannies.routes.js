const router = require('express').Router();
const controller = require('./nannies.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.get('/', controller.search);
router.get('/:id', controller.getById);
router.put('/me', authenticate, authorize('NANNY'), controller.updateMe);

module.exports = router;
const router = require('express').Router();
const controller = require('./users.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/me', controller.getMe);
router.put('/me', controller.updateMe);

// Enfants (parents uniquement)
router.post('/me/children', authorize('PARENT'), controller.addChild);
router.delete('/me/children/:childId', authorize('PARENT'), controller.deleteChild);

module.exports = router;
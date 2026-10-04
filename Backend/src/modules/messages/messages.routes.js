const router = require('express').Router();
const controller = require('./messages.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', controller.list);
router.get('/:userId', controller.getConversation);

module.exports = router;
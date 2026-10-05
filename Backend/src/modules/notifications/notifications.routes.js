const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);
router.patch('/read-all', controller.markAllRead);
router.delete('/read', controller.clearRead);
router.delete('/:id', controller.remove);

module.exports = router;
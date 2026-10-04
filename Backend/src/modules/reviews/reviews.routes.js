const router = require('express').Router();
const controller = require('./reviews.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.post('/', authenticate, authorize('PARENT'), controller.create);

module.exports = router;
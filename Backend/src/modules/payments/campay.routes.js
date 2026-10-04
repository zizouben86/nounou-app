const express = require('express');
const router = express.Router();
const controller = require('./campay.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Routes authentifiees (avec JSON body)
router.post('/initiate', authenticate, controller.initiate);
router.get('/status/:bookingId', authenticate, controller.checkStatus);

module.exports = router;
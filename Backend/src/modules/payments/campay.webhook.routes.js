const express = require('express');
const router = express.Router();
const controller = require('./campay.controller');

// ⚠️ Cette route reçoit le RAW BODY (Buffer)
router.post('/', controller.webhook);

module.exports = router;
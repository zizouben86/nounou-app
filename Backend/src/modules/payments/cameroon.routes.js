const router = require('express').Router();
const controller = require('./cameroon.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Initier un paiement
router.post('/initiate', authenticate, controller.initiate);

// Vérifier le statut (polling côté client)
router.get('/status/:bookingId', authenticate, controller.checkStatus);

// Webhooks (pas d'auth, appelés par MTN/Orange)
router.post('/webhook/mtn', controller.mtnWebhook);
router.post('/webhook/orange', controller.orangeWebhook);

module.exports = router;
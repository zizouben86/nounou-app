const service = require('./campay.service');
const webhookService = require('./campay.webhook.service');

const initiate = async (req, res, next) => {
  try {
    const { bookingId, phoneNumber } = req.body;
    const result = await service.initiatePayment(bookingId, phoneNumber, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const checkStatus = async (req, res, next) => {
  try {
    const result = await service.checkPaymentStatus(req.params.bookingId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-campay-signature'] || req.headers['x-signature'];
    const rawBody = req.body;

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch (parseErr) {
      console.error('Payload JSON invalide');
      return res.status(400).json({ error: 'Payload invalide' });
    }

    const result = await webhookService.processWebhook(payload, signature, rawBody);
    res.status(200).json({ received: true, ...result });
  } catch (err) {
    console.error('Erreur webhook CamPay :', err.message);
    if (err.message === 'Signature invalide') {
      return res.status(401).json({ error: 'Signature invalide' });
    }
    res.status(500).json({ error: 'Erreur traitement' });
  }
};

module.exports = { initiate, checkStatus, webhook };
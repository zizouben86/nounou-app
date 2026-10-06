const crypto = require('crypto');
const axios = require('axios');
const prisma = require('../../config/prisma');
const { sendEmail } = require('../emails/email.service');
const templates = require('../emails/email.templates');

const CAMPAY_BASE_URL = process.env.CAMPAY_API_URL || 'https://demo.campay.net/api';
const AUTH_HEADER = Buffer.from(
  `${process.env.CAMPAY_USERNAME}:${process.env.CAMPAY_PASSWORD}`
).toString('base64');

const getHeaders = () => ({
  Authorization: `Token ${AUTH_HEADER}`,
  'Content-Type': 'application/json',
});

/**
 * VÃ©rifie la signature du webhook CamPay
 * CamPay peut envoyer un header X-Campay-Signature (HMAC SHA256)
 */
const verifySignature = (rawBody, signature) => {
  if (!process.env.CAMPAY_WEBHOOK_SECRET) {
    console.warn('âš ï¸ CAMPAY_WEBHOOK_SECRET non configurÃ© â€” vÃ©rification dÃ©sactivÃ©e');
    return true;
  }

  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', process.env.CAMPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  // Comparaison sÃ©curisÃ©e contre les timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
};

/**
 * RÃ©cupÃ¨re le statut rÃ©el de la transaction auprÃ¨s de CamPay
 * (double vÃ©rification pour Ã©viter les faux webhooks)
 */
const getTransactionFromCampay = async (reference) => {
  const { data } = await axios.get(
    `${CAMPAY_BASE_URL}/transaction/${reference}/`,
    { headers: getHeaders() }
  );
  return data;
};

/**
 * Traite un webhook CamPay
 */
const processWebhook = async (payload, signature, rawBody) => {
  console.log('ðŸ“© Webhook CamPay reÃ§u :', JSON.stringify(payload, null, 2));

  // 1ï¸âƒ£ VÃ©rification de la signature
  if (!verifySignature(rawBody, signature)) {
    console.error('âŒ Signature webhook invalide');
    throw new Error('Signature invalide');
  }

  const { reference, status, external_reference, amount, currency, operator } = payload;

  if (!reference) {
    throw new Error('RÃ©fÃ©rence manquante dans le payload');
  }

  // 2ï¸âƒ£ Double vÃ©rification auprÃ¨s de CamPay (recommandÃ© pour la sÃ©curitÃ©)
  let realStatus = status;
  try {
    const transaction = await getTransactionFromCampay(reference);
    realStatus = transaction.status;
    console.log(`ðŸ” Statut rÃ©el CamPay : ${realStatus}`);
  } catch (err) {
    console.warn('âš ï¸ Impossible de vÃ©rifier le statut, on utilise celui du webhook');
  }

  // 3ï¸âƒ£ Trouver la rÃ©servation concernÃ©e
  const bookingId = external_reference;
  if (!bookingId) {
    console.error('âŒ external_reference (bookingId) manquant');
    return { received: true, warning: 'Pas de bookingId' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      nanny: { include: { user: true } },
    },
  });

  if (!booking) {
    console.error(`âŒ RÃ©servation ${bookingId} introuvable`);
    return { received: true, warning: 'Booking introuvable' };
  }

  // 4ï¸âƒ£ Traiter selon le statut
  switch (realStatus) {
    case 'SUCCESSFUL': {
      // VÃ©rifier qu'on n'a pas dÃ©jÃ  traitÃ© ce paiement
      if (booking.paymentStatus === 'SUCCESS') {
        console.log(`â„¹ï¸ RÃ©servation ${bookingId} dÃ©jÃ  payÃ©e`);
        return { received: true, alreadyProcessed: true };
      }

      // VÃ©rifier le montant (anti-fraude)
      const expectedAmount = Math.round(booking.totalPrice);
      const receivedAmount = parseInt(amount, 10);
      if (receivedAmount !== expectedAmount) {
        console.error(
          `âŒ Montant incorrect : attendu ${expectedAmount} XAF, reÃ§u ${receivedAmount} XAF`
        );
        throw new Error('Montant incorrect');
      }

      // Mettre Ã  jour la rÃ©servation
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'CONFIRMED',
          paidAt: new Date(),
          paymentProvider: operator === 'MTN' ? 'MTN_MOMO' : 'ORANGE_MONEY',
        },
      });

      console.log(`âœ… Paiement confirmÃ© pour rÃ©servation ${bookingId}`);

      // ðŸ”” Notifier la nounou (Ã  implÃ©menter plus tard)
      // await sendNotification(booking.nanny.user.id, 'Nouvelle rÃ©servation payÃ©e');

      break;
    }

    case 'FAILED': {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'FAILED' },
      });

      console.log(`âŒ Paiement Ã©chouÃ© pour rÃ©servation ${bookingId}`);
      break;
    }

    case 'PENDING': {
      console.log(`â³ Paiement toujours en attente pour rÃ©servation ${bookingId}`);
      break;
    }

    default:
      console.warn(`âš ï¸ Statut inconnu : ${realStatus}`);
  }

  return { received: true, status: realStatus };
};

module.exports = {
  processWebhook,
  verifySignature,
  getTransactionFromCampay,
};
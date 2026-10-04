const crypto = require('crypto');
const axios = require('axios');
const prisma = require('../../config/prisma');

const CAMPAY_BASE_URL = process.env.CAMPAY_API_URL || 'https://demo.campay.net/api';
const AUTH_HEADER = Buffer.from(
  `${process.env.CAMPAY_USERNAME}:${process.env.CAMPAY_PASSWORD}`
).toString('base64');

const getHeaders = () => ({
  Authorization: `Token ${AUTH_HEADER}`,
  'Content-Type': 'application/json',
});

/**
 * Vérifie la signature du webhook CamPay
 * CamPay peut envoyer un header X-Campay-Signature (HMAC SHA256)
 */
const verifySignature = (rawBody, signature) => {
  if (!process.env.CAMPAY_WEBHOOK_SECRET) {
    console.warn('⚠️ CAMPAY_WEBHOOK_SECRET non configuré — vérification désactivée');
    return true;
  }

  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', process.env.CAMPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  // Comparaison sécurisée contre les timing attacks
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
 * Récupère le statut réel de la transaction auprès de CamPay
 * (double vérification pour éviter les faux webhooks)
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
  console.log('📩 Webhook CamPay reçu :', JSON.stringify(payload, null, 2));

  // 1️⃣ Vérification de la signature
  if (!verifySignature(rawBody, signature)) {
    console.error('❌ Signature webhook invalide');
    throw new Error('Signature invalide');
  }

  const { reference, status, external_reference, amount, currency, operator } = payload;

  if (!reference) {
    throw new Error('Référence manquante dans le payload');
  }

  // 2️⃣ Double vérification auprès de CamPay (recommandé pour la sécurité)
  let realStatus = status;
  try {
    const transaction = await getTransactionFromCampay(reference);
    realStatus = transaction.status;
    console.log(`🔍 Statut réel CamPay : ${realStatus}`);
  } catch (err) {
    console.warn('⚠️ Impossible de vérifier le statut, on utilise celui du webhook');
  }

  // 3️⃣ Trouver la réservation concernée
  const bookingId = external_reference;
  if (!bookingId) {
    console.error('❌ external_reference (bookingId) manquant');
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
    console.error(`❌ Réservation ${bookingId} introuvable`);
    return { received: true, warning: 'Booking introuvable' };
  }

  // 4️⃣ Traiter selon le statut
  switch (realStatus) {
    case 'SUCCESSFUL': {
      // Vérifier qu'on n'a pas déjà traité ce paiement
      if (booking.paymentStatus === 'SUCCESS') {
        console.log(`ℹ️ Réservation ${bookingId} déjà payée`);
        return { received: true, alreadyProcessed: true };
      }

      // Vérifier le montant (anti-fraude)
      const expectedAmount = Math.round(booking.totalPrice);
      const receivedAmount = parseInt(amount, 10);
      if (receivedAmount !== expectedAmount) {
        console.error(
          `❌ Montant incorrect : attendu ${expectedAmount} XAF, reçu ${receivedAmount} XAF`
        );
        throw new Error('Montant incorrect');
      }

      // Mettre à jour la réservation
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'CONFIRMED',
          paidAt: new Date(),
          paymentProvider: operator === 'MTN' ? 'MTN_MOMO' : 'ORANGE_MONEY',
        },
      });

      console.log(`✅ Paiement confirmé pour réservation ${bookingId}`);

      // 🔔 Notifier la nounou (à implémenter plus tard)
      // await sendNotification(booking.nanny.user.id, 'Nouvelle réservation payée');

      break;
    }

    case 'FAILED': {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'FAILED' },
      });

      console.log(`❌ Paiement échoué pour réservation ${bookingId}`);
      break;
    }

    case 'PENDING': {
      console.log(`⏳ Paiement toujours en attente pour réservation ${bookingId}`);
      break;
    }

    default:
      console.warn(`⚠️ Statut inconnu : ${realStatus}`);
  }

  return { received: true, status: realStatus };
};

module.exports = {
  processWebhook,
  verifySignature,
  getTransactionFromCampay,
};
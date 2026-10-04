const axios = require('axios');
const prisma = require('../../config/prisma');

const COMMISSION_RATE = 0.15;

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const MTN_CONFIG = {
  baseUrl: process.env.MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
  apiUser: process.env.MTN_API_USER,
  apiKey: process.env.MTN_API_KEY,
  targetEnvironment: process.env.MTN_ENV || 'sandbox',
};

const ORANGE_CONFIG = {
  baseUrl: process.env.ORANGE_API_URL || 'https://api.orange.com',
  clientId: process.env.ORANGE_CLIENT_ID,
  clientSecret: process.env.ORANGE_CLIENT_SECRET,
  merchantKey: process.env.ORANGE_MERCHANT_KEY,
};

// ═══════════════════════════════════════════════════════════════
//  MTN MOBILE MONEY
// ═══════════════════════════════════════════════════════════════

// Obtenir un token d'accès MTN
const getMtnToken = async () => {
  const credentials = Buffer.from(
    `${MTN_CONFIG.apiUser}:${MTN_CONFIG.apiKey}`
  ).toString('base64');

  const { data } = await axios.post(
    `${MTN_CONFIG.baseUrl}/collection/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
      },
    }
  );

  return data.access_token;
};

// Initier un paiement MTN (RequestToPay)
const initMtnPayment = async (bookingId, phoneNumber, amount) => {
  const token = await getMtnToken();
  const referenceId = require('crypto').randomUUID();

  const { data } = await axios.post(
    `${MTN_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
    {
      amount: amount.toString(),
      currency: 'XAF',
      externalId: bookingId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber, // Format: 237XXXXXXXXX
      },
      payerMessage: 'Paiement NounouHome',
      payeeNote: `Réservation ${bookingId}`,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': MTN_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
        'Content-Type': 'application/json',
      },
    }
  );

  // Sauvegarder la référence
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentProvider: 'MTN_MOMO',
      paymentReference: referenceId,
      paymentStatus: 'PENDING',
    },
  });

  return {
    referenceId,
    status: 'PENDING',
    message: 'Composez *126# pour confirmer le paiement',
  };
};

// Vérifier le statut MTN
const checkMtnStatus = async (referenceId) => {
  const token = await getMtnToken();

  const { data } = await axios.get(
    `${MTN_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Target-Environment': MTN_CONFIG.targetEnvironment,
        'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
      },
    }
  );

  return data.status; // PENDING, SUCCESSFUL, FAILED
};

// ═══════════════════════════════════════════════════════════════
//  ORANGE MONEY
// ═══════════════════════════════════════════════════════════════

// Obtenir un token Orange
const getOrangeToken = async () => {
  const credentials = Buffer.from(
    `${ORANGE_CONFIG.clientId}:${ORANGE_CONFIG.clientSecret}`
  ).toString('base64');

  const { data } = await axios.post(
    `${ORANGE_CONFIG.baseUrl}/oauth/v3/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return data.access_token;
};

// Initier un paiement Orange (Web Payment)
const initOrangePayment = async (bookingId, phoneNumber, amount) => {
  const token = await getOrangeToken();
  const orderId = `NOUNOU-${bookingId}-${Date.now()}`;

  const { data } = await axios.post(
    `${ORANGE_CONFIG.baseUrl}/orange-money-webpay/cm/v1/webpayment`,
    {
      merchant_key: ORANGE_CONFIG.merchantKey,
      currency: 'XAF',
      order_id: orderId,
      amount: amount,
      return_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancel`,
      notif_url: `${process.env.API_URL}/api/payments/webhook/orange`,
      lang: 'fr',
      reference: `Réservation ${bookingId}`,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentProvider: 'ORANGE_MONEY',
      paymentReference: orderId,
      paymentStatus: 'PENDING',
      paymentUrl: data.payment_url,
    },
  });

  return {
    orderId,
    paymentUrl: data.payment_url, // Rediriger le client ici
    status: 'PENDING',
  };
};

// Vérifier le statut Orange
const checkOrangeStatus = async (orderId) => {
  const token = await getOrangeToken();

  const { data } = await axios.get(
    `${ORANGE_CONFIG.baseUrl}/orange-money-webpay/cm/v1/transactionstatus`,
    {
      params: {
        order_id: orderId,
        amount: amount,
        merchant_key: ORANGE_CONFIG.merchantKey,
      },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data.status; // INITIATED, PENDING, EXPIRED, SUCCESS, FAILED
};

// ═══════════════════════════════════════════════════════════════
//  FONCTION PRINCIPALE — Détection automatique de l'opérateur
// ═══════════════════════════════════════════════════════════════

const detectOperator = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  // MTN Cameroun : préfixes 67, 68, 650-654
  if (/^(237)?(67|68|650|651|652|653|654)/.test(cleaned)) {
    return 'MTN_MOMO';
  }

  // Orange Cameroun : préfixes 69, 655-659
  if (/^(237)?(69|655|656|657|658|659)/.test(cleaned)) {
    return 'ORANGE_MONEY';
  }

  return null;
};

const initiatePayment = async (bookingId, phoneNumber, parentUserId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { parent: true, nanny: true },
  });

  if (!booking) throw new Error('Réservation introuvable');
  if (booking.parent.userId !== parentUserId) throw new Error('Accès refusé');
  if (booking.paymentStatus === 'SUCCESS') throw new Error('Déjà payé');

  const operator = detectOperator(phoneNumber);
  if (!operator) {
    throw new Error('Numéro non reconnu. Utilisez un numéro MTN (67/68/650) ou Orange (69/655)');
  }

  const amount = Math.round(booking.totalPrice);

  if (operator === 'MTN_MOMO') {
    return initMtnPayment(bookingId, phoneNumber, amount);
  }

  return initOrangePayment(bookingId, phoneNumber, amount);
};

module.exports = {
  detectOperator,
  initiatePayment,
  checkMtnStatus,
  checkOrangeStatus,
};
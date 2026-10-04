const axios = require('axios');
const prisma = require('../../config/prisma');

const MOCK_MODE = process.env.CAMPAY_MOCK === 'true';
const MOCK_DELAY_MS = Number(process.env.CAMPAY_MOCK_DELAY || 3000);

const CAMPAY_BASE_URL = (process.env.CAMPAY_API_URL || 'https://demo.campay.net/api').replace(/\/$/, '');

const getAuthHeader = () => {
  const username = process.env.CAMPAY_USERNAME;
  const password = process.env.CAMPAY_PASSWORD;
  if (!username || !password) throw new Error('CAMPAY_USERNAME ou CAMPAY_PASSWORD manquant');
  const credentials = Buffer.from(username + ':' + password).toString('base64');
  return 'Token ' + credentials;
};

const detectOperator = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (/^(237)?(67|68|650|651|652|653|654)/.test(cleaned)) return 'MTN';
  if (/^(237)?(69|655|656|657|658|659)/.test(cleaned)) return 'ORANGE';
  return 'UNKNOWN';
};

const mockInitiate = async (bookingId, phoneNumber, amount) => {
  const fakeRef = 'MOCK-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const operator = detectOperator(phoneNumber);
  console.log('[MOCK] Initiation paiement', { reference: fakeRef, amount, phoneNumber, operator });
  return {
    reference: fakeRef,
    ussdCode: operator === 'MTN' ? '*126#' : '*150#',
    operator,
    status: 'PENDING',
  };
};

const initiatePayment = async (bookingId, phoneNumber, parentUserId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { parent: true, nanny: true },
  });

  if (!booking) throw new Error('Reservation introuvable');
  if (booking.parent.userId !== parentUserId) throw new Error('Acces refuse');

  // ⚠️ Verifications de statut
  if (booking.paymentStatus === 'SUCCESS') throw new Error('Cette reservation est deja payee');
  if (booking.status === 'CANCELLED') throw new Error('Cette reservation a ete annulee');
  if (booking.status === 'COMPLETED') throw new Error('Cette reservation est terminee');

  // ⚠️ Le paiement n'est possible QUE si la nounou a accepte
  if (booking.status !== 'CONFIRMED') {
    throw new Error('Le paiement sera disponible des que la nounou aura accepte votre reservation');
  }

  const amount = Math.round(booking.totalPrice);

  if (MOCK_MODE) {
    const mockResult = await mockInitiate(bookingId, phoneNumber, amount);
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProvider: 'CAMPAY',
        paymentReference: mockResult.reference,
        paymentStatus: 'PENDING',
        paymentPhone: phoneNumber,
      },
    });
    return mockResult;
  }

  const authHeader = getAuthHeader();
  const url = CAMPAY_BASE_URL + '/collect/';
  console.log('POST', url);

  const payload = {
    amount: amount.toString(),
    currency: 'XAF',
    from: phoneNumber,
    description: 'Paiement NounouHome - Reservation ' + bookingId,
    external_reference: bookingId,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProvider: 'CAMPAY',
        paymentReference: response.data.reference,
        paymentStatus: 'PENDING',
        paymentPhone: phoneNumber,
      },
    });

    return {
      reference: response.data.reference,
      ussdCode: response.data.ussd_code || response.data.ussd,
      operator: response.data.operator || detectOperator(phoneNumber),
      status: 'PENDING',
    };
  } catch (err) {
    throw new Error((err.response && err.response.data && err.response.data.message) || err.message);
  }
};

const mockCheckStatus = async (reference) => {
  const parts = reference.split('-');
  const timestamp = parseInt(parts[1], 10);
  const elapsed = Date.now() - timestamp;
  if (elapsed > MOCK_DELAY_MS) return 'SUCCESSFUL';
  return 'PENDING';
};

const checkPaymentStatus = async (bookingId) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || !booking.paymentReference) throw new Error('Reference introuvable');

  let status;

  if (MOCK_MODE) {
    status = await mockCheckStatus(booking.paymentReference);
  } else {
    const authHeader = getAuthHeader();
    const url = CAMPAY_BASE_URL + '/transaction/' + booking.paymentReference + '/';
    try {
      const response = await axios.get(url, {
        headers: { Authorization: authHeader },
        timeout: 15000,
      });
      status = response.data.status;
    } catch (err) {
      throw new Error((err.response && err.response.data && err.response.data.message) || err.message);
    }
  }

  if (status === 'SUCCESSFUL' && booking.paymentStatus !== 'SUCCESS') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'SUCCESS', paidAt: new Date() },
    });
    console.log('Booking ' + bookingId + ' marque comme paye');
  } else if (status === 'FAILED') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'FAILED' },
    });
  }

  return { status, reference: booking.paymentReference };
};

module.exports = { initiatePayment, checkPaymentStatus, detectOperator };
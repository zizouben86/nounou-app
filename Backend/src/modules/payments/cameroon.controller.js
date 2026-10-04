const service = require('./cameroon.service');

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
    const { bookingId } = req.params;
    const booking = await require('../../config/prisma').booking.findUnique({
      where: { id: bookingId },
    });

    let status;
    if (booking.paymentProvider === 'MTN_MOMO') {
      status = await service.checkMtnStatus(booking.paymentReference);
    } else if (booking.paymentProvider === 'ORANGE_MONEY') {
      status = await service.checkOrangeStatus(booking.paymentReference);
    }

    res.json({ status, reference: booking.paymentReference });
  } catch (err) {
    next(err);
  }
};

// Webhooks
const mtnWebhook = async (req, res, next) => {
  try {
    const { referenceId, status, externalId } = req.body;

    if (status === 'SUCCESSFUL') {
      await require('../../config/prisma').booking.update({
        where: { id: externalId },
        data: { paymentStatus: 'SUCCESS', status: 'CONFIRMED', paidAt: new Date() },
      });
    } else if (status === 'FAILED') {
      await require('../../config/prisma').booking.update({
        where: { id: externalId },
        data: { paymentStatus: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

const orangeWebhook = async (req, res, next) => {
  try {
    const { status, order_id, notif_token } = req.body;

    const booking = await require('../../config/prisma').booking.findFirst({
      where: { paymentReference: order_id },
    });

    if (!booking) return res.json({ received: true });

    if (status === 'SUCCESS') {
      await require('../../config/prisma').booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'SUCCESS', status: 'CONFIRMED', paidAt: new Date() },
      });
    } else if (status === 'FAILED') {
      await require('../../config/prisma').booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiate, checkStatus, mtnWebhook, orangeWebhook };
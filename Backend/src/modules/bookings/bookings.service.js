const prisma = require('../../config/prisma');
const { notifyNewBooking } = require('../../socket');
const { emitNotification } = require('../../socket');

const COMMISSION_RATE = 0.15;

const create = async (parentUserId, data) => {
  const parent = await prisma.parentProfile.findUnique({ where: { userId: parentUserId } });
  if (!parent) {
    const err = new Error('Profil parent introuvable');
    err.status = 404;
    throw err;
  }
  const nanny = await prisma.nannyProfile.findUnique({ where: { id: data.nannyId } });
  if (!nanny) {
    const err = new Error('Nounou introuvable');
    err.status = 404;
    throw err;
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
  const totalPrice = +(hours * nanny.hourlyRate).toFixed(2);
  const commission = +(totalPrice * COMMISSION_RATE).toFixed(2);

  const booking = await prisma.booking.create({
    data: {
      parentId: parent.id,
      nannyId: nanny.id,
      startDate: start,
      endDate: end,
      type: data.type,
      notes: data.notes,
      totalPrice,
      commission,
    },
  });

  // Notifier la nounou (nouvelle reservation)
  notifyNewBooking(booking.id).catch(err => console.error('[Notify]', err));

  return booking;
};

const listMine = async (userId, role) => {
  if (role === 'PARENT') {
    const parent = await prisma.parentProfile.findUnique({ where: { userId } });
    if (!parent) return [];
    return prisma.booking.findMany({
      where: { parentId: parent.id },
      include: { nanny: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  if (role === 'NANNY') {
    const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
    if (!nanny) return [];
    return prisma.booking.findMany({
      where: { nannyId: nanny.id },
      include: { parent: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  return [];
};

const updateStatus = async (bookingId, userId, role, status) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      nanny: { include: { user: true } },
      parent: { include: { user: true } },
    },
  });

  if (!booking) {
    const err = new Error('Reservation introuvable');
    err.status = 404;
    throw err;
  }

  const isOwner =
    (role === 'PARENT' && booking.parent.userId === userId) ||
    (role === 'NANNY' && booking.nanny.userId === userId) ||
    role === 'ADMIN';

  if (!isOwner) {
    const err = new Error('Acces refuse');
    err.status = 403;
    throw err;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  // ═══════════════════════════════════════════════════════
  //  Si le PARENT annule → notifier la NOUNOU + event live
  // ═══════════════════════════════════════════════════════
  if (status === 'CANCELLED' && role === 'PARENT') {
    const parentName = booking.parent.user.firstName + ' ' + booking.parent.user.lastName;
    const reason = booking.paymentStatus === 'SUCCESS'
      ? 'a annule la reservation (remboursement en cours)'
      : 'a annule la reservation avant paiement';

    // 1. Notification persistee
    await emitNotification({
      userId: booking.nanny.userId,
      type: 'BOOKING_CANCELLED_BY_PARENT',
      title: 'Reservation annulee',
      message: parentName + ' ' + reason,
      link: '/nanny/dashboard?filter=CANCELLED',
      data: {
        bookingId: booking.id,
        parentName,
        reason,
      },
    }).catch(err => console.error('[Notify]', err));

    // 2. Event temps reel pour retirer la ligne du dashboard
    const { getIo } = require('../../socket');
    const io = getIo();
    if (io) {
      io.to('user:' + booking.nanny.userId).emit('booking:cancelled', {
        bookingId: booking.id,
        reason: reason,
        parentName,
      });
      console.log('[Socket] booking:cancelled envoye a la nounou', booking.nanny.userId);
    }
  }

  // ═══════════════════════════════════════════════════════
  //  Si la NOUNOU refuse → notifier le PARENT
  // ═══════════════════════════════════════════════════════
  if (status === 'CANCELLED' && role === 'NANNY') {
    const nannyName = booking.nanny.user.firstName + ' ' + booking.nanny.user.lastName;

    await emitNotification({
      userId: booking.parent.userId,
      type: 'BOOKING_REFUSED',
      title: 'Reservation refusee',
      message: nannyName + ' a refuse votre demande',
      link: '/dashboard?filter=CANCELLED',
      data: { bookingId: booking.id },
    }).catch(err => console.error('[Notify]', err));
  }

  return updated;
};

module.exports = { create, listMine, updateStatus };
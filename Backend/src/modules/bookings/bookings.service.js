const prisma = require('../../config/prisma');
const { sendEmail } = require('../emails/email.service');
const templates = require('../emails/email.templates');

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
    include: {
      parent: { include: { user: true } },
      nanny: { include: { user: true } },
    },
  });

  setImmediate(async () => {
    try {
      const parentTpl = templates.bookingConfirmationParent({
        firstName: booking.parent.user.firstName,
        nannyName: booking.nanny.user.firstName + ' ' + booking.nanny.user.lastName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
      });

      await sendEmail({
        to: booking.parent.user.email,
        subject: parentTpl.subject,
        htmlContent: parentTpl.html,
        textContent: parentTpl.text,
      });

      const nannyTpl = templates.bookingNotificationNanny({
        nannyFirstName: booking.nanny.user.firstName,
        parentName: booking.parent.user.firstName + ' ' + booking.parent.user.lastName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
      });

      await sendEmail({
        to: booking.nanny.user.email,
        subject: nannyTpl.subject,
        htmlContent: nannyTpl.html,
        textContent: nannyTpl.text,
      });
    } catch (err) {
      console.error('Erreur emails booking:', err.message);
    }
  });

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
    include: { nanny: true, parent: true },
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
  return prisma.booking.update({ where: { id: bookingId }, data: { status } });
};

module.exports = { create, listMine, updateStatus };
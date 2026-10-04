const prisma = require('../../config/prisma');

const COMMISSION_RATE = 0.15; // 15% de commission agence

const create = async (parentUserId, data) => {
  const parent = await prisma.parentProfile.findUnique({
    where: { userId: parentUserId },
  });
  if (!parent) {
    const err = new Error('Profil parent introuvable');
    err.status = 404;
    throw err;
  }

  const nanny = await prisma.nannyProfile.findUnique({
    where: { id: data.nannyId },
  });
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

  return prisma.booking.create({
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
};

const listMine = async (userId, role) => {
  if (role === 'PARENT') {
    const parent = await prisma.parentProfile.findUnique({ where: { userId } });
    return prisma.booking.findMany({
      where: { parentId: parent.id },
      include: { nanny: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  if (role === 'NANNY') {
    const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
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
    const err = new Error('Réservation introuvable');
    err.status = 404;
    throw err;
  }

  // Vérification des droits
  const isOwner =
    (role === 'PARENT' && booking.parent.userId === userId) ||
    (role === 'NANNY' && booking.nanny.userId === userId) ||
    role === 'ADMIN';
  if (!isOwner) {
    const err = new Error('Accès refusé');
    err.status = 403;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

module.exports = { create, listMine, updateStatus };
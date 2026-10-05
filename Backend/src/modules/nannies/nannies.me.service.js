const prisma = require('../../config/prisma');
const { notifyBookingResponse, notifyBookingCompleted } = require('../../socket');

const getMyProfile = async (userId) => {
  const nanny = await prisma.nannyProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
      disponibilities: true,
    },
  });
  if (!nanny) {
    const err = new Error('Profil nounou introuvable');
    err.status = 404;
    throw err;
  }
  return nanny;
};

const updateMyProfile = async (userId, data) => {
  const allowed = ['bio', 'hourlyRate', 'experienceYears', 'languages', 'certifications', 'city', 'postalCode', 'isAvailable'];
  const updateData = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  if (updateData.hourlyRate !== undefined && (updateData.hourlyRate < 5 || updateData.hourlyRate > 200)) {
    const err = new Error('Tarif horaire invalide (doit etre entre 5 et 200)');
    err.status = 400;
    throw err;
  }
  return prisma.nannyProfile.update({ where: { userId }, data: updateData });
};

const toggleAvailability = async (userId) => {
  const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
  if (!nanny) {
    const err = new Error('Profil nounou introuvable');
    err.status = 404;
    throw err;
  }
  return prisma.nannyProfile.update({
    where: { userId },
    data: { isAvailable: !nanny.isAvailable },
  });
};

const getMyBookings = async (userId) => {
  const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
  if (!nanny) throw new Error('Profil nounou introuvable');
  return prisma.booking.findMany({
    where: { nannyId: nanny.id },
    include: {
      parent: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          children: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getMyStats = async (userId) => {
  const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
  if (!nanny) throw new Error('Profil nounou introuvable');
  const [total, pending, confirmed, completed, cancelled, revenueAgg, pendingRevenueAgg] = await Promise.all([
    prisma.booking.count({ where: { nannyId: nanny.id } }),
    prisma.booking.count({ where: { nannyId: nanny.id, status: 'PENDING' } }),
    prisma.booking.count({ where: { nannyId: nanny.id, status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { nannyId: nanny.id, status: 'COMPLETED' } }),
    prisma.booking.count({ where: { nannyId: nanny.id, status: 'CANCELLED' } }),
    prisma.booking.aggregate({
      where: { nannyId: nanny.id, status: 'COMPLETED', paymentStatus: 'SUCCESS' },
      _sum: { totalPrice: true, commission: true },
    }),
    prisma.booking.aggregate({
      where: { nannyId: nanny.id, status: 'CONFIRMED', paymentStatus: 'SUCCESS' },
      _sum: { totalPrice: true, commission: true },
    }),
  ]);
  const totalEarned = revenueAgg._sum.totalPrice || 0;
  const totalCommission = revenueAgg._sum.commission || 0;
  const netEarnings = totalEarned - totalCommission;
  const pendingEarned = pendingRevenueAgg._sum.totalPrice || 0;
  const pendingCommission = pendingRevenueAgg._sum.commission || 0;
  const pendingNet = pendingEarned - pendingCommission;
  return {
    bookings: { total, pending, confirmed, completed, cancelled },
    revenue: {
      gross: +totalEarned.toFixed(2),
      commission: +totalCommission.toFixed(2),
      net: +netEarnings.toFixed(2),
      pendingNet: +pendingNet.toFixed(2),
    },
    profile: {
      ratingAvg: nanny.ratingAvg,
      ratingCount: nanny.ratingCount,
      isAvailable: nanny.isAvailable,
      verificationStatus: nanny.verificationStatus,
    },
  };
};

const respondToBooking = async (userId, bookingId, action) => {
  if (!['accept', 'refuse'].includes(action)) {
    const err = new Error('Action invalide');
    err.status = 400;
    throw err;
  }
  const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
  if (!nanny) throw new Error('Profil nounou introuvable');
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { nanny: true },
  });
  if (!booking) {
    const err = new Error('Reservation introuvable');
    err.status = 404;
    throw err;
  }
  if (booking.nannyId !== nanny.id) {
    const err = new Error('Cette reservation ne vous appartient pas');
    err.status = 403;
    throw err;
  }
  if (booking.status !== 'PENDING') {
    const err = new Error('Cette reservation a deja ete traitee');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: action === 'accept' ? 'CONFIRMED' : 'CANCELLED' },
  });

  // ⚡ Notification temps reel au parent
  notifyBookingResponse(bookingId, action === 'accept').catch(err => console.error('[Notify]', err));

  return updated;
};

const markAsCompleted = async (userId, bookingId) => {
  const nanny = await prisma.nannyProfile.findUnique({ where: { userId } });
  if (!nanny) throw new Error('Profil nounou introuvable');
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.nannyId !== nanny.id) {
    const err = new Error('Reservation introuvable');
    err.status = 404;
    throw err;
  }
  if (booking.status === 'COMPLETED') {
    const err = new Error('Cette reservation est deja terminee');
    err.status = 400;
    throw err;
  }
  if (booking.status !== 'CONFIRMED') {
    const err = new Error('Cette reservation doit etre confirmee avant d\'etre terminee');
    err.status = 400;
    throw err;
  }
  if (booking.paymentStatus !== 'SUCCESS') {
    const err = new Error('Le parent doit d\'abord payer avant que vous puissiez marquer la prestation comme terminee');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'COMPLETED' },
  });

  // ⚡ Notification temps reel au parent
  notifyBookingCompleted(bookingId).catch(err => console.error('[Notify]', err));

  return updated;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  toggleAvailability,
  getMyBookings,
  getMyStats,
  respondToBooking,
  markAsCompleted,
};
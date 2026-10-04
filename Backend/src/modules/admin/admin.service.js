const prisma = require('../../config/prisma');

const getStats = async () => {
  const [
    totalUsers,
    totalParents,
    totalNannies,
    pendingNannies,
    totalBookings,
    completedBookings,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PARENT' } }),
    prisma.user.count({ where: { role: 'NANNY' } }),
    prisma.nannyProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { commission: true, totalPrice: true },
    }),
  ]);

  return {
    users: { total: totalUsers, parents: totalParents, nannies: totalNannies },
    nannies: { pending: pendingNannies },
    bookings: { total: totalBookings, completed: completedBookings },
    revenue: {
      total: revenueAgg._sum.totalPrice || 0,
      commission: revenueAgg._sum.commission || 0,
    },
  };
};

const listPendingNannies = async () => {
  return prisma.nannyProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });
};

const listAllUsers = async ({ role, page = 1, limit = 20 }) => {
  const where = role ? { role } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
};

const verifyNanny = async (nannyId, status) => {
  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    throw new Error('Statut invalide');
  }
  return prisma.nannyProfile.update({
    where: { id: nannyId },
    data: { verificationStatus: status, isAvailable: status === 'VERIFIED' },
  });
};

const listAllBookings = async ({ status, page = 1, limit = 20 }) => {
  const where = status ? { status } : {};
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { include: { user: { select: { firstName: true, lastName: true } } } },
        nanny: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.booking.count({ where }),
  ]);
  return { bookings, total, page, pages: Math.ceil(total / limit) };
};

const updateUserRole = async (userId, role) => {
  if (!['PARENT', 'NANNY', 'ADMIN'].includes(role)) throw new Error('Rôle invalide');
  return prisma.user.update({ where: { id: userId }, data: { role } });
};

const deleteUser = async (userId) => {
  return prisma.user.delete({ where: { id: userId } });
};

module.exports = {
  getStats,
  listPendingNannies,
  listAllUsers,
  verifyNanny,
  listAllBookings,
  updateUserRole,
  deleteUser,
};
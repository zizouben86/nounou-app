const prisma = require('../../config/prisma');

const create = async (userId, { bookingId, rating, comment }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { parent: true, nanny: true, review: true },
  });

  if (!booking) {
    const err = new Error('Réservation introuvable');
    err.status = 404;
    throw err;
  }
  if (booking.parent.userId !== userId) {
    const err = new Error('Seul le parent peut noter');
    err.status = 403;
    throw err;
  }
  if (booking.status !== 'COMPLETED') {
    const err = new Error('La prestation doit être terminée');
    err.status = 400;
    throw err;
  }
  if (booking.review) {
    const err = new Error('Avis déjà déposé');
    err.status = 409;
    throw err;
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      authorId: userId,
      nannyId: booking.nannyId,
      rating,
      comment,
    },
  });

  // Mise à jour de la moyenne
  const agg = await prisma.review.aggregate({
    where: { nannyId: booking.nannyId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.nannyProfile.update({
    where: { id: booking.nannyId },
    data: {
      ratingAvg: agg._avg.rating || 0,
      ratingCount: agg._count,
    },
  });

  return review;
};

module.exports = { create };
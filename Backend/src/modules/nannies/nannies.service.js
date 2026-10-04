const prisma = require('../../config/prisma');

const search = async ({ city, minRate, maxRate, minExperience, languages }) => {
  const where = {
    verificationStatus: 'VERIFIED',
    isAvailable: true,
  };

  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (minRate || maxRate) {
    where.hourlyRate = {};
    if (minRate) where.hourlyRate.gte = Number(minRate);
    if (maxRate) where.hourlyRate.lte = Number(maxRate);
  }
  if (minExperience) where.experienceYears = { gte: Number(minExperience) };
  if (languages) where.languages = { hasSome: languages.split(',') };

  return prisma.nannyProfile.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      disponibilities: true,
    },
    orderBy: { ratingAvg: 'desc' },
    take: 50,
  });
};

const getById = async (id) => {
  const nanny = await prisma.nannyProfile.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      disponibilities: true,
      reviews: {
        include: { author: { select: { firstName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
  if (!nanny) {
    const err = new Error('Nounou introuvable');
    err.status = 404;
    throw err;
  }
  return nanny;
};

const updateMyProfile = async (userId, data) => {
  return prisma.nannyProfile.update({
    where: { userId },
    data,
  });
};

module.exports = { search, getById, updateMyProfile };
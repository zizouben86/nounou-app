const prisma = require('../../config/prisma');
const { filterByRadius } = require('../geo/geo.service');

const search = async (query) => {
  const {
    city,
    minRate,
    maxRate,
    minExperience,
    languages,
    latitude,
    longitude,
    maxKm,
  } = query;

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

  let nannies = await prisma.nannyProfile.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } },
      disponibilities: true,
    },
    orderBy: { ratingAvg: 'desc' },
    take: 100,
  });

  if (latitude && longitude && maxKm) {
    nannies = filterByRadius(
      nannies,
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(maxKm)
    );
  }

  return nannies;
};

const getById = async (id) => {
  const nanny = await prisma.nannyProfile.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } },
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

// ⚡ NOUVEAU : Récupérer le profil de la nounou connectée
const getMe = async (userId) => {
  const nanny = await prisma.nannyProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
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
  // Filtrer les champs autorisés
  const allowed = [
  'bio', 'hourlyRate', 'experienceYears', 'city', 'postalCode', 
  'languages', 'certifications', 'isAvailable',
  'idCardUrl', 'criminalRecordUrl', 'diplomaUrl', 'verificationNotes'
];
  const updateData = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  const updated = await prisma.nannyProfile.update({
    where: { userId },
    data: updateData,
  });

  // Si la ville a changé, relancer le géocodage
  if (data.city) {
    const { geocodeAddress } = require('../geo/geo.service');
    setImmediate(async () => {
      try {
        const coords = await geocodeAddress(null, updated.city, updated.postalCode);
        if (coords) {
          await prisma.nannyProfile.update({
            where: { id: updated.id },
            data: { latitude: coords.latitude, longitude: coords.longitude },
          });
          console.log('✅ Nounou re-geocode : ' + coords.displayName);
        }
      } catch (err) {
        console.error('Erreur re-geocoding:', err.message);
      }
    });
  }

  return updated;
};

module.exports = { search, getById, getMe, updateMyProfile };
const prisma = require('../../config/prisma');
const { geocodeAddress } = require('../geo/geo.service');

// Recuperer le profil complet du parent connecte
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      parentProfile: {
        include: { children: true },
      },
      nannyProfile: true,
    },
  });

  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }

  return user;
};

// Mettre a jour le profil du parent
const updateMe = async (userId, data) => {
  // Mettre a jour les infos User
  const userData = {};
  if (data.firstName) userData.firstName = data.firstName;
  if (data.lastName) userData.lastName = data.lastName;
  if (data.phone !== undefined) userData.phone = data.phone;

  if (Object.keys(userData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  // Mettre a jour le ParentProfile si l'utilisateur est un parent
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user.role === 'PARENT') {
    const parentData = {};
    if (data.address) parentData.address = data.address;
    if (data.city) parentData.city = data.city;
    if (data.postalCode) parentData.postalCode = data.postalCode;

    if (Object.keys(parentData).length > 0) {
      await prisma.parentProfile.update({
        where: { userId },
        data: parentData,
      });

      // Re-geocodage si la ville a change
      if (data.city || data.address) {
        const parent = await prisma.parentProfile.findUnique({ where: { userId } });
        setImmediate(async () => {
          try {
            const coords = await geocodeAddress(
              parent.address,
              parent.city,
              parent.postalCode
            );
            if (coords) {
              await prisma.parentProfile.update({
                where: { id: parent.id },
                data: { latitude: coords.latitude, longitude: coords.longitude },
              });
              console.log('✅ Parent re-geocode : ' + coords.displayName);
            }
          } catch (err) {
            console.error('Erreur re-geocoding parent:', err.message);
          }
        });
      }
    }
  }

  return getMe(userId);
};

// Ajouter un enfant
const addChild = async (userId, data) => {
  // Vérifie que le parent existe
  const parent = await prisma.parentProfile.findUnique({ where: { userId } });
  if (!parent) {
    const err = new Error('Profil parent introuvable');
    err.status = 404;
    throw err;
  }

  // Crée l'enfant
  return prisma.child.create({
    data: {
      parentId: parent.id,
      firstName: data.firstName,
      birthDate: new Date(data.birthDate),
      allergies: data.allergies || null,
      specialNeeds: data.specialNeeds || null,
    },
  });
};

// Supprimer un enfant
const deleteChild = async (userId, childId) => {
  const parent = await prisma.parentProfile.findUnique({ where: { userId } });
  if (!parent) {
    const err = new Error('Profil parent introuvable');
    err.status = 404;
    throw err;
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: parent.id },
  });

  if (!child) {
    const err = new Error('Enfant introuvable');
    err.status = 404;
    throw err;
  }

  return prisma.child.delete({ where: { id: childId } });
};
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, avatarUrl: true },
  });
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { getMe, updateMe, addChild, deleteChild, getUserById };

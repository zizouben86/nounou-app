const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { signToken } = require('../../utils/jwt');

const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email déjà utilisé');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    },
  });

  // Création du profil associé selon le rôle
  if (data.role === 'PARENT') {
    await prisma.parentProfile.create({
      data: {
        userId: user.id,
        address: 'À compléter',
        city: 'À compléter',
        postalCode: '00000',
      },
    });
  } else if (data.role === 'NANNY') {
    await prisma.nannyProfile.create({
      data: {
        userId: user.id,
        bio: 'À compléter',
        hourlyRate: 15,
        experienceYears: 0,
        languages: [],
        certifications: [],
        city: 'À compléter',
        postalCode: '00000',
      },
    });
  }

  const token = signToken({ id: user.id, role: user.role });
  return { user: { id: user.id, email: user.email, role: user.role }, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });
  return {
    user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName },
    token,
  };
};

module.exports = { register, login };
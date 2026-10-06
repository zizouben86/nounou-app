const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { signToken } = require('../../utils/jwt');
const { sendEmail } = require('../emails/email.service');
const templates = require('../emails/email.templates');

const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email dÃ©jÃ  utilisÃ©');
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

  // CrÃ©ation du profil associÃ© selon le rÃ´le
  if (data.role === 'PARENT') {
    await prisma.parentProfile.create({
      data: {
        userId: user.id,
        address: 'Ã€ complÃ©ter',
        city: 'Ã€ complÃ©ter',
        postalCode: '00000',
      },
    });
  } else if (data.role === 'NANNY') {
    await prisma.nannyProfile.create({
      data: {
        userId: user.id,
        bio: 'Ã€ complÃ©ter',
        hourlyRate: 15,
        experienceYears: 0,
        languages: [],
        certifications: [],
        city: 'Ã€ complÃ©ter',
        postalCode: '00000',
      },
    });
  }

  const token = signToken({ id: user.id, role: user.role });

  // Envoi email bienvenue en arriere-plan
  setImmediate(async () => {
    try {
      const template = data.role === 'PARENT'
        ? templates.welcomeParent({ firstName: user.firstName })
        : templates.welcomeNanny({ firstName: user.firstName });

      await sendEmail({
        to: user.email,
        subject: template.subject,
        htmlContent: template.html,
        textContent: template.text,
      });
    } catch (err) {
      console.error('Erreur email bienvenue:', err.message);
    }
  });

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
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/prisma');
const { signToken } = require('../../utils/jwt');
const { sendEmail } = require('../emails/email.service');
const templates = require('../emails/email.templates');
const { geocodeAddress } = require('../geo/geo.service');

const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email deja utilise');
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

  if (data.role === 'PARENT') {
    const parentProfile = await prisma.parentProfile.create({
      data: {
        userId: user.id,
        address: data.address || 'A completer',
        city: data.city || 'A completer',
        postalCode: data.postalCode || '00000',
      },
    });

    setImmediate(async () => {
      try {
        const coords = await geocodeAddress(
          parentProfile.address,
          parentProfile.city,
          parentProfile.postalCode
        );
        if (coords) {
          await prisma.parentProfile.update({
            where: { id: parentProfile.id },
            data: { latitude: coords.latitude, longitude: coords.longitude },
          });
          console.log('✅ Parent geocode : ' + coords.displayName);
        }
      } catch (err) {
        console.error('Erreur geocoding parent:', err.message);
      }
    });
  } else if (data.role === 'NANNY') {
    const nannyProfile = await prisma.nannyProfile.create({
      data: {
        userId: user.id,
        bio: 'A completer',
        hourlyRate: 15,
        experienceYears: 0,
        languages: [],
        certifications: [],
        city: data.city || 'A completer',
        postalCode: data.postalCode || '00000',
      },
    });

    setImmediate(async () => {
      try {
        const coords = await geocodeAddress(null, nannyProfile.city, nannyProfile.postalCode);
        if (coords) {
          await prisma.nannyProfile.update({
            where: { id: nannyProfile.id },
            data: { latitude: coords.latitude, longitude: coords.longitude },
          });
          console.log('✅ Nounou geocode : ' + coords.displayName);
        }
      } catch (err) {
        console.error('Erreur geocoding nounou:', err.message);
      }
    });
  }

  const token = signToken({ id: user.id, role: user.role });

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

  return {
    user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName },
    token,
  };
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

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Reponse generique pour eviter l'enumeration d'emails
  if (!user) {
    return { message: 'Si cet email existe, un lien a ete envoye.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') +
    '/reset-password?token=' + resetToken;

  setImmediate(async () => {
    try {
      const template = templates.passwordReset({
        firstName: user.firstName,
        resetUrl,
      });
      await sendEmail({
        to: user.email,
        subject: template.subject,
        htmlContent: template.html,
        textContent: template.text,
      });
      console.log('✅ Email reset envoye a ' + user.email);
    } catch (err) {
      console.error('Erreur email reset:', err.message);
    }
  });

  return { message: 'Si cet email existe, un lien a ete envoye.' };
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword || newPassword.length < 8) {
    const err = new Error('Donnees invalides');
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const err = new Error('Token invalide ou expire');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Mot de passe reinitialise avec succes.' };
};

module.exports = { register, login, forgotPassword, resetPassword };
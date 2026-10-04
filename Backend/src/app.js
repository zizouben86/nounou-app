app.get('/debug/env', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtExpires: !!process.env.JWT_EXPIRES_IN,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV,
    campayMock: process.env.CAMPAY_MOCK,
  });
});
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./modules/auth/auth.routes');
const nannyRoutes = require('./modules/nannies/nannies.routes');
const nannyMeRoutes = require('./modules/nannies/nannies.me.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const messageRoutes = require('./modules/messages/messages.routes');
const campayWebhookRoutes = require('./modules/payments/campay.webhook.routes');
const campayRoutes = require('./modules/payments/campay.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());

// Webhook CamPay - RAW BODY
app.use('/api/payments/campay/webhook', express.raw({ type: 'application/json' }), campayWebhookRoutes);

// Parser JSON
app.use(express.json());

// Rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Trop de requetes.',
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/nannies', nannyRoutes);
app.use('/api/nanny/me', nannyMeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments/campay', campayRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
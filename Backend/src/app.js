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
const notificationRoutes = require('./modules/notifications/notifications.routes');
const { errorHandler } = require('./middlewares/error.middleware');

// 1. Initialiser Express AVANT tout
const app = express();

// 2. Middlewares globaux
app.use(helmet());
app.use(cors());

// 3. Webhook CamPay - RAW BODY (avant express.json)
app.use(
  '/api/payments/campay/webhook',
  express.raw({ type: 'application/json' }),
  campayWebhookRoutes
);

// 4. Parser JSON pour le reste
app.use(express.json());

// 5. Rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Trop de requetes.',
}));

// 6. Routes de base
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 7. Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/nannies', nannyRoutes);
app.use('/api/nanny/me', nannyMeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments/campay', campayRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 8. Gestionnaire d'erreurs (TOUJOURS EN DERNIER)
app.use(errorHandler);

module.exports = app;
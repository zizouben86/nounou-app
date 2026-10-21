const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const nannyRoutes = require('./modules/nannies/nannies.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const messageRoutes = require('./modules/messages/messages.routes');
const campayRoutes = require('./modules/payments/campay.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const userRoutes = require('./modules/users/users.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());

// Servir les fichiers uploades (documents de verification)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Webhook CamPay AVANT express.json() (raw body obligatoire)
app.use('/api/payments/campay', campayRoutes);

// Parser JSON pour le reste
app.use(express.json());

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Trop de requetes.',
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/nannies', nannyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

module.exports = app;
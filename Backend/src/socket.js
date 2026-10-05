const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
const prisma = require('./config/prisma');
const notificationsService = require('./modules/notifications/notifications.service');

let io;
const connectedUsers = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Token manquant'));
      const user = verifyToken(token);
      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket] User connecte :', socket.userId);
    connectedUsers.set(socket.userId, socket.id);
    socket.join('user:' + socket.userId);

    socket.emit('connected', { userId: socket.userId });

    // MESSAGERIE
    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        if (!content || !content.trim()) return;
        const message = await prisma.message.create({
          data: { senderId: socket.userId, receiverId, content: content.trim() },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        });
        io.to('user:' + receiverId).emit('message:new', message);
        socket.emit('message:sent', message);

        // Persister + envoyer notification
        await emitNotification({
          userId: receiverId,
          type: 'MESSAGE',
          title: 'Nouveau message',
          message: message.sender.firstName + ' vous a envoye un message',
          link: '/messages',
          data: { messageId: message.id, senderId: socket.userId },
        });
      } catch (err) {
        console.error('[Socket] message:send', err);
      }
    });

    socket.on('message:read', async ({ senderId }) => {
      try {
        await prisma.message.updateMany({
          where: { senderId, receiverId: socket.userId, isRead: false },
          data: { isRead: true },
        });
        io.to('user:' + senderId).emit('message:read:ack', { by: socket.userId });
      } catch (err) { console.error('[Socket] message:read', err); }
    });

    socket.on('typing:start', ({ receiverId }) => {
      io.to('user:' + receiverId).emit('typing:start', { from: socket.userId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      io.to('user:' + receiverId).emit('typing:stop', { from: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] User deconnecte :', socket.userId);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};

const getIo = () => io;

/**
 * Creer une notification en base + l'envoyer en temps reel
 */
const emitNotification = async ({ userId, type, title, message, link, data }) => {
  try {
    // Persister en base
    const notification = await notificationsService.createNotification({
      userId,
      type,
      title,
      message,
      link,
      data,
    });

    // Envoyer en temps reel
    if (io) {
      io.to('user:' + userId).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('[Notify] emitNotification', err);
  }
};

// ============ HELPERS SPECIFIQUES ============

const notifyNewBooking = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        nanny: { include: { user: true } },
        parent: { include: { user: true } },
      },
    });
    if (!booking) return;

    await emitNotification({
      userId: booking.nanny.userId,
      type: 'NEW_BOOKING',
      title: 'Nouvelle demande de reservation',
      message: booking.parent.user.firstName + ' veut reserver vos services',
      link: '/nanny/dashboard?filter=PENDING',
      data: {
        bookingId: booking.id,
        parentName: booking.parent.user.firstName + ' ' + booking.parent.user.lastName,
      },
    });
  } catch (err) { console.error('[Notify] notifyNewBooking', err); }
};

const notifyBookingResponse = async (bookingId, accepted) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        nanny: { include: { user: true } },
        parent: { include: { user: true } },
      },
    });
    if (!booking) return;

    await emitNotification({
      userId: booking.parent.userId,
      type: accepted ? 'BOOKING_ACCEPTED' : 'BOOKING_REFUSED',
      title: accepted ? 'Reservation acceptee !' : 'Reservation refusee',
      message: accepted
        ? booking.nanny.user.firstName + ' a accepte votre demande. Vous pouvez payer.'
        : booking.nanny.user.firstName + ' a refuse votre demande.',
      link: accepted ? '/bookings/' + booking.id + '/pay' : '/dashboard?filter=CANCELLED',
      data: { bookingId: booking.id },
    });
  } catch (err) { console.error('[Notify] notifyBookingResponse', err); }
};

const notifyPaymentConfirmed = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        nanny: { include: { user: true } },
        parent: { include: { user: true } },
      },
    });
    if (!booking) return;

    // Notif nounou
    await emitNotification({
      userId: booking.nanny.userId,
      type: 'PAYMENT_CONFIRMED',
      title: 'Paiement recu !',
      message: booking.parent.user.firstName + ' a paye ' + booking.totalPrice + ' FCFA',
      link: '/nanny/dashboard?filter=CONFIRMED',
      data: { bookingId: booking.id, amount: booking.totalPrice },
    });

    // Notif parent
    await emitNotification({
      userId: booking.parent.userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Paiement confirme',
      message: 'Votre paiement de ' + booking.totalPrice + ' FCFA a ete confirme.',
      link: '/dashboard?filter=PAID',
      data: { bookingId: booking.id },
    });
  } catch (err) { console.error('[Notify] notifyPaymentConfirmed', err); }
};

const notifyBookingCompleted = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        nanny: { include: { user: true } },
        parent: { include: { user: true } },
      },
    });
    if (!booking) return;

    await emitNotification({
      userId: booking.parent.userId,
      type: 'BOOKING_COMPLETED',
      title: 'Prestation terminee',
      message: 'N\'oubliez pas de noter ' + booking.nanny.user.firstName + ' !',
      link: '/dashboard?filter=COMPLETED',
      data: { bookingId: booking.id },
    });
  } catch (err) { console.error('[Notify] notifyBookingCompleted', err); }
};

const isUserOnline = (userId) => connectedUsers.has(userId);

module.exports = {
  initSocket,
  getIo,
  emitNotification,
  notifyNewBooking,
  notifyBookingResponse,
  notifyPaymentConfirmed,
  notifyBookingCompleted,
  isUserOnline,
};
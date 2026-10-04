const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
const prisma = require('./config/prisma');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
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
    console.log(`🔌 User connecté : ${socket.userId}`);

    // Rejoindre sa room personnelle
    socket.join(`user:${socket.userId}`);

    // Envoyer un message
    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        if (!content?.trim()) return;

        const message = await prisma.message.create({
          data: {
            senderId: socket.userId,
            receiverId,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        });

        // Envoyer au destinataire
        io.to(`user:${receiverId}`).emit('message:new', message);
        // Confirmer à l'expéditeur
        socket.emit('message:sent', message);
      } catch (err) {
        console.error('❌ Erreur message:send', err);
        socket.emit('message:error', { message: 'Erreur envoi message' });
      }
    });

    // Marquer comme lu
    socket.on('message:read', async ({ senderId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId,
            receiverId: socket.userId,
            isRead: false,
          },
          data: { isRead: true },
        });
        io.to(`user:${senderId}`).emit('message:read:ack', { by: socket.userId });
      } catch (err) {
        console.error('❌ Erreur message:read', err);
      }
    });

    // Indicateur de frappe
    socket.on('typing:start', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:start', { from: socket.userId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:stop', { from: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User déconnecté : ${socket.userId}`);
    });
  });

  return io;
};

const getIo = () => io;

module.exports = { initSocket, getIo };
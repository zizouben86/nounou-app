const prisma = require('../../config/prisma');

const getConversation = async (userId, otherId, { limit = 50, offset = 0 } = {}) => {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};

const getConversationsList = async (userId) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Grouper par interlocuteur
  const convMap = new Map();
  for (const m of messages) {
    const other = m.senderId === userId ? m.receiver : m.sender;
    if (!convMap.has(other.id)) {
      convMap.set(other.id, {
        user: other,
        lastMessage: m,
        unread: 0,
      });
    }
    if (m.receiverId === userId && !m.isRead) {
      convMap.get(other.id).unread += 1;
    }
  }
  return Array.from(convMap.values());
};

module.exports = { getConversation, getConversationsList };
const prisma = require('../../config/prisma');

/**
 * Creer une notification en base
 */
const createNotification = async ({ userId, type, title, message, link, data }) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      data: data || null,
    },
  });
};

/**
 * Liste des notifications d'un utilisateur
 */
const getUserNotifications = async (userId, { limit = 50, unreadOnly = false } = {}) => {
  const where = { userId };
  if (unreadOnly) where.isRead = false;

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

/**
 * Compte des notifications non lues
 */
const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (userId, notificationId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (userId, notificationId) => {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};

/**
 * Supprimer toutes les notifications lues
 */
const clearRead = async (userId) => {
  return prisma.notification.deleteMany({
    where: { userId, isRead: true },
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead,
};
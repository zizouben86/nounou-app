const service = require('./notifications.service');

const list = async (req, res, next) => {
  try {
    const notifications = await service.getUserNotifications(req.user.id, {
      limit: Number(req.query.limit) || 50,
      unreadOnly: req.query.unread === 'true',
    });
    const unreadCount = await service.getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};

const unreadCount = async (req, res, next) => {
  try {
    const count = await service.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await service.markAsRead(req.user.id, req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await service.markAllAsRead(req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteNotification(req.user.id, req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

const clearRead = async (req, res, next) => {
  try {
    await service.clearRead(req.user.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

module.exports = { list, unreadCount, markRead, markAllRead, remove, clearRead };
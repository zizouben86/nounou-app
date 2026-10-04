const service = require('./admin.service');

const stats = async (req, res, next) => {
  try { res.json(await service.getStats()); } catch (err) { next(err); }
};

const pendingNannies = async (req, res, next) => {
  try { res.json(await service.listPendingNannies()); } catch (err) { next(err); }
};

const users = async (req, res, next) => {
  try { res.json(await service.listAllUsers(req.query)); } catch (err) { next(err); }
};

const verifyNanny = async (req, res, next) => {
  try { res.json(await service.verifyNanny(req.params.id, req.body.status)); } catch (err) { next(err); }
};

const bookings = async (req, res, next) => {
  try { res.json(await service.listAllBookings(req.query)); } catch (err) { next(err); }
};

const updateRole = async (req, res, next) => {
  try { res.json(await service.updateUserRole(req.params.id, req.body.role)); } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try { await service.deleteUser(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
};

module.exports = { stats, pendingNannies, users, verifyNanny, bookings, updateRole, deleteUser };
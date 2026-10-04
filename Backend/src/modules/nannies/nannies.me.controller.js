const service = require('./nannies.me.service');

const getProfile = async (req, res, next) => {
  try {
    res.json(await service.getMyProfile(req.user.id));
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    res.json(await service.updateMyProfile(req.user.id, req.body));
  } catch (err) { next(err); }
};

const toggleAvailability = async (req, res, next) => {
  try {
    res.json(await service.toggleAvailability(req.user.id));
  } catch (err) { next(err); }
};

const getBookings = async (req, res, next) => {
  try {
    res.json(await service.getMyBookings(req.user.id));
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    res.json(await service.getMyStats(req.user.id));
  } catch (err) { next(err); }
};

const respondBooking = async (req, res, next) => {
  try {
    const result = await service.respondToBooking(req.user.id, req.params.id, req.body.action);
    res.json(result);
  } catch (err) { next(err); }
};

const completeBooking = async (req, res, next) => {
  try {
    res.json(await service.markAsCompleted(req.user.id, req.params.id));
  } catch (err) { next(err); }
};

module.exports = {
  getProfile,
  updateProfile,
  toggleAvailability,
  getBookings,
  getStats,
  respondBooking,
  completeBooking,
};
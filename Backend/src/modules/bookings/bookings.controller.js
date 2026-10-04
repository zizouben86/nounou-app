const service = require('./bookings.service');

const create = async (req, res, next) => {
  try {
    const booking = await service.create(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    const bookings = await service.listMine(req.user.id, req.user.role);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const updated = await service.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listMine, updateStatus };
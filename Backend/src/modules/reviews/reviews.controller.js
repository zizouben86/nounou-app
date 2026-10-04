const service = require('./reviews.service');

const create = async (req, res, next) => {
  try {
    const review = await service.create(req.user.id, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

module.exports = { create };
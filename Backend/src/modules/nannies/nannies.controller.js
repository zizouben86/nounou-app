const service = require('./nannies.service');

const search = async (req, res, next) => {
  try {
    const results = await service.search(req.query);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const nanny = await service.getById(req.params.id);
    res.json(nanny);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updated = await service.updateMyProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { search, getById, updateMe };
const service = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.schema');

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await service.register(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await service.login(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });
    const result = await service.forgotPassword(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await service.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
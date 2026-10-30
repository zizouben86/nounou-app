const service = require('./users.service');

const getMe = async (req, res, next) => {
  try {
    const user = await service.getMe(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await service.updateMe(req.user.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
};

const addChild = async (req, res, next) => {
  console.log("📥 Tentative d'ajout d'enfant pour l'utilisateur :", req.user.id);
  console.log("📝 Données reçues :", req.body);
  try {
    const child = await service.addChild(req.user.id, req.body);
    res.status(201).json(child);
  } catch (err) { next(err); }
};

const deleteChild = async (req, res, next) => {
  try {
    await service.deleteChild(req.user.id, req.params.childId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
const getUserById = async (req, res, next) => {
  try {
    const user = await service.getUserById(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, addChild, deleteChild, getUserById };

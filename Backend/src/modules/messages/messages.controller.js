const service = require('./messages.service');

const getConversation = async (req, res, next) => {
  try {
    const messages = await service.getConversation(req.user.id, req.params.userId);
    res.json(messages.reverse());
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const conversations = await service.getConversationsList(req.user.id);
    res.json(conversations);
  } catch (err) { next(err); }
};

module.exports = { getConversation, list };
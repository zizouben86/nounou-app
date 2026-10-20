const router = require('express').Router();
const controller = require('./nannies.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Routes specifiques AVANT /:id (sinon /me est interprete comme un id)
router.get('/me', authenticate, authorize('NANNY'), controller.getMe);
router.put('/me', authenticate, authorize('NANNY'), controller.updateMe);

// Routes publiques
router.get('/', controller.search);
router.get('/:id', controller.getById);

module.exports = router;
const router = require('express').Router();
const controller = require('./nannies.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.get('/me', authenticate, authorize('NANNY'), controller.getMe);
router.put('/me', authenticate, authorize('NANNY'), controller.updateMe);

router.post(
  '/me/documents',
  authenticate,
  authorize('NANNY'),
  upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'criminalRecord', maxCount: 1 },
    { name: 'diploma', maxCount: 1 },
  ]),
  controller.uploadDocuments
);

router.get('/', controller.search);
router.get('/:id', controller.getById);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createOffer,
  getOffers,
  getOfferById,
  updateOfferStatus
} = require('../controllers/offer.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createOfferValidator,
  updateOfferStatusValidator
} = require('../validators/offer.validator');

router.use(authenticate);

router.get('/', getOffers);
router.post('/', authorizeRoles('admin'), createOfferValidator, createOffer);
router.get('/:id', getOfferById);
router.patch('/:id/status', updateOfferStatusValidator, updateOfferStatus);

module.exports = router;

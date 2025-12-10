const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { createDeal, getDeals, getDealById } = require('../controllers/dealController');

router.post('/', [
  body('property_id').notEmpty().withMessage('Property ID is required'),
  body('client_id').notEmpty().withMessage('Client ID is required'),
  body('final_price').notEmpty().withMessage('Final price is required'),
  body('deal_type').notEmpty().withMessage('Deal type is required'),
], createDeal);

router.get('/', getDeals);

router.get('/:id', getDealById);

module.exports = router;

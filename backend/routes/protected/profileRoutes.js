const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { getProfile, updateProfile } = require('../../controllers/personController');

router.get('/', getProfile);

router.put('/', [
    check('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    check('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], updateProfile);

module.exports = router;

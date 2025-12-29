const express = require('express');
const router = express.Router();
const { getPublicUserProfile } = require('../../controllers/public/userController');

router.get('/:id', getPublicUserProfile);

module.exports = router;

const express = require('express');
const { check } = require('express-validator');
const {
  createPerson,
  getPersons,
  getPersonById,
  updatePerson,
  deletePerson,
} = require('../controllers/personController');

const router = express.Router();

router.post(
  '/',
  [
    check('full_name').notEmpty().withMessage('Full name is required'),
    check('phone').notEmpty().withMessage('Phone is required'),
  ],
  createPerson
);

router.get('/', getPersons);

router.get('/:id', getPersonById);

router.put(
  '/:id',
  [
    check('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    check('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  ],
  updatePerson
);

router.delete('/:id', deletePerson);

module.exports = router;

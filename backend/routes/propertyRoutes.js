const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { createProperty, getProperties, getPropertyById, searchProperties, updateProperty, updatePropertyStatus, deleteProperty, uploadFiles, deleteFile } = require('../controllers/propertyController');
const { upload } = require('../utils/upload');

router.post('/', [
  body('owner_id').notEmpty().withMessage('Owner ID is required'),
  body('property_type').notEmpty().withMessage('Property type is required'),
  body('purpose').notEmpty().withMessage('Purpose is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('area_size').notEmpty().withMessage('Area size is required'),
], createProperty);

router.get('/', getProperties);

router.get('/search', searchProperties);

router.get('/:id', getPropertyById);

router.put('/:id', [
  body('owner_id').notEmpty().withMessage('Owner ID is required'),
  body('property_type').notEmpty().withMessage('Property type is required'),
  body('purpose').notEmpty().withMessage('Purpose is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('area_size').notEmpty().withMessage('Area size is required'),
], updateProperty);

router.patch('/:id/status', updatePropertyStatus);

router.post('/:id/upload', upload.array('files', 10), uploadFiles);

router.delete('/:id/file', deleteFile);

router.delete('/:id', deleteProperty);

module.exports = router;

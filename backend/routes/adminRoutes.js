const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllProperties,
  getAllDeals,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.get('/deals', getAllDeals);

module.exports = router;

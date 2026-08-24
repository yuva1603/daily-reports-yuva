const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminStats);

module.exports = router;

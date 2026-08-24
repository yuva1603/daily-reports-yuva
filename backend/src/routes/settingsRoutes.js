const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.saveSettings);
router.post('/profile', settingsController.updateProfile);

module.exports = router;

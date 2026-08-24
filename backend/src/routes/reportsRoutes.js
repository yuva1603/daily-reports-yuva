const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/', reportsController.getReports);
router.post('/submit', reportsController.submitReport);
router.delete('/:id', reportsController.deleteReport);

module.exports = router;

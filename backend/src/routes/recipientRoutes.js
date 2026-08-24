const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');

router.get('/', recipientController.getRecipient);
router.post('/', recipientController.saveRecipient);
router.delete('/', recipientController.clearRecipient);

module.exports = router;

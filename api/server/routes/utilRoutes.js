const express = require('express');
const UtilsController = require('../controllers/UtilsController');
const router = express.Router();

router.get('/invite/:token', UtilsController.acceptInvite);

module.exports = router;

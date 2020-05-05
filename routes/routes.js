const express = require('express');
const router = express.Router();
const botControllerTEST = require('../controller/botControllerTEST');

// Qryptos Exchange Routes
router.post('/start', botControllerTEST.startBot);
router.get('/getActiveBots', botControllerTEST.BotDetails);
router.post('/stop', botControllerTEST.stopBot);
router.post('/status', botControllerTEST.getStatus);

module.exports = router;

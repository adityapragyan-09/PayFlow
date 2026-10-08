const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard metrics
router.get('/', dashboardController.getDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const invoiceRoutes = require('./invoiceRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'PayFlow Backend API',
      timestamp: new Date().toISOString()
    }
  });
});

// Main Feature Endpoints
router.use('/invoices', invoiceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;

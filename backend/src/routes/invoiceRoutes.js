const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const recoveryController = require('../controllers/recoveryController');
const timelineController = require('../controllers/timelineController');

// Invoices CRUD & Search
router.post('/upload', invoiceController.uploadInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

// AI Analysis
router.post('/:id/analyze', invoiceController.analyzeInvoiceEndpoint);

// Recovery Workflow
router.post('/:id/recover', recoveryController.recoverInvoice);
router.get('/:id/recover', recoveryController.getInvoiceRecoveryActions);

// Activity Timeline
router.get('/:id/timeline', timelineController.getTimeline);

// Communications & Status
router.post('/:id/communications', invoiceController.addCommunication);
router.patch('/:id/status', invoiceController.updateStatus);

module.exports = router;

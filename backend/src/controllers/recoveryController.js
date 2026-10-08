const { executeRecovery, getRecoveryActions } = require('../services/recoveryService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/invoices/:id/recover
 * Trigger payment recovery action workflow
 */
async function recoverInvoice(req, res) {
  try {
    const customAction = req.body || null;
    const result = await executeRecovery(req.params.id, customAction);

    return success(res, result, 200, 'Recovery action triggered successfully');
  } catch (err) {
    logger.error('[RecoveryController] recoverInvoice error:', err);
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * GET /api/invoices/:id/recover
 * Get recovery actions history for an invoice
 */
async function getInvoiceRecoveryActions(req, res) {
  try {
    const actions = await getRecoveryActions(req.params.id);
    return success(res, actions);
  } catch (err) {
    logger.error('[RecoveryController] getInvoiceRecoveryActions error:', err);
    return error(res, err.message, 500);
  }
}

module.exports = {
  recoverInvoice,
  getInvoiceRecoveryActions
};

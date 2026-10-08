const { run, get, all } = require('../database/db');
const { recordEvent } = require('./timelineService');
const logger = require('../utils/logger');

async function findInvoice(param) {
  if (!param) return null;
  const str = String(param).trim();
  if (/^\d+$/.test(str)) {
    const byId = await get('SELECT * FROM invoices WHERE id = ?', [parseInt(str, 10)]);
    if (byId) return byId;
  }
  return await get('SELECT * FROM invoices WHERE invoice_number = ?', [str]);
}

/**
 * Execute simulated payment recovery workflow
 */
async function executeRecovery(invoiceIdOrNumber, customAction = null) {
  // 1. Retrieve the invoice
  const invoice = await findInvoice(invoiceIdOrNumber);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }
  const invoiceId = invoice.id;

  // 2. Retrieve latest AI analysis
  const latestAnalysis = await get(
    'SELECT * FROM ai_analysis WHERE invoice_id = ? ORDER BY analyzed_at DESC, id DESC LIMIT 1',
    [invoiceId]
  );

  // 3. Determine recommended recovery action and response message
  const actionType = customAction?.action_type || latestAnalysis?.recommended_action || 'standard_followup';
  const responseMessage = customAction?.message || latestAnalysis?.generated_response || `Follow-up sent regarding invoice ${invoice.invoice_number}.`;

  // 4. Create a recovery action record
  const actionStatus = customAction?.status || 'completed';
  const recoveryResult = await run(
    `INSERT INTO recovery_actions (invoice_id, action_type, status, message, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [invoiceId, actionType, actionStatus, responseMessage]
  );

  const recoveryActionId = recoveryResult.id;

  // 5. Update the invoice status
  // If invoice was pending or overdue, transition to 'in_recovery' (or 'recovered' if explicitly requested)
  const newStatus = customAction?.new_status || (invoice.status === 'recovered' ? 'recovered' : 'in_recovery');
  await run(
    `UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [newStatus, invoiceId]
  );

  // 6. Create activity timeline events
  await recordEvent(
    invoiceId,
    'recovery_action_executed',
    `Recovery action '${actionType}' initiated (${actionStatus})`,
    {
      action_type: actionType,
      status: actionStatus,
      recovery_action_id: recoveryActionId,
      dispatched_message: responseMessage
    }
  );

  logger.info(`[RecoveryService] Executed recovery action '${actionType}' for invoice #${invoice.invoice_number} (Status: ${newStatus})`);

  // Fetch updated invoice and latest recovery action
  const updatedInvoice = await get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
  const recoveryAction = await get('SELECT * FROM recovery_actions WHERE id = ?', [recoveryActionId]);

  return {
    invoice: updatedInvoice,
    recovery_action: recoveryAction,
    analysis: latestAnalysis || null
  };
}

/**
 * Get all recovery actions for an invoice
 */
async function getRecoveryActions(invoiceIdOrNumber) {
  const invoice = await findInvoice(invoiceIdOrNumber);
  if (!invoice) return [];
  return await all(
    'SELECT * FROM recovery_actions WHERE invoice_id = ? ORDER BY created_at DESC, id DESC',
    [invoice.id]
  );
}

module.exports = {
  executeRecovery,
  getRecoveryActions
};

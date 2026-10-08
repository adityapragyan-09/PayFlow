const { getTimelineForInvoice } = require('../services/timelineService');
const { get } = require('../database/db');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * GET /api/invoices/:id/timeline
 * Get all chronological activity events for an invoice
 */
async function getTimeline(req, res) {
  try {
    const param = req.params.id;
    let invoice = null;
    const str = String(param).trim();
    if (/^\d+$/.test(str)) {
      invoice = await get('SELECT id, invoice_number FROM invoices WHERE id = ?', [parseInt(str, 10)]);
    }
    if (!invoice) {
      invoice = await get('SELECT id, invoice_number FROM invoices WHERE invoice_number = ?', [str]);
    }

    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    const events = await getTimelineForInvoice(invoice.id);
    return success(res, events);
  } catch (err) {
    logger.error('[TimelineController] getTimeline error:', err);
    return error(res, err.message, 500);
  }
}

module.exports = {
  getTimeline
};

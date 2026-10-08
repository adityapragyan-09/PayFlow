const { run, all } = require('../database/db');
const logger = require('../utils/logger');

/**
 * Record an activity event in the timeline
 */
async function recordEvent(invoiceId, eventType, description, metadata = null) {
  try {
    const metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    const result = await run(
      `INSERT INTO activity_timeline (invoice_id, event_type, description, metadata, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [invoiceId, eventType, description, metaStr]
    );
    logger.debug(`[Timeline] Recorded event '${eventType}' for invoice #${invoiceId}`);
    return result.id;
  } catch (error) {
    logger.error(`[Timeline] Failed to record event '${eventType}' for invoice #${invoiceId}:`, error.message);
    throw error;
  }
}

/**
 * Get all timeline events for an invoice in chronological order
 */
async function getTimelineForInvoice(invoiceId) {
  const events = await all(
    `SELECT id, invoice_id, event_type, description, metadata, created_at
     FROM activity_timeline
     WHERE invoice_id = ?
     ORDER BY created_at ASC, id ASC`,
    [invoiceId]
  );

  return events.map(evt => {
    let parsedMeta = null;
    if (evt.metadata) {
      try {
        parsedMeta = JSON.parse(evt.metadata);
      } catch (_) {
        parsedMeta = evt.metadata;
      }
    }
    return {
      ...evt,
      metadata: parsedMeta
    };
  });
}

module.exports = {
  recordEvent,
  getTimelineForInvoice
};

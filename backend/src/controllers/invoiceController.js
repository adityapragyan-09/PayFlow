const { run, get, all } = require('../database/db');
const { success, error } = require('../utils/response');
const { analyzeInvoice } = require('../services/geminiService');
const { recordEvent } = require('../services/timelineService');
const logger = require('../utils/logger');

/**
 * POST /api/invoices/upload
 * Create a new invoice with optional initial communication
 */
async function uploadInvoice(req, res) {
  try {
    const {
      invoice_number,
      customer_name,
      customer_email,
      amount,
      currency = 'INR',
      issue_date,
      due_date,
      status,
      description,
      initial_communication
    } = req.body;

    // Basic Validation
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim() === '') {
      return error(res, "Missing or invalid 'customer_name'", 400);
    }
    if (!customer_email || typeof customer_email !== 'string' || !customer_email.includes('@')) {
      return error(res, "Missing or invalid 'customer_email'", 400);
    }
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return error(res, "Missing or invalid 'amount' (must be a positive number)", 400);
    }
    if (!due_date) {
      return error(res, "Missing required 'due_date' (YYYY-MM-DD)", 400);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalIssueDate = issue_date || todayStr;
    const finalDueDate = due_date;

    // Auto-generate invoice number if not provided
    const finalInvoiceNumber = invoice_number && invoice_number.trim() !== ''
      ? invoice_number.trim()
      : `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check for duplicate invoice_number
    const existing = await get('SELECT id FROM invoices WHERE invoice_number = ?', [finalInvoiceNumber]);
    if (existing) {
      return error(res, `Invoice with number '${finalInvoiceNumber}' already exists`, 409);
    }

    // Default status: if due_date is in the past, default to 'overdue', else 'pending'
    let finalStatus = status;
    if (!finalStatus) {
      finalStatus = new Date(finalDueDate) < new Date(todayStr) ? 'overdue' : 'pending';
    }

    // Insert invoice
    const insertResult = await run(
      `INSERT INTO invoices (
        invoice_number, customer_name, customer_email, amount, currency,
        issue_date, due_date, status, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        finalInvoiceNumber,
        customer_name.trim(),
        customer_email.trim(),
        Number(amount),
        currency.trim().toUpperCase(),
        finalIssueDate,
        finalDueDate,
        finalStatus,
        description ? description.trim() : null
      ]
    );

    const invoiceId = insertResult.id;

    // Log timeline event
    await recordEvent(
      invoiceId,
      'invoice_created',
      `Invoice ${finalInvoiceNumber} created for ${customer_name.trim()} (${currency} ${Number(amount).toFixed(2)})`,
      { amount: Number(amount), currency, due_date: finalDueDate, status: finalStatus }
    );

    // Optional initial communication
    if (initial_communication) {
      const commType = initial_communication.communication_type || 'email';
      const commSender = initial_communication.sender || 'customer';
      const commMsg = typeof initial_communication === 'string'
        ? initial_communication
        : (initial_communication.message || '');

      if (commMsg.trim() !== '') {
        await run(
          `INSERT INTO communications (invoice_id, communication_type, sender, message, timestamp)
           VALUES (?, ?, ?, ?, datetime('now'))`,
          [invoiceId, commType, commSender, commMsg.trim()]
        );

        await recordEvent(
          invoiceId,
          'communication_logged',
          `Initial communication logged from ${commSender} (${commType})`,
          { communication_type: commType, sender: commSender }
        );
      }
    }

    const createdInvoice = await get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    return success(res, createdInvoice, 201, 'Invoice uploaded successfully');
  } catch (err) {
    logger.error('[InvoiceController] uploadInvoice error:', err);
    return error(res, err.message, 500);
  }
}

/**
 * GET /api/invoices
 * List invoices with filtering, search, sorting, and attached AI/recovery metadata
 */
async function getInvoices(req, res) {
  try {
    const { status, reason_category, search, sort_by = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT 
        i.*,
        a.reason_category AS latest_reason_category,
        a.confidence AS latest_confidence,
        a.recommended_action AS latest_recommended_action,
        a.analyzed_at AS latest_analyzed_at,
        r.action_type AS latest_recovery_action,
        r.status AS latest_recovery_status,
        (SELECT COUNT(*) FROM communications c WHERE c.invoice_id = i.id) AS communications_count
      FROM invoices i
      LEFT JOIN (
        SELECT a1.*
        FROM ai_analysis a1
        INNER JOIN (
          SELECT invoice_id, MAX(id) as max_id
          FROM ai_analysis
          GROUP BY invoice_id
        ) a2 ON a1.id = a2.max_id
      ) a ON i.id = a.invoice_id
      LEFT JOIN (
        SELECT r1.*
        FROM recovery_actions r1
        INNER JOIN (
          SELECT invoice_id, MAX(id) as max_id
          FROM recovery_actions
          GROUP BY invoice_id
        ) r2 ON r1.id = r2.max_id
      ) r ON i.id = r.invoice_id
      WHERE 1=1
    `;

    const params = [];

    // Filter by status
    if (status && status.trim() !== '') {
      query += ` AND i.status = ?`;
      params.push(status.trim().toLowerCase());
    }

    // Filter by reason_category (payment issue)
    if (reason_category && reason_category.trim() !== '') {
      query += ` AND a.reason_category = ?`;
      params.push(reason_category.trim().toLowerCase());
    }

    // Search query
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        i.invoice_number LIKE ? OR
        i.customer_name LIKE ? OR
        i.customer_email LIKE ? OR
        i.description LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Safe sorting
    const allowedSortFields = ['created_at', 'due_date', 'amount', 'status', 'invoice_number'];
    const safeSortBy = allowedSortFields.includes(sort_by.toLowerCase()) ? sort_by.toLowerCase() : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY i.${safeSortBy} ${safeOrder}`;

    const rows = await all(query, params);

    // Format output with structured latest_analysis object
    const formatted = rows.map(row => {
      const {
        latest_reason_category,
        latest_confidence,
        latest_recommended_action,
        latest_analyzed_at,
        latest_recovery_action,
        latest_recovery_status,
        ...invoiceFields
      } = row;

      return {
        ...invoiceFields,
        latest_analysis: latest_reason_category ? {
          reason_category: latest_reason_category,
          confidence: latest_confidence,
          recommended_action: latest_recommended_action,
          analyzed_at: latest_analyzed_at
        } : null,
        recovery_status: latest_recovery_status ? {
          action_type: latest_recovery_action,
          status: latest_recovery_status
        } : null
      };
    });

    return success(res, formatted);
  } catch (err) {
    logger.error('[InvoiceController] getInvoices error:', err);
    return error(res, err.message, 500);
  }
}

/**
 * Helper to resolve an invoice by numeric ID or invoice_number string
 */
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
 * GET /api/invoices/:id
 * Retrieve a single invoice with all related communications, AI analyses, recovery status, and timeline
 */
async function getInvoiceById(req, res) {
  try {
    const invoice = await findInvoice(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }
    const id = invoice.id;

    // Communications
    const communications = await all(
      'SELECT * FROM communications WHERE invoice_id = ? ORDER BY timestamp ASC, id ASC',
      [id]
    );

    // Latest and historical AI analyses
    const analyses = await all(
      'SELECT * FROM ai_analysis WHERE invoice_id = ? ORDER BY analyzed_at DESC, id DESC',
      [id]
    );
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    // Recovery Actions
    const recoveryActions = await all(
      'SELECT * FROM recovery_actions WHERE invoice_id = ? ORDER BY created_at DESC, id DESC',
      [id]
    );
    const latestRecovery = recoveryActions.length > 0 ? recoveryActions[0] : null;

    // Timeline
    const timeline = await all(
      'SELECT * FROM activity_timeline WHERE invoice_id = ? ORDER BY created_at ASC, id ASC',
      [id]
    );

    return success(res, {
      invoice,
      communications,
      latest_analysis: latestAnalysis,
      analysis_history: analyses,
      recovery_status: latestRecovery,
      recovery_actions: recoveryActions,
      timeline: timeline.map(t => {
        let meta = null;
        if (t.metadata) {
          try { meta = JSON.parse(t.metadata); } catch (_) { meta = t.metadata; }
        }
        return { ...t, metadata: meta };
      })
    });
  } catch (err) {
    logger.error('[InvoiceController] getInvoiceById error:', err);
    return error(res, err.message, 500);
  }
}

/**
 * POST /api/invoices/:id/analyze
 * Run Gemini AI analysis on invoice and communications
 */
async function analyzeInvoiceEndpoint(req, res) {
  try {
    const invoice = await findInvoice(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }
    const id = invoice.id;

    // Retrieve communications
    const communications = await all(
      'SELECT * FROM communications WHERE invoice_id = ? ORDER BY timestamp ASC, id ASC',
      [id]
    );

    // Call Gemini Service
    const analysisResult = await analyzeInvoice(invoice, communications);

    // Store in ai_analysis table
    const insertResult = await run(
      `INSERT INTO ai_analysis (
        invoice_id, reason_category, confidence, explanation,
        recommended_action, generated_response, analyzed_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        id,
        analysisResult.reason_category,
        analysisResult.confidence,
        analysisResult.explanation,
        analysisResult.recommended_action,
        analysisResult.generated_response
      ]
    );

    const storedAnalysis = await get('SELECT * FROM ai_analysis WHERE id = ?', [insertResult.id]);

    // Create activity timeline event
    await recordEvent(
      id,
      'ai_analysis',
      `AI identified payment issue: '${analysisResult.reason_category}' (${Math.round(analysisResult.confidence * 100)}% confidence)`,
      {
        reason_category: analysisResult.reason_category,
        confidence: analysisResult.confidence,
        recommended_action: analysisResult.recommended_action,
        analysis_id: insertResult.id
      }
    );

    return success(res, storedAnalysis, 200, 'Invoice analyzed successfully');
  } catch (err) {
    logger.error('[InvoiceController] analyzeInvoiceEndpoint error:', err);
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500) {
      return error(res, 'AI analysis is unavailable right now. Please try again later.', statusCode);
    }
    return error(res, err.message, statusCode);
  }
}

/**
 * POST /api/invoices/:id/communications
 * Add a communication message to an invoice
 */
async function addCommunication(req, res) {
  try {
    const invoice = await findInvoice(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }
    const id = invoice.id;

    const { communication_type = 'email', sender = 'customer', message } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return error(res, "Missing or empty 'message'", 400);
    }

    const insertResult = await run(
      `INSERT INTO communications (invoice_id, communication_type, sender, message, timestamp)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [id, communication_type.trim(), sender.trim(), message.trim()]
    );

    await recordEvent(
      id,
      'communication_logged',
      `Message logged from ${sender} via ${communication_type}`,
      { sender, communication_type, message: message.trim().substring(0, 100) }
    );

    const createdComm = await get('SELECT * FROM communications WHERE id = ?', [insertResult.id]);
    return success(res, createdComm, 201, 'Communication logged successfully');
  } catch (err) {
    logger.error('[InvoiceController] addCommunication error:', err);
    return error(res, err.message, 500);
  }
}

/**
 * PATCH /api/invoices/:id/status
 * Manually update invoice status
 */
async function updateStatus(req, res) {
  try {
    const invoice = await findInvoice(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }
    const id = invoice.id;

    const { status: newStatus } = req.body;
    if (!newStatus || typeof newStatus !== 'string') {
      return error(res, "Missing or invalid 'status'", 400);
    }

    const allowedStatuses = ['pending', 'overdue', 'in_recovery', 'recovered', 'disputed', 'cancelled'];
    if (!allowedStatuses.includes(newStatus.toLowerCase())) {
      return error(res, `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`, 400);
    }

    const oldStatus = invoice.status;
    await run(
      `UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [newStatus.toLowerCase(), id]
    );

    await recordEvent(
      id,
      'status_changed',
      `Invoice status changed from '${oldStatus}' to '${newStatus}'`,
      { old_status: oldStatus, new_status: newStatus }
    );

    const updated = await get('SELECT * FROM invoices WHERE id = ?', [id]);
    return success(res, updated, 200, 'Invoice status updated');
  } catch (err) {
    logger.error('[InvoiceController] updateStatus error:', err);
    return error(res, err.message, 500);
  }
}

module.exports = {
  uploadInvoice,
  getInvoices,
  getInvoiceById,
  analyzeInvoiceEndpoint,
  addCommunication,
  updateStatus
};

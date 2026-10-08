const { get, all } = require('../database/db');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * GET /api/dashboard
 * Aggregated dashboard statistics, reason distribution, and recent activity
 */
async function getDashboard(req, res) {
  try {
    // 1. Invoices status counts and amounts
    const counts = await get(`
      SELECT
        COUNT(*) AS total_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue,
        SUM(CASE WHEN status = 'recovered' THEN 1 ELSE 0 END) AS recovered,
        SUM(CASE WHEN status = 'in_recovery' THEN 1 ELSE 0 END) AS in_recovery,
        SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) AS disputed,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue', 'in_recovery', 'disputed') THEN amount ELSE 0 END), 0) AS outstanding_amount,
        COALESCE(SUM(CASE WHEN status = 'recovered' THEN amount ELSE 0 END), 0) AS recovered_amount,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM invoices
    `);

    // 2. Reason Category Distribution (based on latest AI analysis per invoice)
    const reasonRows = await all(`
      SELECT a.reason_category, COUNT(DISTINCT a.invoice_id) as count
      FROM ai_analysis a
      INNER JOIN (
        SELECT invoice_id, MAX(id) as max_id
        FROM ai_analysis
        GROUP BY invoice_id
      ) latest ON a.id = latest.max_id
      GROUP BY a.reason_category
    `);

    const reasonDistribution = {};
    for (const r of reasonRows) {
      reasonDistribution[r.reason_category] = r.count;
    }

    // 3. Recent Activity (last 10 events across all invoices with invoice details)
    const recentActivityRows = await all(`
      SELECT 
        t.id,
        t.invoice_id,
        t.event_type,
        t.description,
        t.metadata,
        t.created_at,
        i.invoice_number,
        i.customer_name,
        i.amount,
        i.currency
      FROM activity_timeline t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT 10
    `);

    const recentActivity = recentActivityRows.map(row => {
      let meta = null;
      if (row.metadata) {
        try {
          meta = JSON.parse(row.metadata);
        } catch (_) {
          meta = row.metadata;
        }
      }
      return {
        ...row,
        metadata: meta
      };
    });

    return success(res, {
      stats: {
        total_invoices: counts.total_invoices || 0,
        pending: counts.pending || 0,
        overdue: counts.overdue || 0,
        recovered: counts.recovered || 0,
        in_recovery: counts.in_recovery || 0,
        disputed: counts.disputed || 0,
        outstanding_amount: Number(counts.outstanding_amount.toFixed(2)),
        recovered_amount: Number(counts.recovered_amount.toFixed(2)),
        total_amount: Number(counts.total_amount.toFixed(2))
      },
      reason_distribution: reasonDistribution,
      recent_activity: recentActivity
    });
  } catch (err) {
    logger.error('[DashboardController] getDashboard error:', err);
    return error(res, err.message, 500);
  }
}

module.exports = {
  getDashboard
};

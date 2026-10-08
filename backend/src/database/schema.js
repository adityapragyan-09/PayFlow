const { exec, get, all, run } = require('./db');

const DEMO_INVOICE_NUMBERS = [
  'INV-2024-001',
  'INV-2024-002',
  'INV-2024-003',
  'INV-2024-004',
  'INV-2024-005',
  'INV-2024-006',
  'INV-2024-007',
  'INV-2024-008'
];

const schemaSQL = `
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  communication_type TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  reason_category TEXT NOT NULL,
  confidence REAL NOT NULL,
  explanation TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  generated_response TEXT NOT NULL,
  analyzed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recovery_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_communications_invoice_id ON communications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_invoice_id ON ai_analysis(invoice_id);
CREATE INDEX IF NOT EXISTS idx_recovery_actions_invoice_id ON recovery_actions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_invoice_id ON activity_timeline(invoice_id);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

/**
 * Initialize all database tables and indices
 */
async function addColumnIfMissing(name, definition) {
  try {
    await run(`ALTER TABLE invoices ADD COLUMN ${name} ${definition}`);
  } catch (error) {
    if (!/duplicate column name/i.test(error.message)) {
      throw error;
    }
  }
}

async function purgeDemoInvoices() {
  const flag = await get(`SELECT value FROM app_settings WHERE key = 'demo_invoices_purged'`);
  if (flag && flag.value === '1') return 0;

  const placeholders = DEMO_INVOICE_NUMBERS.map(() => '?').join(', ');
  const rows = await all(
    `SELECT id FROM invoices WHERE invoice_number IN (${placeholders})`,
    DEMO_INVOICE_NUMBERS
  );
  const ids = rows.map((row) => row.id);

  if (ids.length > 0) {
    const idPlaceholders = ids.map(() => '?').join(', ');
    await run(`DELETE FROM communications WHERE invoice_id IN (${idPlaceholders})`, ids);
    await run(`DELETE FROM ai_analysis WHERE invoice_id IN (${idPlaceholders})`, ids);
    await run(`DELETE FROM recovery_actions WHERE invoice_id IN (${idPlaceholders})`, ids);
    await run(`DELETE FROM activity_timeline WHERE invoice_id IN (${idPlaceholders})`, ids);
    await run(`DELETE FROM invoices WHERE id IN (${idPlaceholders})`, ids);
  }

  await run(
    `INSERT INTO app_settings (key, value) VALUES ('demo_invoices_purged', '1')
     ON CONFLICT(key) DO UPDATE SET value = '1'`
  );
  return ids.length;
}

async function initSchema() {
  try {
    await exec(schemaSQL);
    await addColumnIfMissing('customer_company', 'TEXT');
    await addColumnIfMissing('payment_terms', 'TEXT');
    await addColumnIfMissing('purchase_order', 'TEXT');
    await addColumnIfMissing('notes', 'TEXT');
    const removed = await purgeDemoInvoices();
    if (removed > 0) {
      console.log(`[Database] Removed ${removed} demo invoice(s).`);
    }
    console.log('[Database] Schema initialized successfully.');
  } catch (error) {
    console.error('[Database] Failed to initialize schema:', error);
    throw error;
  }
}

module.exports = {
  initSchema,
  purgeDemoInvoices
};

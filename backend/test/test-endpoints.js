const { app } = require('../src/app');
const { initSchema } = require('../src/database/schema');
const { close } = require('../src/database/db');

async function runTests() {
  console.log('\n====================================================');
  console.log('       PAYFLOW BACKEND API INTEGRATION TEST SUITE    ');
  console.log('====================================================\n');

  // Ensure DB initialized
  await initSchema();

  const PORT = 5099;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api`;

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      process.stdout.write(`Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check
    await assertTest('GET /api/health', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || data.data.status !== 'healthy') throw new Error('Invalid health response');
    });

    // Test 2: List Invoices
    let sampleInvoiceId = null;
    await assertTest('GET /api/invoices', async () => {
      const res = await fetch(`${BASE_URL}/invoices`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('Expected non-empty array of invoices');
      }
      sampleInvoiceId = data.data[0].id;
    });

    // Test 3: List Invoices with filter & search
    await assertTest('GET /api/invoices (filter: overdue, search: Apex)', async () => {
      const res = await fetch(`${BASE_URL}/invoices?status=overdue&search=Apex`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error('Expected valid list');
      if (data.data.length > 0 && !data.data[0].customer_name.includes('Apex')) {
        throw new Error('Search did not match customer');
      }
    });

    // Test 4: Get Single Invoice by ID
    await assertTest(`GET /api/invoices/${sampleInvoiceId}`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${sampleInvoiceId}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.data.invoice || !Array.isArray(data.data.communications)) {
        throw new Error('Invoice payload missing required structure');
      }
    });

    // Test 5: Get Invoice 404
    await assertTest('GET /api/invoices/999999 (Not Found)', async () => {
      const res = await fetch(`${BASE_URL}/invoices/999999`);
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      const data = await res.json();
      if (data.success !== false) throw new Error('Expected success: false for 404');
    });

    // Test 6: Upload Invoice (Success)
    let uploadedId = null;
    await assertTest('POST /api/invoices/upload (Success)', async () => {
      const payload = {
        invoice_number: `TEST-INV-${Date.now().toString().slice(-4)}`,
        customer_name: 'Acme Test Corp',
        customer_email: 'billing@acme-test.com',
        amount: 4500.00,
        currency: 'USD',
        due_date: '2024-05-15',
        description: 'Automated test invoice creation',
        initial_communication: {
          communication_type: 'email',
          sender: 'customer',
          message: 'Can you please check invoice status?'
        }
      };

      const res = await fetch(`${BASE_URL}/invoices/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.data.id) throw new Error('Failed to create invoice');
      uploadedId = data.data.id;
    });

    // Test 7: Upload Invoice Validation Failure
    await assertTest('POST /api/invoices/upload (Validation Failure)', async () => {
      const res = await fetch(`${BASE_URL}/invoices/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: '' }) // missing email, amount, etc.
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (data.success !== false) throw new Error('Expected success: false for invalid upload');
    });

    // Test 8: Add Communication
    await assertTest(`POST /api/invoices/${uploadedId}/communications`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${uploadedId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_type: 'email',
          sender: 'customer',
          message: 'Our PO is missing, please wait for PO-99120.'
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.data.id) throw new Error('Failed to log communication');
    });

    // Test 9: AI Analysis Endpoint (with ALLOW_MOCK_AI=true in test environment)
    process.env.ALLOW_MOCK_AI = 'true';
    await assertTest(`POST /api/invoices/${uploadedId}/analyze (AI Intelligence)`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${uploadedId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.status !== 200) {
        const errBody = await res.text();
        throw new Error(`Expected 200, got ${res.status}: ${errBody}`);
      }
      const data = await res.json();
      if (!data.success || !data.data.reason_category || !data.data.confidence || !data.data.generated_response) {
        throw new Error('Analysis response missing required structured fields');
      }
      if (data.data.confidence < 0 || data.data.confidence > 1) {
        throw new Error('Confidence out of bounds');
      }
    });

    // Test 10: Recovery Endpoint
    await assertTest(`POST /api/invoices/${uploadedId}/recover (Workflow Execution)`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${uploadedId}/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'request_po',
          status: 'completed'
        })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.data.recovery_action || !data.data.invoice) {
        throw new Error('Recovery response missing required data');
      }
      if (data.data.invoice.status !== 'in_recovery') {
        throw new Error(`Expected invoice status 'in_recovery', got ${data.data.invoice.status}`);
      }
    });

    // Test 11: Timeline Endpoint
    await assertTest(`GET /api/invoices/${uploadedId}/timeline`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${uploadedId}/timeline`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data) || data.data.length < 3) {
        throw new Error(`Expected at least 3 timeline events, got ${data.data?.length}`);
      }
    });

    // Test 12: Dashboard Metrics Endpoint
    await assertTest('GET /api/dashboard', async () => {
      const res = await fetch(`${BASE_URL}/dashboard`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.data.stats || !data.data.reason_distribution || !Array.isArray(data.data.recent_activity)) {
        throw new Error('Dashboard response missing required keys');
      }
      const { stats } = data.data;
      if (typeof stats.total_invoices !== 'number' || typeof stats.outstanding_amount !== 'number') {
        throw new Error('Stats structure invalid');
      }
    });

    // Test 13: Status Update Endpoint
    await assertTest(`PATCH /api/invoices/${uploadedId}/status (Mark Recovered)`, async () => {
      const res = await fetch(`${BASE_URL}/invoices/${uploadedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'recovered' })
      });

      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success || data.data.status !== 'recovered') {
        throw new Error('Status was not updated to recovered');
      }
    });

    console.log('\n----------------------------------------------------');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('----------------------------------------------------\n');

  } finally {
    server.close();
    await close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };

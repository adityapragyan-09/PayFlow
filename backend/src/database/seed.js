const { run, exec } = require('./db');
const { initSchema } = require('./schema');
const logger = require('../utils/logger');

const invoicesData = [
  // 1. Missing PO Scenario
  {
    invoice_number: 'INV-2024-001',
    customer_name: 'Apex Global Logistics Inc.',
    customer_email: 'ap-billing@apexlogistics-demo.com',
    amount: 14500.00,
    currency: 'USD',
    issue_date: '2024-02-01',
    due_date: '2024-03-01',
    status: 'overdue',
    description: 'Quarterly enterprise logistics routing & fleet tracking software subscription.',
    communications: [
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'Hi Apex AP team, invoice INV-2024-001 for $14,500.00 was due on March 1st. Please provide a payment update.',
        timestamp: '2024-03-05 10:15:00'
      },
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'Hello, our accounts payable automated clearing system rejected this invoice because there is no Purchase Order (PO) number referenced on the invoice PDF. We cannot release payment without an approved PO# attached. Please reissue with PO-88392.',
        timestamp: '2024-03-06 14:30:00'
      }
    ],
    ai_analysis: {
      reason_category: 'missing_po',
      confidence: 0.94,
      explanation: 'Accounts payable rejected the invoice because the mandatory Purchase Order number (PO-88392) is missing from the invoice billing record.',
      recommended_action: 'request_po',
      generated_response: 'Hi Apex Global Accounts Payable, thank you for clarifying. We have noted PO-88392 and will immediately reissue invoice INV-2024-001 with this PO number included so you can release the payment.'
    },
    recovery_action: {
      action_type: 'request_po',
      status: 'completed',
      message: 'Automated response sent requesting PO validation and confirming reissuance.'
    }
  },

  // 2. Approval Pending Scenario
  {
    invoice_number: 'INV-2024-002',
    customer_name: 'Nexus Health Systems',
    customer_email: 'finance@nexushealth-demo.org',
    amount: 32400.00,
    currency: 'USD',
    issue_date: '2024-02-15',
    due_date: '2024-03-15',
    status: 'overdue',
    description: 'Annual HIPAA compliant data pipeline and audit logging services.',
    communications: [
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'Hi Nexus Health finance team, friendly reminder that invoice INV-2024-002 is past its net-30 due date.',
        timestamp: '2024-03-18 09:00:00'
      },
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'Hello, the invoice has been approved by the IT Director and is currently routed to our VP of Finance for final secondary authorization. Invoices over $25,000 require dual executive sign-off. The executive committee meets every Thursday to sign off batches.',
        timestamp: '2024-03-19 11:20:00'
      }
    ],
    ai_analysis: {
      reason_category: 'approval_pending',
      confidence: 0.92,
      explanation: 'Invoice exceeds the customer internal threshold ($25k) and is awaiting VP of Finance secondary sign-off during the Thursday batch review.',
      recommended_action: 'request_approval_followup',
      generated_response: 'Hi Nexus Health Team, thank you for the update on the executive sign-off schedule. We will pause payment reminders and check back this Friday after your Thursday executive authorization batch.'
    },
    recovery_action: null
  },

  // 3. Invoice Error Scenario
  {
    invoice_number: 'INV-2024-003',
    customer_name: 'Vanguard Tech Solutions',
    customer_email: 'accounts@vanguardtech-demo.io',
    amount: 8750.00,
    currency: 'USD',
    issue_date: '2024-03-01',
    due_date: '2024-03-31',
    status: 'overdue',
    description: 'Cloud infrastructure security assessment and penetration testing deliverables.',
    communications: [
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'We received invoice INV-2024-003, but there is an error in the billing computation. You charged sales tax at 8.75% ($700), but we provided our Delaware tax-exempt certificate (EX-9921) upon contract signing. Also, the entity address lists our prior New York office instead of Austin headquarters.',
        timestamp: '2024-04-02 16:45:00'
      }
    ],
    ai_analysis: {
      reason_category: 'invoice_error',
      confidence: 0.95,
      explanation: 'Invoice contains tax computation error (tax-exempt client charged sales tax) and an outdated corporate billing address.',
      recommended_action: 'send_corrected_invoice',
      generated_response: 'Hi Vanguard Accounts Team, apologies for the clerical oversight regarding your tax exemption (EX-9921) and updated Austin HQ address. We have zeroed out the tax charge and generated corrected invoice INV-2024-003-R for $8,050.00.'
    },
    recovery_action: {
      action_type: 'send_corrected_invoice',
      status: 'completed',
      message: 'Corrected invoice without tax generated and sent to customer accounts payable.'
    }
  },

  // 4. Amount Dispute Scenario
  {
    invoice_number: 'INV-2024-004',
    customer_name: 'Meridian Cloud Networks',
    customer_email: 'procurement@meridiancloud-demo.net',
    amount: 19800.00,
    currency: 'USD',
    issue_date: '2024-02-20',
    due_date: '2024-03-20',
    status: 'disputed',
    description: 'Custom microservice database migration and performance tuning.',
    communications: [
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'Follow-up regarding overdue payment for invoice INV-2024-004 ($19,800.00).',
        timestamp: '2024-03-22 14:00:00'
      },
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'We are disputing line item #2 on this invoice. The SOW clearly established a capped budget of 40 consulting hours ($6,000) for data migration, but you have invoiced for 82 hours ($12,300). No change order was approved for the excess hours. We will not release payment until the excess hours are credited.',
        timestamp: '2024-03-23 10:10:00'
      }
    ],
    ai_analysis: {
      reason_category: 'amount_dispute',
      confidence: 0.91,
      explanation: 'Customer actively disputes 42 unapproved consulting hours on line item #2 that exceed the contractual SOW cap.',
      recommended_action: 'schedule_dispute_resolution',
      generated_response: 'Hi Meridian Procurement, thank you for bringing this SOW cap discrepancy to our attention. Our project lead would like to review the work logs with you in a brief 15-minute call today to agree on credit adjustment.'
    },
    recovery_action: null
  },

  // 5. No Response Scenario
  {
    invoice_number: 'INV-2024-005',
    customer_name: 'Hyperion Digital Media LLC',
    customer_email: 'accounts@hyperionmedia-demo.com',
    amount: 6200.00,
    currency: 'USD',
    issue_date: '2024-01-10',
    due_date: '2024-02-10',
    status: 'overdue',
    description: 'Digital media streaming bandwidth and CDN hosting services.',
    communications: [
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'First reminder: Invoice INV-2024-005 for $6,200.00 is due on February 10th.',
        timestamp: '2024-02-05 09:00:00'
      },
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'Second notice: Invoice INV-2024-005 is now 14 days overdue. Please confirm payment release date.',
        timestamp: '2024-02-24 10:30:00'
      },
      {
        communication_type: 'email',
        sender: 'finance_team',
        message: 'Third notice: Invoice INV-2024-005 is now 35 days past due. No acknowledgment has been received. Please contact us immediately.',
        timestamp: '2024-03-16 11:00:00'
      }
    ],
    ai_analysis: {
      reason_category: 'no_response',
      confidence: 0.96,
      explanation: 'Customer has failed to reply or acknowledge 3 consecutive overdue notices over a 45-day duration.',
      recommended_action: 'escalate_reminder',
      generated_response: 'Hi Hyperion Digital Accounts, we have attempted to contact you multiple times regarding invoice INV-2024-005 ($6,200.00). Please provide payment status within 48 hours to avoid account suspension or escalation to collections.'
    },
    recovery_action: null
  },

  // 6. Active In Recovery Scenario
  {
    invoice_number: 'INV-2024-006',
    customer_name: 'Quantum Dynamics Corp',
    customer_email: 'payables@quantumdynamics-demo.com',
    amount: 27500.00,
    currency: 'USD',
    issue_date: '2024-02-25',
    due_date: '2024-03-25',
    status: 'in_recovery',
    description: 'Quantum simulation compute cluster rental & specialized software licenses.',
    communications: [
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'We need the updated tax residency documentation before our Swiss subsidiary can remit the wire transfer.',
        timestamp: '2024-03-26 15:00:00'
      }
    ],
    ai_analysis: {
      reason_category: 'missing_po',
      confidence: 0.88,
      explanation: 'Customer wire transfer is blocked pending cross-border tax residency documentation.',
      recommended_action: 'send_tax_documentation',
      generated_response: 'Hi Quantum Dynamics Team, we have attached our W-8BEN-E tax residency certification to enable your wire transfer.'
    },
    recovery_action: {
      action_type: 'send_tax_documentation',
      status: 'in_progress',
      message: 'Dispatched tax certification documentation to international accounts team.'
    }
  },

  // 7. Recovered Scenario (Success story for dashboard)
  {
    invoice_number: 'INV-2024-007',
    customer_name: 'Orion Software Group',
    customer_email: 'billing@orionsoftware-demo.com',
    amount: 12000.00,
    currency: 'USD',
    issue_date: '2024-01-15',
    due_date: '2024-02-15',
    status: 'recovered',
    description: 'Annual enterprise developer SDK licenses and priority SLA support.',
    communications: [
      {
        communication_type: 'email',
        sender: 'customer',
        message: 'PO was missing in original invoice. Received updated invoice with PO-77189 yesterday. Payment released via ACH today.',
        timestamp: '2024-02-20 12:00:00'
      }
    ],
    ai_analysis: {
      reason_category: 'missing_po',
      confidence: 0.95,
      explanation: 'Previously delayed due to missing PO number. Successfully reissued with PO-77189.',
      recommended_action: 'request_po',
      generated_response: 'Thank you Orion Software team. Payment verified and settled.'
    },
    recovery_action: {
      action_type: 'request_po',
      status: 'completed',
      message: 'Automated PO recovery workflow resolved the block. Payment recovered in full.'
    }
  },

  // 8. Normal Pending Scenario
  {
    invoice_number: 'INV-2024-008',
    customer_name: 'Starlight Media Works',
    customer_email: 'accounts@starlightmedia-demo.com',
    amount: 5400.00,
    currency: 'USD',
    issue_date: '2024-03-25',
    due_date: '2024-04-25',
    status: 'pending',
    description: 'Monthly video transcoding and rendering compute time.',
    communications: [],
    ai_analysis: null,
    recovery_action: null
  }
];

async function seedDatabase() {
  try {
    logger.info('[Seed] Initializing database schema...');
    await initSchema();

    logger.info('[Seed] Clearing existing demo data...');
    await exec(`
      DELETE FROM activity_timeline;
      DELETE FROM recovery_actions;
      DELETE FROM ai_analysis;
      DELETE FROM communications;
      DELETE FROM invoices;
      DELETE FROM sqlite_sequence WHERE name IN ('activity_timeline', 'recovery_actions', 'ai_analysis', 'communications', 'invoices');
    `);

    logger.info(`[Seed] Seeding ${invoicesData.length} realistic invoices with communications and workflows...`);

    for (const inv of invoicesData) {
      // 1. Insert Invoice
      const invResult = await run(
        `INSERT INTO invoices (
          invoice_number, customer_name, customer_email, amount, currency,
          issue_date, due_date, status, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 days'), datetime('now'))`,
        [
          inv.invoice_number,
          inv.customer_name,
          inv.customer_email,
          inv.amount,
          inv.currency,
          inv.issue_date,
          inv.due_date,
          inv.status,
          inv.description
        ]
      );
      const invoiceId = invResult.id;

      // 2. Insert Timeline Event for invoice creation
      await run(
        `INSERT INTO activity_timeline (invoice_id, event_type, description, metadata, created_at)
         VALUES (?, ?, ?, ?, datetime('now', '-30 days'))`,
        [
          invoiceId,
          'invoice_created',
          `Invoice ${inv.invoice_number} created for ${inv.customer_name} (${inv.currency} ${inv.amount.toFixed(2)})`,
          JSON.stringify({ amount: inv.amount, currency: inv.currency, status: inv.status })
        ]
      );

      // 3. Insert Communications
      if (inv.communications && inv.communications.length > 0) {
        for (const comm of inv.communications) {
          await run(
            `INSERT INTO communications (invoice_id, communication_type, sender, message, timestamp)
             VALUES (?, ?, ?, ?, ?)`,
            [invoiceId, comm.communication_type, comm.sender, comm.message, comm.timestamp]
          );

          await run(
            `INSERT INTO activity_timeline (invoice_id, event_type, description, metadata, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
              invoiceId,
              'communication_logged',
              `Communication from ${comm.sender} (${comm.communication_type})`,
              JSON.stringify({ sender: comm.sender, communication_type: comm.communication_type }),
              comm.timestamp
            ]
          );
        }
      }

      // 4. Insert AI Analysis (if provided)
      if (inv.ai_analysis) {
        const ai = inv.ai_analysis;
        const aiResult = await run(
          `INSERT INTO ai_analysis (
            invoice_id, reason_category, confidence, explanation,
            recommended_action, generated_response, analyzed_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-5 days'))`,
          [
            invoiceId,
            ai.reason_category,
            ai.confidence,
            ai.explanation,
            ai.recommended_action,
            ai.generated_response
          ]
        );

        await run(
          `INSERT INTO activity_timeline (invoice_id, event_type, description, metadata, created_at)
           VALUES (?, ?, ?, ?, datetime('now', '-5 days'))`,
          [
            invoiceId,
            'ai_analysis',
            `AI identified payment issue: '${ai.reason_category}' (${Math.round(ai.confidence * 100)}% confidence)`,
            JSON.stringify({ reason_category: ai.reason_category, confidence: ai.confidence, analysis_id: aiResult.id }),
          ]
        );
      }

      // 5. Insert Recovery Action (if provided)
      if (inv.recovery_action) {
        const rec = inv.recovery_action;
        const recResult = await run(
          `INSERT INTO recovery_actions (invoice_id, action_type, status, message, created_at)
           VALUES (?, ?, ?, ?, datetime('now', '-2 days'))`,
          [invoiceId, rec.action_type, rec.status, rec.message]
        );

        await run(
          `INSERT INTO activity_timeline (invoice_id, event_type, description, metadata, created_at)
           VALUES (?, ?, ?, ?, datetime('now', '-2 days'))`,
          [
            invoiceId,
            'recovery_action_executed',
            `Recovery action '${rec.action_type}' initiated (${rec.status})`,
            JSON.stringify({ action_type: rec.action_type, status: rec.status, recovery_id: recResult.id })
          ]
        );
      }
    }

    logger.info('[Seed] Database successfully seeded with 8 realistic invoices!');
    logger.info('[Seed] Scenarios seeded:');
    logger.info('  1. Missing PO: INV-2024-001 (Apex Global Logistics)');
    logger.info('  2. Approval Pending: INV-2024-002 (Nexus Health Systems)');
    logger.info('  3. Invoice Error: INV-2024-003 (Vanguard Tech Solutions)');
    logger.info('  4. Amount Dispute: INV-2024-004 (Meridian Cloud Networks)');
    logger.info('  5. No Response: INV-2024-005 (Hyperion Digital Media)');
    logger.info('  6. In Recovery: INV-2024-006 (Quantum Dynamics)');
    logger.info('  7. Recovered: INV-2024-007 (Orion Software Group)');
    logger.info('  8. Normal Pending: INV-2024-008 (Starlight Media Works)');

    process.exit(0);
  } catch (error) {
    logger.error('[Seed] Database seeding failed:', error);
    process.exit(1);
  }
}

// Execute seed if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

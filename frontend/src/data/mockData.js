// Centralized realistic mock data for PayFlow Hackathon MVP

export const mockKpis = {
  totalReceivables: {
    label: "Total Receivables",
    value: "$342,800",
    rawValue: 342800,
    change: "+8.4%",
    changeType: "neutral",
    subtext: "Across 28 active customer accounts",
  },
  overdueAmount: {
    label: "Overdue Amount",
    value: "$128,450",
    rawValue: 128450,
    change: "37.4% of total",
    changeType: "danger",
    subtext: "11 invoices past net-30 terms",
  },
  blockedInvoices: {
    label: "Blocked Invoices",
    value: "14",
    rawValue: 14,
    change: "$89,200 stuck",
    changeType: "warning",
    subtext: "Requiring active intervention",
  },
  recoveryOpportunity: {
    label: "Recovery Opportunity",
    value: "$76,400",
    rawValue: 76400,
    change: "85% avg confidence",
    changeType: "success",
    subtext: "Ready for automated AI outreach",
  },
};

export const mockInvoices = [
  {
    id: "INV-2024-8901",
    invoiceNumber: "INV-8901",
    customer: {
      name: "Apex Logistics Corp",
      domain: "apexlogistics.com",
      contactName: "Marcus Vance",
      contactTitle: "Head of Accounts Payable",
      contactEmail: "marcus.vance@apexlogistics.com",
      tier: "Enterprise",
      initials: "AL",
    },
    amount: 48500,
    formattedAmount: "$48,500",
    issueDate: "2024-09-02",
    dueDate: "2024-10-02",
    daysOverdue: 22,
    status: "Blocked",
    priority: "Critical",
    blocker: "Cash flow issue",
    blockerConfidence: 94,
    workflowStage: "Recommend Action",
    recommendedAction: "Propose 50% split milestone payment plan",
    communication: {
      channel: "Email Thread",
      sender: "Marcus Vance (Head of Accounts Payable)",
      date: "Oct 21, 2024 at 10:14 AM",
      subject: "RE: Overdue Notice — Inv #INV-8901 [$48,500]",
      preview: "We're experiencing temporary quarterly working capital constraints following our freight expansion...",
      body: `Hi Finance Team,

Thanks for following up on INV-8901. We want to be transparent: we're experiencing a temporary quarterly working capital crunch following our fleet expansion in the Midwest. 

Our accounts are definitely good for the balance, but our CFO has frozen single disbursements over $25k until our Q4 customer receivables clear on the 15th of next month.

Could you allow us to split this balance, or provide a 3-week payment extension? We value this partnership and don't want service interrupted.

Best regards,
Marcus Vance
Head of Accounts Payable | Apex Logistics Corp`,
    },
    aiAnalysis: {
      detectedBlocker: "Cash flow issue",
      confidence: 94,
      severity: "High",
      sentiment: "Apologetic & Accommodating (Low default risk)",
      reason: "Customer explicitly confirmed inability to disburse single payments >$25k before Nov 15 due to fleet capital expenditure, but confirmed solvency and willingness to fulfill partial obligations immediately.",
      keySignals: [
        "Cap-ex freeze on disbursements >$25,000",
        "Confirmed intention to pay full amount",
        "Requested structured milestone split terms",
        "High customer lifetime value ($320k annual)",
      ],
      recommendedAction: "Propose 50% split payment: $24,250 due in 3 days, remaining $24,250 on Nov 15 with auto-ACH guarantee.",
    },
    generatedResponse: {
      subject: "PayFlow Resolution: Structured 2-Part Payment Plan for INV-8901",
      tone: "Professional & Accommodating",
      targetAudience: "AP Dept & CFO Office",
      body: `Hi Marcus,

Thank you for the candid update regarding Apex Logistics' expansion. We understand seasonal cash flow timing and value our ongoing partnership.

To accommodate your CFO's disbursement parameters while keeping your account in good standing without service interruption, we can approve a structured two-part payment arrangement:

1. Installment 1: $24,250.00 — Due Friday, Oct 25 (under your $25k threshold)
2. Installment 2: $24,250.00 — Due Friday, Nov 15 (aligned with your customer receivables)

Please confirm if this schedule works for your AP team by clicking below to authorize the schedule, and we will update your ledger automatically:

[Review & Accept Payment Schedule ->]

Thank you,
Finance & Collections Team`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Sep 02, 2024 • 09:00 AM",
        description: "Invoice #INV-8901 created for $48,500 (Net 30 terms).",
        type: "system",
        actor: "Billing Engine",
      },
      {
        id: "ev-2",
        eventName: "Payment Due Date Elapsed",
        timestamp: "Oct 02, 2024 • 11:59 PM",
        description: "Net 30 grace period expired without payment receipt.",
        type: "warning",
        actor: "System Monitor",
      },
      {
        id: "ev-3",
        eventName: "Customer Communication Ingested",
        timestamp: "Oct 21, 2024 • 10:14 AM",
        description: "Email received from Marcus Vance citing working capital constraints.",
        type: "communication",
        actor: "Email Connector",
      },
      {
        id: "ev-4",
        eventName: "AI Blocker Detection Completed",
        timestamp: "Oct 21, 2024 • 10:16 AM",
        description: "Blocker identified as 'Cash flow issue' with 94% confidence.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
      {
        id: "ev-5",
        eventName: "Recommended Strategy Formulated",
        timestamp: "Oct 21, 2024 • 10:16 AM",
        description: "Generated 50/50 installment recovery plan under customer disbursement ceiling.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8902",
    invoiceNumber: "INV-8902",
    customer: {
      name: "CloudScale Systems",
      domain: "cloudscale.ai",
      contactName: "Elena Rostova",
      contactTitle: "VP Engineering & Procurement",
      contactEmail: "elena.rostova@cloudscale.ai",
      tier: "Enterprise",
      initials: "CS",
    },
    amount: 32400,
    formattedAmount: "$32,400",
    issueDate: "2024-09-10",
    dueDate: "2024-10-10",
    daysOverdue: 14,
    status: "Blocked",
    priority: "High",
    blocker: "Invoice dispute",
    blockerConfidence: 91,
    workflowStage: "Recommend Action",
    recommendedAction: "Issue revised invoice removing unauthorized tier surcharge",
    communication: {
      channel: "Support Portal Ticket #8812",
      sender: "Elena Rostova (VP Engineering)",
      date: "Oct 18, 2024 at 03:22 PM",
      subject: "Disputed Line Item on Cloud Computing Service Hours",
      preview: "We noticed line item 4 includes $4,200 for 'Premium Over-Quota Bandwidth' that was never authorized...",
      body: `Hello Accounts Team,

We are putting a hold on INV-8902 ($32,400). Line item #4 shows an extra $4,200 for 'Premium Cloud Bandwidth Surcharge'. 

According to our master service agreement signed June 12th (Section 4.2), all bandwidth charges are capped at $1,000/mo unless pre-approved in writing. We never received or signed an addendum for this.

We are ready to release payment for the undisputed base services ($28,200) immediately if you can credit or reissue the invoice without the unapproved surcharge.

Regards,
Elena Rostova
VP Engineering | CloudScale Systems`,
    },
    aiAnalysis: {
      detectedBlocker: "Invoice dispute",
      confidence: 91,
      severity: "High",
      sentiment: "Firm & Disputing specific line item",
      reason: "Customer dispute is narrowed down to Line Item #4 ($4,200 bandwidth charge). Customer explicitly stated willingness to pay $28,200 instantly upon receiving adjusted invoice.",
      keySignals: [
        "Contract MSA reference: Section 4.2 cap",
        "Dispute is partial ($4,200 out of $32,400)",
        "Zero dispute on remaining $28,200 base amount",
        "Immediate payment promised upon revised billing",
      ],
      recommendedAction: "Issue a $4,200 credit memo and send updated one-click settlement link for $28,200.",
    },
    generatedResponse: {
      subject: "Resolution: Revised Invoice INV-8902 with $4,200 Credit Memo",
      tone: "Conciliatory & Fast-Track",
      targetAudience: "Engineering Lead & AP",
      body: `Hi Elena,

Thank you for bringing Section 4.2 of our MSA to our attention. You are completely right — our automated metering tool appended the standard overage rate rather than applying your custom cap.

We have issued Credit Memo #CM-104 for -$4,200.00. 

Your adjusted invoice total is now $28,200.00. You can review the updated invoice and process payment with one click via our secure portal below:

[Pay Adjusted Balance ($28,200) ->]

We apologize for the oversight and have pinned your account terms to avoid this on future billing cycles.

Warm regards,
Finance Operations`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Sep 10, 2024 • 08:30 AM",
        description: "Invoice #INV-8902 issued for $32,400.",
        type: "system",
        actor: "Billing System",
      },
      {
        id: "ev-2",
        eventName: "Dispute Ticket Logged",
        timestamp: "Oct 18, 2024 • 03:22 PM",
        description: "Ticket #8812 created by Elena Rostova disputing $4,200 line item.",
        type: "communication",
        actor: "Zendesk Connector",
      },
      {
        id: "ev-3",
        eventName: "AI Contract & Dispute Analysis",
        timestamp: "Oct 18, 2024 • 03:24 PM",
        description: "Detected contract MSA cap mismatch. Verified undisputed amount at $28,200.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
      {
        id: "ev-4",
        eventName: "Credit Memo Recommendation Generated",
        timestamp: "Oct 18, 2024 • 03:25 PM",
        description: "Suggested automatic $4,200 credit adjustment to unblock $28,200.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8903",
    invoiceNumber: "INV-8903",
    customer: {
      name: "Meridian Health Tech",
      domain: "meridianhealth.io",
      contactName: "David Chen",
      contactTitle: "Procurement Manager",
      contactEmail: "d.chen@meridianhealth.io",
      tier: "Mid-Market",
      initials: "MH",
    },
    amount: 19800,
    formattedAmount: "$19,800",
    issueDate: "2024-09-18",
    dueDate: "2024-10-18",
    daysOverdue: 6,
    status: "Blocked",
    priority: "Medium",
    blocker: "Missing documentation",
    blockerConfidence: 96,
    workflowStage: "Recommend Action",
    recommendedAction: "Attach missing W-9 and vendor insurance certification to AP portal",
    communication: {
      channel: "AP Automated Portal Notification",
      sender: "Coupa Automated Gateway (ap@meridianhealth.io)",
      date: "Oct 19, 2024 at 09:12 AM",
      subject: "Invoice Rejected: Missing Required Vendor Compliance Documents",
      preview: "Invoice INV-8903 has been placed on hold. Reason: Annual Form W-9 and Certificate of Insurance (COI)...",
      body: `ATTENTION VENDOR:

Invoice Reference: INV-8903
Submitting Vendor: PayFlow Systems
Amount: $19,800.00

STATUS: PENDING VENDOR COMPLIANCE
Your invoice cannot be routed for manager approval until the following compliance documents are updated on Meridian's Coupa Vendor Portal:

1. Current Year IRS Form W-9 (Signed within current calendar year)
2. Certificate of Insurance (COI) listing Meridian Health Tech as certificate holder

Once uploaded, invoice workflow will automatically resume without restarting net-30 terms.

Meridian Health Accounts Payable`,
    },
    aiAnalysis: {
      detectedBlocker: "Missing documentation",
      confidence: 96,
      severity: "Medium",
      sentiment: "Automated rejection (Zero financial insolvency)",
      reason: "Invoice payment is paused purely due to vendor compliance gatekeeping (W-9 and COI expiration on Coupa portal). Payment will clear upon document upload.",
      keySignals: [
        "Coupa portal automated compliance check",
        "Required items: Form W-9 (2024) + COI",
        "Explicit guarantee: workflow resumes without term reset",
        "No dispute regarding services or fee amount",
      ],
      recommendedAction: "Dispatch pre-verified 2024 W-9 and COI documents via secure Coupa portal integration or email direct upload.",
    },
    generatedResponse: {
      subject: "Compliance Documents Provided: Updated W-9 & COI for Invoice INV-8903",
      tone: "Direct & Compliant",
      targetAudience: "AP Compliance Team",
      body: `Hello Meridian Health AP Team,

Thank you for the notification regarding Invoice INV-8903 ($19,800.00).

We have uploaded our current-year signed IRS Form W-9 and Certificate of Insurance (COI) with Meridian Health Tech designated as the certificate holder.

Both files are attached to this message and submitted to Coupa portal reference #CP-49021. 

Please release the hold and confirm the scheduled ACH payment release date.

Best regards,
Compliance & Finance Operations`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Uploaded to Coupa",
        timestamp: "Sep 18, 2024 • 10:00 AM",
        description: "Invoice submitted to customer AP portal.",
        type: "system",
        actor: "Billing Integrator",
      },
      {
        id: "ev-2",
        eventName: "Compliance Exception Triggered",
        timestamp: "Oct 19, 2024 • 09:12 AM",
        description: "Portal flagged expired COI and missing 2024 W-9.",
        type: "warning",
        actor: "Coupa Portal",
      },
      {
        id: "ev-3",
        eventName: "AI Document Matcher Executed",
        timestamp: "Oct 19, 2024 • 09:15 AM",
        description: "Matched customer requirement to verified company documents repository.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8904",
    invoiceNumber: "INV-8904",
    customer: {
      name: "Nexus Global Logistics",
      domain: "nexusgl.com",
      contactName: "Sarah Sterling",
      contactTitle: "Chief Financial Officer",
      contactEmail: "s.sterling@nexusgl.com",
      tier: "Enterprise",
      initials: "NG",
    },
    amount: 54000,
    formattedAmount: "$54,000",
    issueDate: "2024-09-01",
    dueDate: "2024-10-01",
    daysOverdue: 23,
    status: "Recovery Ready",
    priority: "Critical",
    blocker: "Approval pending",
    blockerConfidence: 89,
    workflowStage: "Recover",
    recommendedAction: "Send executive one-tap sign-off link to CFO Sarah Sterling",
    communication: {
      channel: "Slack Connect Channel #payflow-nexus",
      sender: "Dan Miller (AP Supervisor)",
      date: "Oct 20, 2024 at 02:45 PM",
      subject: "Invoice #8904 Status update",
      preview: "Hey team, this invoice has been approved by operations, just sitting in Sarah's queue for final executive sign-off...",
      body: `Hey PayFlow team, quick update:

Invoice #8904 ($54,000) has passed department budget review with flying colors. Because it's over $50k, our ERP requires secondary sign-off from Sarah Sterling (CFO). 

She's been traveling for the European partner summits and has a backlog of 70+ approval tasks in SAP. Once she clicks approve, the payment batch executes on the next Tuesday run.

Dan Miller
Accounts Payable Lead`,
    },
    aiAnalysis: {
      detectedBlocker: "Approval pending",
      confidence: 89,
      severity: "Critical",
      sentiment: "Positive / Bureaucratic bottleneck",
      reason: "Invoice is completely approved by operational department; blocked exclusively by executive threshold sign-off backlog ($50k SAP rule) during CFO travel schedule.",
      keySignals: [
        "Operational approval passed",
        "Executive approval threshold ($50k)",
        "CFO currently traveling with mobile-first accessibility",
        "Next payment batch executes on Tuesday",
      ],
      recommendedAction: "Trigger executive bypass notification via mobile-optimized one-tap authorization link to CFO.",
    },
    generatedResponse: {
      subject: "Priority Authorization: 1-Tap Sign-Off for PayFlow Invoice #INV-8904 ($54k)",
      tone: "Executive & Concise",
      targetAudience: "CFO Sarah Sterling",
      body: `Hi Sarah,

We know you're currently traveling for partner meetings. 

Dan Miller and the operations team have approved Invoice #INV-8904 ($54,000.00 for Q3 Infrastructure Services). To meet the upcoming Tuesday disbursement window without navigating the full ERP portal backlog, you can authorize it directly from your phone below:

[Authorize Payment with 1-Tap ($54,000) ->]

Attached is the 1-page executive summary and Dan's sign-off record.

Thank you,
PayFlow Automated Recovery`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Sep 01, 2024 • 09:00 AM",
        description: "Invoice #INV-8904 generated for $54,000.",
        type: "system",
        actor: "Billing System",
      },
      {
        id: "ev-2",
        eventName: "Internal Ops Approval Granted",
        timestamp: "Oct 10, 2024 • 04:15 PM",
        description: "Dan Miller approved departmental spend.",
        type: "system",
        actor: "Customer ERP",
      },
      {
        id: "ev-3",
        eventName: "Executive Bottleneck Flagged",
        timestamp: "Oct 20, 2024 • 02:45 PM",
        description: "Slack Connect communication parsed. Identified CFO sign-off delay.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
      {
        id: "ev-4",
        eventName: "Mobile 1-Tap Recovery Flow Prepared",
        timestamp: "Oct 20, 2024 • 02:46 PM",
        description: "Generated direct executive signature dispatch.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8905",
    invoiceNumber: "INV-8905",
    customer: {
      name: "Vanguard Robotics",
      domain: "vanguardrobotics.com",
      contactName: "Julian Ortiz",
      contactTitle: "Treasury Specialist",
      contactEmail: "j.ortiz@vanguardrobotics.com",
      tier: "Enterprise",
      initials: "VR",
    },
    amount: 27500,
    formattedAmount: "$27,500",
    issueDate: "2024-09-25",
    dueDate: "2024-10-25",
    daysOverdue: 0,
    status: "Blocked",
    priority: "Medium",
    blocker: "Payment processing issue",
    blockerConfidence: 97,
    workflowStage: "Detect Blocker",
    recommendedAction: "Resend updated banking routing instructions to Treasury",
    communication: {
      channel: "Bank Clearing Notice",
      sender: "Treasury Wire Services (JPMorgan Clearing)",
      date: "Oct 22, 2024 at 11:05 AM",
      subject: "ACH Originator Reject: Invalid Fedwire Routing Number",
      preview: "Payment attempt of $27,500.00 for vendor PayFlow was rejected with code R03 (No Account / Invalid Routing)...",
      body: `WIRE TRANSACTION EXCEPTION NOTICE:

Originator: Vanguard Robotics Inc
Beneficiary: PayFlow Inc
Amount: $27,500.00
Transaction Ref: W-991048-ACH

Exception Code: R03 (Routing transit number mismatch / outdated receiver clearing identifier)
The originating bank was unable to complete the credit transfer. 

Customer Treasury Note: "We used the wire instructions from our 2023 vendor file. Please confirm if your depository bank was migrated."`,
    },
    aiAnalysis: {
      detectedBlocker: "Payment processing issue",
      confidence: 97,
      severity: "Low Risk of Default",
      sentiment: "Technical execution error (Funds available)",
      reason: "Customer already attempted full wire disbursement of $27,500, but failed ACH code R03 due to using obsolete 2023 depository routing info.",
      keySignals: [
        "Payment intent proven: ACH initiated",
        "Clear rejection code: R03 invalid routing",
        "Customer treasury waiting for updated depository specs",
        "Zero dispute or cash constraints",
      ],
      recommendedAction: "Transmit authenticated digital bank verification letter and updated ACH routing instructions with test ping.",
    },
    generatedResponse: {
      subject: "Updated Bank Routing Specifications for INV-8905 Wire Disbursement",
      tone: "Crisp & Operational",
      targetAudience: "Treasury Team",
      body: `Hi Julian,

Thank you for attempting the wire for INV-8905 ($27,500.00). 

We noticed the transaction returned with code R03. Our treasury transitioned to Silicon Valley Bank / First Citizens clearing accounts earlier this year. 

Here are the authenticated wire and ACH coordinates for our depository:

• Bank Name: First Citizens Bank
• Routing / ABA (ACH): 121000358
• Account Number: 884019294029
• Account Title: PayFlow Technologies Inc

You can also download our cryptographically signed Voided Check and Bank Verification Letter here:

[Download Bank Letter (PDF) ->]

Please re-queue the wire at your earliest convenience.

Best regards,
Treasury Operations`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Sep 25, 2024 • 09:00 AM",
        description: "Invoice #INV-8905 created for $27,500.",
        type: "system",
        actor: "Billing System",
      },
      {
        id: "ev-2",
        eventName: "ACH Disbursement Failed",
        timestamp: "Oct 22, 2024 • 11:05 AM",
        description: "JPMorgan Clearing exception code R03 logged.",
        type: "warning",
        actor: "Bank Webhook",
      },
      {
        id: "ev-3",
        eventName: "AI Route Diagnostic Performed",
        timestamp: "Oct 22, 2024 • 11:06 AM",
        description: "Detected outdated 2023 depository account credentials.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8906",
    invoiceNumber: "INV-8906",
    customer: {
      name: "Starlight Digital Media",
      domain: "starlightmedia.com",
      contactName: "Chloe Nguyen",
      contactTitle: "Production Operations Director",
      contactEmail: "chloe.n@starlightmedia.com",
      tier: "Mid-Market",
      initials: "SD",
    },
    amount: 14200,
    formattedAmount: "$14,200",
    issueDate: "2024-09-12",
    dueDate: "2024-10-12",
    daysOverdue: 12,
    status: "Overdue",
    priority: "Medium",
    blocker: "Customer clarification required",
    blockerConfidence: 87,
    workflowStage: "Analyze",
    recommendedAction: "Send deliverable acceptance verification package for Phase 2 video assets",
    communication: {
      channel: "Email",
      sender: "Chloe Nguyen (Production Operations)",
      date: "Oct 16, 2024 at 05:40 PM",
      subject: "Milestone check for Invoice #8906",
      preview: "Our finance department flagged this, but I haven't seen the final sign-off timestamp from our creative director...",
      body: `Hi there,

Our accounting team asked me about the release for invoice #8906 ($14,200). 

Before I approve this in our system, can you share the timestamped delivery logs and client sign-off link for the Phase 2 render exports? I know we received the rough drafts, but our lead director was out sick and I need to ensure the final acceptance criteria was met before signing off.

Best,
Chloe`,
    },
    aiAnalysis: {
      detectedBlocker: "Customer clarification required",
      confidence: 87,
      severity: "Medium",
      sentiment: "Neutral / Diligent",
      reason: "Stakeholder needs milestone delivery proof and timestamped sign-off certificate to satisfy internal production audit before approving release.",
      keySignals: [
        "Inquiring on Phase 2 deliverables",
        "Sign-off delayed by director absence",
        "Accounting waiting on Chloe's verification",
        "Quick unblock with delivery receipt",
      ],
      recommendedAction: "Provide bundled milestone delivery proof package and link directly to creative director sign-off sheet.",
    },
    generatedResponse: {
      subject: "Deliverable Audit & Delivery Receipt for Invoice #INV-8906",
      tone: "Clear & Verified",
      targetAudience: "Production Lead",
      body: `Hi Chloe,

Understood! Here is the complete delivery and acceptance audit trail for Phase 2 renders:

• Package Delivery ID: DLV-9921
• Final Delivery Timestamp: Sep 28, 2024 at 4:18 PM EDT
• File Vault Link: [View Render Archive & Hash Signatures ->]
• Acceptance Criteria Status: 100% completed

With this package attached, could you release the hold on INV-8906 so your accounting team can disburse payment?

Thank you,
Project Accounting Lead`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Sep 12, 2024 • 10:00 AM",
        description: "Invoice #INV-8906 issued for $14,200.",
        type: "system",
        actor: "Billing System",
      },
      {
        id: "ev-2",
        eventName: "Inquiry Ingested",
        timestamp: "Oct 16, 2024 • 05:40 PM",
        description: "Inquiry received asking for Phase 2 deliverable audit trail.",
        type: "communication",
        actor: "Email Connector",
      },
      {
        id: "ev-3",
        eventName: "AI Deliverable Cross-Check",
        timestamp: "Oct 16, 2024 • 05:42 PM",
        description: "Matched project deliverables in cloud archive to invoice line items.",
        type: "ai",
        actor: "PayFlow AI Engine",
      },
    ],
  },
  {
    id: "INV-2024-8907",
    invoiceNumber: "INV-8907",
    customer: {
      name: "Beacon Dynamics",
      domain: "beacondynamics.co",
      contactName: "Arthur King",
      contactTitle: "Financial Controller",
      contactEmail: "a.king@beacondynamics.co",
      tier: "Enterprise",
      initials: "BD",
    },
    amount: 62000,
    formattedAmount: "$62,000",
    issueDate: "2024-10-05",
    dueDate: "2024-11-05",
    daysOverdue: 0,
    status: "Pending",
    priority: "Low",
    blocker: "None",
    blockerConfidence: 99,
    workflowStage: "Analyze",
    recommendedAction: "Monitor standard Net-30 payment lifecycle",
    communication: {
      channel: "Automated Confirmation",
      sender: "Beacon Accounts Payable",
      date: "Oct 06, 2024 at 10:00 AM",
      subject: "Invoice #8907 Queued for Scheduled Processing",
      preview: "We have received invoice #8907. It has been placed in our scheduled November batch...",
      body: `Your invoice has been validated and queued in Beacon's financial ledger for settlement on standard Net-30 terms (Est: Nov 05, 2024). No further action required.`,
    },
    aiAnalysis: {
      detectedBlocker: "None (Healthy)",
      confidence: 99,
      severity: "None",
      sentiment: "Positive / Scheduled",
      reason: "Invoice is within terms, correctly formatted, and verified in customer accounts payable ledger.",
      keySignals: [
        "Normal aging (0 days overdue)",
        "Acknowledged by ERP",
        "No historical default pattern",
      ],
      recommendedAction: "No action required. PayFlow AI will re-scan 3 days before maturity.",
    },
    generatedResponse: {
      subject: "Acknowledgment of Scheduled Payment for INV-8907",
      tone: "Professional",
      targetAudience: "Accounts Payable",
      body: `Hi Arthur, thank you for confirming receipt and batch scheduling for INV-8907. We look forward to settlement on November 5th.`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Generated",
        timestamp: "Oct 05, 2024 • 09:00 AM",
        description: "Invoice #INV-8907 generated for $62,000.",
        type: "system",
        actor: "Billing Engine",
      },
    ],
  },
  {
    id: "INV-2024-8908",
    invoiceNumber: "INV-8908",
    customer: {
      name: "Horizon BioLabs",
      domain: "horizonbiolabs.com",
      contactName: "Tanya Morrison",
      contactTitle: "Chief Operations Officer",
      contactEmail: "tmorrison@horizonbiolabs.com",
      tier: "Enterprise",
      initials: "HB",
    },
    amount: 38700,
    formattedAmount: "$38,700",
    issueDate: "2024-08-20",
    dueDate: "2024-09-20",
    daysOverdue: 0,
    status: "Paid",
    priority: "Low",
    blocker: "Resolved (Previously Cash flow issue)",
    blockerConfidence: 98,
    workflowStage: "Recover",
    recommendedAction: "Payment recovered via AI structured payment plan",
    communication: {
      channel: "ACH Confirmation Receipt",
      sender: "Horizon BioLabs Treasury",
      date: "Oct 15, 2024 at 02:10 PM",
      subject: "Payment Executed: $38,700.00 Settled in Full",
      preview: "Final installment of agreed recovery plan has cleared successfully...",
      body: `Payment Reference #REC-9948:
Final balance of $38,700.00 has been transferred via ACH. Thank you for accommodating our milestone schedule.`,
    },
    aiAnalysis: {
      detectedBlocker: "Resolved (Previously Cash flow issue)",
      confidence: 98,
      severity: "Resolved",
      sentiment: "Delighted & Settled",
      reason: "Recovery pipeline successfully collected full $38,700 balance after executing PayFlow AI structured milestone plan.",
      keySignals: [
        "100% recovered",
        "Zero debt write-off",
        "Retained enterprise account relationship",
      ],
      recommendedAction: "Send thank-you receipt and resume normal billing cadence.",
    },
    generatedResponse: {
      subject: "Thank You: Settlement Receipt for Invoice INV-8908",
      tone: "Gratitude & Professional",
      targetAudience: "Executive Treasury",
      body: `Hi Tanya,

We have confirmed receipt of the final settlement of $38,700.00 for INV-8908. Your account is now in excellent standing.

Thank you for your partnership and communication throughout the process!

Warm regards,
PayFlow Finance Team`,
    },
    timeline: [
      {
        id: "ev-1",
        eventName: "Invoice Issued",
        timestamp: "Aug 20, 2024 • 09:00 AM",
        description: "Invoice #INV-8908 issued for $38,700.",
        type: "system",
        actor: "Billing Engine",
      },
      {
        id: "ev-2",
        eventName: "AI Recovery Plan Activated",
        timestamp: "Sep 28, 2024 • 11:30 AM",
        description: "Customer accepted AI proposed 2-part recovery schedule.",
        type: "ai",
        actor: "PayFlow Recovery Engine",
      },
      {
        id: "ev-3",
        eventName: "Payment Fully Recovered",
        timestamp: "Oct 15, 2024 • 02:10 PM",
        description: "ACH confirmation of $38,700 received.",
        type: "success",
        actor: "Bank Clearing",
      },
    ],
  },
];

// Activity Stream for the /activity route
export const mockGlobalActivity = [
  {
    id: "act-1",
    timestamp: "10:34 AM Today",
    invoiceNumber: "INV-8901",
    customer: "Apex Logistics Corp",
    amount: "$48,500",
    eventName: "Recovery action generated",
    description: "PayFlow AI synthesized a 50/50 split milestone plan under customer CFO's $25k limit.",
    category: "ai",
    statusBadge: "Action Ready",
  },
  {
    id: "act-2",
    timestamp: "10:33 AM Today",
    invoiceNumber: "INV-8901",
    customer: "Apex Logistics Corp",
    amount: "$48,500",
    eventName: "Cash flow issue detected",
    description: "NLP detected cap-ex liquidity pause from Marcus Vance with 94% confidence.",
    category: "blocker",
    statusBadge: "Blocker Identified",
  },
  {
    id: "act-3",
    timestamp: "10:32 AM Today",
    invoiceNumber: "INV-8901",
    customer: "Apex Logistics Corp",
    amount: "$48,500",
    eventName: "Customer communication analyzed",
    description: "Ingested incoming AP email regarding quarterly working capital constraints.",
    category: "communication",
    statusBadge: "Processed",
  },
  {
    id: "act-4",
    timestamp: "09:15 AM Today",
    invoiceNumber: "INV-8904",
    customer: "Nexus Global Logistics",
    amount: "$54,000",
    eventName: "Recovery initiated",
    description: "Dispatched mobile 1-tap executive authorization link directly to CFO Sarah Sterling.",
    category: "recovery",
    statusBadge: "In Flight",
  },
  {
    id: "act-5",
    timestamp: "Yesterday, 04:12 PM",
    invoiceNumber: "INV-8902",
    customer: "CloudScale Systems",
    amount: "$32,400",
    eventName: "Dispute discrepancy resolved",
    description: "Cross-referenced MSA contract cap. Drafted $4,200 credit memo to release $28,200 undisputed balance.",
    category: "ai",
    statusBadge: "Pending Send",
  },
  {
    id: "act-6",
    timestamp: "Yesterday, 02:40 PM",
    invoiceNumber: "INV-8903",
    customer: "Meridian Health Tech",
    amount: "$19,800",
    eventName: "Compliance documents auto-packaged",
    description: "Extracted current W-9 and COI from secure vault to satisfy Coupa portal verification.",
    category: "system",
    statusBadge: "Queued",
  },
  {
    id: "act-7",
    timestamp: "Oct 15, 02:10 PM",
    invoiceNumber: "INV-8908",
    customer: "Horizon BioLabs",
    amount: "$38,700",
    eventName: "Payment successfully recovered",
    description: "Full balance deposited into account via AI-orchestrated milestone payment link.",
    category: "success",
    statusBadge: "Recovered",
  },
];

// Workflow pipeline definition
export const recoveryPipelineSteps = [
  {
    step: 1,
    id: "analyze",
    title: "1. Analyze",
    subtitle: "Ingest & Understand",
    description: "Continuously monitors overdue invoices and parses unstructured customer communications (emails, AP portal notices, Slack Connect threads, and ERP logs).",
    details: "Sentiment analysis, payment history tracking, and terms validation.",
    icon: "Brain",
  },
  {
    step: 2,
    id: "detect",
    title: "2. Detect Blocker",
    subtitle: "Root Cause Classification",
    description: "Identifies precisely why payment is stalled—categorizing into Cash Flow, Invoice Dispute, Missing Docs, Approval Lag, or Processing Glitches.",
    details: "Provides confidence score (0-100%) and highlights verifiable evidence signals.",
    icon: "ShieldAlert",
  },
  {
    step: 3,
    id: "recommend",
    title: "3. Recommend Action",
    subtitle: "Strategy Formulation",
    description: "Determines the optimal recovery path: from structured installment plans and credit adjustments to executive mobile sign-offs.",
    details: "Drafts tailored, polite, and persuasive customer-ready responses automatically.",
    icon: "Sparkles",
  },
  {
    step: 4,
    id: "recover",
    title: "4. Recover",
    subtitle: "Automated Execution",
    description: "Initiates recovery with 1-click execution: dispatches tailored correspondence, generates payment links, and tracks ledger settlement.",
    details: "Full audit trail, automated follow-ups, and reconciliation back to ERP.",
    icon: "ArrowUpRight",
  },
];

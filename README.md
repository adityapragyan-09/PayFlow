# PayFlow — AI-Powered Payment Recovery Automation System

> **Hackathon MVP Frontend** built for B2B enterprises to identify blocked invoices, understand root causes through customer communications, formulate high-conversion recovery plans, and automate collections.

---

## 🎯 The Core Concept

```
[ Unpaid Invoice ] ➔ [ AI Analysis ] ➔ [ Detect Blocker ] ➔ [ Recommend Action ] ➔ [ Recover Funds ]
```

Traditional collections rely on repetitive, generic dunning emails that ignore why a customer hasn't paid. **PayFlow** ingests and analyzes unstructured customer signals (AP email threads, billing portal rejections, dispute tickets, and ERP logs) to identify the specific blocker and generate targeted, relationship-preserving recovery workflows.

---

## 🚀 Quick Start

Run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

The application will be live at:
`http://localhost:5173/`

To test the production build:
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router 7**
- **Lucide Icons**
- **Zero backend dependencies** (isolated service layer ready for Express connection)

---

## 📱 Core Pages & Routing

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` or `/dashboard` | **Dashboard** | KPI metrics, 5-stage concept banner, high-attention Recovery Queue, and recent invoices |
| `/invoices` | **Invoices Directory** | Full ledger of receivables with multi-status and blocker category filters |
| `/invoices/:id` | **Invoice Details** | Detailed AI root-cause analysis, customer communication, generated response draft, 4-stage workflow pipeline, and activity timeline |
| `/recovery` | **Recovery Workflow** | Interactive 4-stage pipeline engine (Analyze ➔ Detect Blocker ➔ Recommend Action ➔ Recover) and stage queues |
| `/activity` | **Activity Audit Log** | Chronological stream of invoice ingestion, AI diagnostics, and dispatched recovery actions |

---

## 🧠 Blocker Categories Handled

1. **Cash Flow Issue** — Working capital constraints; generates structured split milestone payment arrangements under customer CFO disbursement limits.
2. **Invoice Dispute** — Unapproved line items or rate discrepancies; detects contractual caps and auto-drafts partial credit memos to unlock undisputed balances immediately.
3. **Missing Documentation** — AP portal rejections (W-9, COI, procurement PO); auto-matches and packages required compliance records.
4. **Approval Pending** — Bureaucratic or ERP routing backlog; triggers mobile-first 1-tap executive authorization links directly to signing officers.
5. **Payment Processing Issue** — ACH/Fedwire routing rejections (e.g. code R03); transmits authenticated banking credentials and voided check packages.
6. **Customer Clarification Required** — Milestone acceptance criteria confirmation; dispatches deliverable audit packages.

---

## 🏗️ Architecture & Clean Code

```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # StatusBadge, BlockerBadge, PriorityBadge, ConfidenceBar, ActivityFeed
│   │   ├── dashboard/      # KpiCard, PipelineBanner, RecoveryQueue
│   │   ├── invoices/       # InvoiceTable, CustomerMessageCard
│   │   ├── layout/         # AppLayout, Navbar, Sidebar
│   │   └── recovery/       # AiAnalysisCard, ResponseDraftCard, WorkflowPipeline, RecoveryActionModal
│   ├── data/
│   │   └── mockData.js     # Centralized, realistic B2B dataset
│   ├── pages/
│   │   ├── Activity.jsx
│   │   ├── Dashboard.jsx
│   │   ├── InvoiceDetails.jsx
│   │   ├── Invoices.jsx
│   │   └── RecoveryWorkflow.jsx
│   ├── services/
│   │   └── api.js          # Isolated service layer (invoiceService, recoveryService, analysisService, activityService)
│   ├── App.jsx             # React Router hierarchy
│   ├── main.jsx
│   └── index.css           # Modern Tailwind CSS theme
├── package.json
└── vite.config.js
```

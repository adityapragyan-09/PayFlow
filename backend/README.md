# PayFlow Backend — AI-Powered Payment Recovery Engine

This is the backend service for **PayFlow**, an AI-driven payment recovery automation system designed for hackathon MVP demonstration.

It automatically inspects delayed or unpaid invoices, analyzes customer communication threads using Google's **Gemini API**, categorizes payment bottlenecks, recommends high-leverage recovery actions, generates personalized customer responses, and logs the entire lifecycle in an audit-ready timeline.

---

## 1. Requirements

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **SQLite3**: (Bundled automatically via `sqlite3` driver)
- **Google Gemini API Key**: Free tier or paid key from [Google AI Studio](https://aistudio.google.com/)

---

## 2. Project Architecture

```text
backend/
├── src/
│   ├── config/
│   │   └── env.js                 # Centralized configuration & environment loader
│   ├── controllers/
│   │   ├── invoiceController.js   # Invoice CRUD, uploads, and communications
│   │   ├── recoveryController.js  # Recovery workflow execution
│   │   ├── timelineController.js  # Timeline event retrieval
│   │   └── dashboardController.js # Aggregated metrics and activity stream
│   ├── routes/
│   │   ├── invoiceRoutes.js       # /api/invoices route definitions
│   │   ├── dashboardRoutes.js     # /api/dashboard route definitions
│   │   └── index.js               # Master API router with healthcheck
│   ├── services/
│   │   ├── geminiService.js       # Gemini 1.5/2.0 Flash integration with JSON schema validation
│   │   ├── recoveryService.js     # Recovery action execution logic
│   │   └── timelineService.js     # Event logging helper
│   ├── database/
│   │   ├── db.js                  # SQLite database connection & Promise wrappers
│   │   ├── schema.js              # Table creation DDL & indexing
│   │   └── seed.js                # Realistic seed data script
│   ├── middleware/
│   │   └── errorHandler.js        # Global 404 & 500 error handlers
│   ├── utils/
│   │   ├── response.js            # Standardized API response formatters
│   │   └── logger.js              # Structured console logger
│   └── app.js                     # Express app setup & server entrypoint
├── data/
│   └── payflow.db                 # SQLite database file (created automatically)
├── test/
│   ├── test-endpoints.js          # Automated endpoint integration tests
│   └── test-gemini-validation.js  # AI schema validation unit tests
├── .env.example                   # Environment variable template
├── .env                           # Local environment variables
├── package.json                   # Project metadata & npm scripts
└── README.md                      # Backend documentation
```

---

## 3. Database Schema

The SQLite database (`data/payflow.db`) automatically initializes the following tables:

1. **`invoices`**:
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `invoice_number`: TEXT UNIQUE NOT NULL
   - `customer_name`: TEXT NOT NULL
   - `customer_email`: TEXT NOT NULL
   - `amount`: REAL NOT NULL
   - `currency`: TEXT NOT NULL (Default: `'INR'`)
   - `issue_date`: TEXT NOT NULL (YYYY-MM-DD)
   - `due_date`: TEXT NOT NULL (YYYY-MM-DD)
   - `status`: TEXT NOT NULL (`'pending'`, `'overdue'`, `'in_recovery'`, `'recovered'`, `'disputed'`)
   - `description`: TEXT
   - `created_at`: TEXT
   - `updated_at`: TEXT

2. **`communications`**:
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `invoice_id`: INTEGER (FK -> invoices.id)
   - `communication_type`: TEXT (`'email'`, `'sms'`, `'call_log'`, `'portal_message'`)
   - `sender`: TEXT (`'customer'`, `'finance_team'`, `'system'`)
   - `message`: TEXT
   - `timestamp`: TEXT

3. **`ai_analysis`**:
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `invoice_id`: INTEGER (FK -> invoices.id)
   - `reason_category`: TEXT (`'missing_po'`, `'approval_pending'`, `'invoice_error'`, `'amount_dispute'`, `'no_response'`, `'other'`)
   - `confidence`: REAL (0.0 to 1.0)
   - `explanation`: TEXT
   - `recommended_action`: TEXT
   - `generated_response`: TEXT
   - `analyzed_at`: TEXT

4. **`recovery_actions`**:
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `invoice_id`: INTEGER (FK -> invoices.id)
   - `action_type`: TEXT
   - `status`: TEXT (`'completed'`, `'in_progress'`, `'scheduled'`)
   - `message`: TEXT
   - `created_at`: TEXT

5. **`activity_timeline`**:
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `invoice_id`: INTEGER (FK -> invoices.id)
   - `event_type`: TEXT (`'invoice_created'`, `'communication_logged'`, `'ai_analysis'`, `'recovery_action_executed'`, `'status_changed'`)
   - `description`: TEXT
   - `metadata`: TEXT (JSON)
   - `created_at`: TEXT

---

## 4. Setup & Installation

### Step 1: Install Dependencies

From the `/backend` directory:

```bash
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your Google Gemini API key:

```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/payflow.db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
FRONTEND_URL=http://localhost:5173
```

> **Offline Demo Tip**: If you don't have a Gemini API key yet, add `ALLOW_MOCK_AI=true` to your `.env` file to enable the built-in heuristic fallback engine during testing.

### Step 3: Seed Demo Data

Run the database seeder to populate realistic invoices covering all 5 core payment bottlenecks:

```bash
npm run seed
```

This seeds:
1. **Missing PO**: Apex Global Logistics (`INV-2024-001`)
2. **Approval Pending**: Nexus Health Systems (`INV-2024-002`)
3. **Invoice Error**: Vanguard Tech Solutions (`INV-2024-003`)
4. **Amount Dispute**: Meridian Cloud Networks (`INV-2024-004`)
5. **No Response**: Hyperion Digital Media (`INV-2024-005`)
6. **In Recovery**: Quantum Dynamics (`INV-2024-006`)
7. **Recovered**: Orion Software Group (`INV-2024-007`)
8. **Normal Pending**: Starlight Media Works (`INV-2024-008`)

### Step 4: Start the Server

```bash
# Production / Normal Start
npm start

# Development mode with auto-reload (Node.js 18+)
npm run dev
```

The server will start at: `http://localhost:5000`

---

## 5. API Endpoints

### Summary Table

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/dashboard` | Aggregated metrics, reason distribution & recent activity |
| `GET` | `/api/invoices` | List invoices with status, search, and reason filters |
| `POST` | `/api/invoices/upload` | Create / upload an invoice |
| `GET` | `/api/invoices/:id` | Get invoice details, communications, AI analysis & timeline |
| `POST` | `/api/invoices/:id/analyze` | Run Gemini AI analysis & categorize payment issue |
| `POST` | `/api/invoices/:id/recover` | Execute payment recovery workflow |
| `GET` | `/api/invoices/:id/timeline` | Get chronological activity events |
| `POST` | `/api/invoices/:id/communications` | Add customer communication or note |
| `PATCH` | `/api/invoices/:id/status` | Update invoice status |

---

## 6. Example API Requests

### 1. Dashboard Metrics

```http
GET /api/dashboard
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_invoices": 8,
      "pending": 1,
      "overdue": 4,
      "recovered": 1,
      "in_recovery": 1,
      "disputed": 1,
      "outstanding_amount": 109150.00,
      "recovered_amount": 12000.00,
      "total_amount": 126550.00
    },
    "reason_distribution": {
      "missing_po": 3,
      "approval_pending": 1,
      "invoice_error": 1,
      "amount_dispute": 1,
      "no_response": 1
    },
    "recent_activity": [ ... ]
  }
}
```

---

### 2. List Invoices with Filters

```http
GET /api/invoices?status=overdue&search=Apex
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2024-001",
      "customer_name": "Apex Global Logistics Inc.",
      "customer_email": "ap-billing@apexlogistics-demo.com",
      "amount": 14500,
      "currency": "USD",
      "issue_date": "2024-02-01",
      "due_date": "2024-03-01",
      "status": "overdue",
      "description": "Quarterly enterprise logistics routing & fleet tracking software subscription.",
      "communications_count": 2,
      "latest_analysis": {
        "reason_category": "missing_po",
        "confidence": 0.94,
        "recommended_action": "request_po",
        "analyzed_at": "2024-03-06 14:35:00"
      },
      "recovery_status": {
        "action_type": "request_po",
        "status": "completed"
      }
    }
  ]
}
```

---

### 3. Upload / Create Invoice

```http
POST /api/invoices/upload
Content-Type: application/json

{
  "invoice_number": "INV-2024-099",
  "customer_name": "Acme Industrial Co",
  "customer_email": "accounts@acme-ind.com",
  "amount": 7500.00,
  "currency": "USD",
  "due_date": "2024-04-30",
  "description": "Industrial sensors telemetry license",
  "initial_communication": {
    "communication_type": "email",
    "sender": "customer",
    "message": "We have not received the PO approval from finance yet."
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "invoice_number": "INV-2024-099",
    "customer_name": "Acme Industrial Co",
    "customer_email": "accounts@acme-ind.com",
    "amount": 7500,
    "currency": "USD",
    "issue_date": "2024-04-01",
    "due_date": "2024-04-30",
    "status": "pending",
    "description": "Industrial sensors telemetry license"
  },
  "message": "Invoice uploaded successfully"
}
```

---

### 4. Run AI Analysis

```http
POST /api/invoices/1/analyze
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_id": 1,
    "reason_category": "missing_po",
    "confidence": 0.94,
    "explanation": "Accounts payable rejected the invoice because the mandatory Purchase Order number (PO-88392) is missing.",
    "recommended_action": "request_po",
    "generated_response": "Hi Apex Global Accounts Payable, thank you for clarifying. We have noted PO-88392 and will immediately reissue invoice INV-2024-001 with this PO number included so you can release the payment.",
    "analyzed_at": "2026-10-08 06:25:30"
  },
  "message": "Invoice analyzed successfully"
}
```

---

### 5. Trigger Recovery Workflow

```http
POST /api/invoices/1/recover
Content-Type: application/json

{
  "action_type": "request_po",
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": 1,
      "invoice_number": "INV-2024-001",
      "status": "in_recovery"
    },
    "recovery_action": {
      "id": 1,
      "invoice_id": 1,
      "action_type": "request_po",
      "status": "completed",
      "message": "Automated response sent requesting PO validation and confirming reissuance."
    }
  },
  "message": "Recovery action triggered successfully"
}
```

---

### 6. Get Activity Timeline

```http
GET /api/invoices/1/timeline
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoice_id": 1,
      "event_type": "invoice_created",
      "description": "Invoice INV-2024-001 created for Apex Global Logistics Inc. (USD 14500.00)",
      "metadata": { "amount": 14500, "currency": "USD", "status": "overdue" },
      "created_at": "2024-02-01 00:00:00"
    },
    {
      "id": 2,
      "invoice_id": 1,
      "event_type": "ai_analysis",
      "description": "AI identified payment issue: 'missing_po' (94% confidence)",
      "created_at": "2024-03-06 14:35:00"
    },
    {
      "id": 3,
      "invoice_id": 1,
      "event_type": "recovery_action_executed",
      "description": "Recovery action 'request_po' initiated (completed)",
      "created_at": "2024-03-07 10:00:00"
    }
  ]
}
```

---

## 7. Testing

Run all automated unit and integration tests:

```bash
# Run full test suite (API endpoints + Gemini validation)
npm test

# Run API endpoint integration tests
npm run test:api

# Run Gemini response validation tests
npm run test:validation
```

---

## 8. Frontend Integration Notes

- **CORS**: Configured to accept requests from `http://localhost:5173` (Vite) and `http://localhost:3000` (Next.js/React). You can customize this by setting `FRONTEND_URL` in `.env`.
- **Response Format**: All API responses follow standard JSON wrapping:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "error": "Human readable error message" }`

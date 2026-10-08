# PayFlow — AI-Powered Payment Recovery Automation System

PayFlow helps B2B teams find blocked invoices, understand why a customer has not paid, and run a targeted recovery workflow. This repository contains the complete application: a React frontend and an Express backend.

```
[ Unpaid Invoice ] → [ AI Analysis ] → [ Detect Blocker ] → [ Recommend Action ] → [ Recover Funds ]
```

## Repository layout

```text
PayFlow/
├── frontend/          React + Vite client
├── backend/           Express + SQLite + Gemini API
├── .gitignore
└── README.md
```

Each app keeps its own `package.json`. Detailed docs live in [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md).

## Quick start

Use two terminals.

**Backend** (http://localhost:5000):

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Set `GEMINI_API_KEY` in `backend/.env`. For an offline demo without a key, set `ALLOW_MOCK_AI=true`.

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

`frontend/.env.example` sets:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The frontend calls the backend over HTTP. Do not append `/api` to the base URL.

## Production build

```bash
cd frontend
npm run build
npm run preview
```

## Tests

```bash
cd backend
npm test
```

```bash
cd frontend
npm run lint
npm run build
```

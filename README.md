# Nexgile-TravAI — Enterprise Travel & Hospitality Intelligence Platform

## Architectural Baseline
* **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PostgreSQL 15+.
* **Frontend:** React.js, JavaScript only (`.js` and `.jsx` only; strictly zero TypeScript).
* **Primary Database:** PostgreSQL 15+ (sole authoritative transactional source of truth).
* **AI Governance:** Google Gemini models integrated server-side through private Python endpoints.

---

## Quick Start & Local Execution

### 1. Frontend (React JavaScript)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Running on http://localhost:3000
```

### 2. Backend (FastAPI Python)
```bash
cd backend

# Create & activate Python 3.11 virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -e ".[dev]"

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
# API docs available at http://localhost:8000/docs
```

### 3. Testing
```bash
# Backend pytest suite
cd backend
pytest

# Frontend build verification
npm run build
```

---

## Repository Structure
```text
nexgile-travai/
│
├── frontend/                     # Pure JavaScript React application
│   ├── src/
│   │   ├── app/                  # Application root & provider bindings
│   │   ├── api/                  # Centralized HTTP client & endpoints
│   │   ├── components/           # UI kit & common components
│   │   ├── constants/            # Routes, roles, permissions
│   │   ├── hooks/                # useAuth, useTenant, useNotification
│   │   ├── layouts/              # RootLayout, AuthLayout
│   │   ├── pages/                # Foundation views & dashboards
│   │   ├── routes/               # Navigation & role-aware route guards
│   │   ├── store/                # Auth & notification context stores
│   │   └── main.jsx              # React JSX entry point
│   └── ...
│
├── backend/                      # Canonical Python FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── core/                 # Config, Database, Security, Logging, Exceptions
│   │   ├── api/                  # Versioned API routes (/api/v1)
│   │   ├── db/                   # Base models, repositories, seed fixtures
│   │   ├── infrastructure/       # Outbox, Idempotency, Background workers, Event bus
│   │   └── modules/              # 20 Domain modules (Modular Monolith)
│   ├── alembic/                  # Database migration management
│   ├── tests/                    # Unit, integration, security test suites
│   └── pyproject.toml
│
├── docs/                         # Architecture, Security, Decisions, Implementation
├── .env.example                  # Environment configuration template
└── README.md
```

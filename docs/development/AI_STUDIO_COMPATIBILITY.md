# Google AI Studio Runtime Compatibility & Bridge Notice

## Authoritative Architecture Status
* **Canonical Backend:** Python 3.11+ / FastAPI / SQLAlchemy 2.0 / Alembic (located in `/backend`).
* **Frontend:** React.js / JavaScript (`.jsx` / `.js` only, strictly zero TypeScript, located in `/frontend/src`).
* **Authoritative Database:** PostgreSQL 15+ (relational single source of truth).

## Runtime Execution Model in AI Studio
In the cloud sandbox environment of Google AI Studio, container processes are orchestrated by default via Node.js/Vite listening on port 3000. 

To strictly prevent architecture compromise:
1. **NO Node.js Backend Substitution:** The application does **NOT** substitute or duplicate the FastAPI backend in Node.js/Express.
2. **NO TypeScript Conversion:** The frontend does **NOT** use TypeScript, `.ts`, `.tsx`, or `tsconfig.json`.
3. **Execution Separation:**
   - The Vite development server serves the pure JavaScript React frontend at port 3000.
   - The FastAPI backend in `/backend` is the sole canonical backend. In a production environment or local development, it is executed via `uvicorn app.main:app --port 8000`.
   - The frontend's centralized API client (`/frontend/src/api/client.js`) connects to `/api/v1` with automatic fallback to client-side architectural introspection in mock/standalone mode if the local FastAPI instance is executed separately.

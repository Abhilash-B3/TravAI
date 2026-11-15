# Nexgile-TravAI: AI Systems Governance & Constitution

## 1. Core Principles of AI Operations
1. **Human-in-the-Loop Supremacy**: AI models propose; authorized humans decide. AI-generated dynamic pricing, room allocation changes, policy waivers, and financial adjustments must never bypass approval matrices or execute irreversible operational actions silently.
2. **Deterministic Guardrails**: All AI recommendations (e.g., dynamic rate calculation) are bounded by deterministic code constraints (e.g., hard minimum floor price, absolute ceiling price, maximum daily percentage swing).
3. **Explainability & Auditing**: Every AI inference must output structured reasoning, key contributing factors (e.g., local event detected, booking pace +14%), confidence scores (0.0 to 1.0), and model version tags.
4. **Data Isolation & Privacy**: Proprietary property revenue data, corporate negotiated rates, and guest PII must never leak across tenant boundaries or be sent to unauthorized third-party endpoints.

## 2. Gemini Integration Pattern
* Server-side only via `@google/genai` TypeScript SDK.
* Strict JSON schema validation on all model responses (`responseMimeType: "application/json"` with schema definitions).
* Graceful fallback logic: if the AI service times out, experiences rate limiting, or returns low confidence, the application automatically reverts to rule-based deterministic heuristics (e.g., historical average rate, standard policy guidelines).

## 3. Override Tracking Ledger
* Every manual override of an AI recommendation creates an immutable record in `ai_overrides` containing:
  * Recommendation ID and original suggested values.
  * Human user UUID, role, and explicit override reason text.
  * Applied override value.
  * Post-event variance tracking for model performance feedback.

# Nexgile-TravAI: Integration & Adapter Architecture

## 1. Enterprise Adapter Pattern
External systems vary widely in protocol (SOAP, OTA XML, REST, Webhooks, ISO 8583). Nexgile-TravAI isolates core business logic from third-party vendor interfaces using a standardized **Provider Adapter Interface**.

```
+------------------------+
|  Internal Domain Core  |
+------------------------+
            |
            v
+------------------------+
| Base Integration Adapter|
| - authenticate()       |
| - pullInventory()      |
| - pushRates()          |
| - bookReservation()    |
| - cancelReservation()  |
+------------------------+
      |        |        |
      v        v        v
  [Expedia] [Amadeus] [Stripe]
   Adapter   Adapter   Adapter
```

## 2. Channel & Supplier Scalability (20,000+ Target)
* **Metadata-Driven Channel Registry**: Channels are represented as structured registry entities with endpoint descriptors, rate mapping schemas, currency conversion profiles, and throttle policies.
* **Idempotent Sync Queues**: Inventory pushes and reservation pulls are processed as idempotent jobs with exponential backoff and dead-letter queues (DLQ) for failed dispatches.
* **Rate Parity Sentinel**: Automated monitors verify parity across connected OTAs and metasearch engines, flagging unauthorized rate discrepancies.

## 3. Development vs Production Isolation
* All integration tests and local development environments use **Mock Adapter Implementations** that simulate realistic latencies, payloads, and network failures.
* Mock adapters are strictly segregated and clearly labelled; no simulated data is ever presented as a live external integration.

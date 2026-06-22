# PlanMyVivah — Customer Flow Implementation Roadmap

This document outlines the phase-wise rollout for the customer search, date checking, package customization, and booking flows. It maps the technical execution layers to specific BMad agents to ensure modular and verified development.

---

## 🗺️ Phases of Execution

### Phase 1: Database & Model Check (Backend Verification)
*   **Goal:** Audit models for correctness and establish required mock datasets.
*   **How it works:**
    - Verify that [BaseListing](file:///d:/PlanMyvivah/celebrationplatform/apps/listings/models/base_listing.py) and [Venue](file:///d:/PlanMyvivah/celebrationplatform/apps/venues/models/venue.py) relationships are fully configured.
    - Check that [Booking](file:///d:/PlanMyvivah/celebrationplatform/apps/bookings/models/booking.py) tables have correct ForeignKeys for packages (`catering_package`, `decoration_package`, `dj_package`).
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 2: Availability & Date Validation APIs (Backend)
*   **Goal:** Build a robust, real-time date verification service.
*   **How it works:**
    - Expose a clean GET endpoint: `GET /api/v1/bookings/venue-availabilitys/check/?venue_id=X&date=YYYY-MM-DD`.
    - Implement a 3-tier check:
      1. Is the date range inside [BlockedDate](file:///d:/PlanMyvivah/celebrationplatform/apps/bookings/models/blocked_date.py)?
      2. Is there a manual override block in [VenueAvailability](file:///d:/PlanMyvivah/celebrationplatform/apps/bookings/models/venue_availability.py)?
      3. Is there a `confirmed` or `pending` reservation in the [Booking](file:///d:/PlanMyvivah/celebrationplatform/apps/bookings/models/booking.py) table?
    - Return a JSON response: `{"is_available": true/false}`.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 3: Bundled Pricing & Policy Engine (Backend)
*   **Goal:** Enable policies mapping (e.g. In-house only decoration) and live price aggregation.
*   **How it works:**
    - When querying a venue's detail API (`GET /api/v1/venues/venues/{id}/`), include:
      - Related vendor packages ([CateringPackage](file:///d:/PlanMyvivah/celebrationplatform/apps/catering/models/catering_package.py), [DecorationPackage](file:///d:/PlanMyvivah/celebrationplatform/apps/decorations/models/decoration.py)).
      - Policy flags (`decoration_policy`, `catering_policy`, `dj_policy`).
    - Create a price estimation calculator utility on the backend.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 4: Dynamic Search & Catalog Pages (Frontend Integration)
*   **Goal:** Replace frontend mock datasets with real backend queries.
*   **How it works:**
    - Hook up `VenuesPage` ([venues/page.tsx](file:///d:/PlanMyvivah/frontend/src/app/venues/page.tsx)) to query the `/api/v1/venues/venues/` endpoint.
    - Wire search parameters (city, capacity, pricing) to React-Query parameters.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 5: Package Customizer & Booking Widget (Frontend UI)
*   **Goal:** Create a high-fidelity detail view where users configure their wedding package.
*   **How it works:**
    - In [venues/[id]/page.tsx](file:///d:/PlanMyvivah/frontend/src/app/venues/[id]/page.tsx):
      - Build the Calendar Date Picker showing available vs. blocked states dynamically based on the checks built in Phase 2.
      - Implement the **Add-on Customizer Selection Tabs** (Catering, Decoration, DJ Tiers) enforcing the venue's policy rules.
      - Auto-calculate the real-time invoice and advance/balance payment split.
*   **Responsible Agent:** `🎨 Sally` (UX Designer) for interaction design; `💻 Amelia` (Senior Software Engineer) for code integration.
*   **BMad Commands:** `/bmad-agent-ux-designer` (for UI review) & `/bmad-agent-dev` (for code).

---

### Phase 6: End-to-End Flow Testing (Quality Gate)
*   **Goal:** Verify a customer can search, choose packages, verify dates, and check out successfully without errors.
*   **How it works:**
    - Write end-to-end automated tests simulating a customer booking journey.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

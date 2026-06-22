# PlanMyVivah — Customer Flow Implementation Roadmap (Gated Pricing Version)

This document outlines the phase-wise rollout for the gated customer booking flow. It maps the technical execution layers to specific BMad agents to ensure modular and verified development.

---

## 🗺️ Phases of Execution

### Phase 1: Database Schema, Models & OTP Service Setup (Backend)
*   **Goal:** Setup backend models and service layers for lead-gated inquiries and OTP generation.
*   **Scope of Work:**
    - Verify that [BaseListing](file:///d:/PlanMyvivah/celebrationplatform/apps/listings/models/base_listing.py) and [Venue](file:///d:/PlanMyvivah/celebrationplatform/apps/venues/models/venue.py) relationships are fully configured.
    - Check that [Booking](file:///d:/PlanMyvivah/celebrationplatform/apps/bookings/models/booking.py) tables have correct ForeignKeys for packages (`catering_package`, `decoration_package`).
    - Create `OTPVerification` model in the backend to store `phone_number`, `otp_hash`, `expires_at`, and `is_verified` state.
    - Implement a utility service wrapper for sending OTP codes via SMS/WhatsApp (with mock fallback for development).
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer) & `📋 John` (Product Manager)
*   **BMad Command:** `/bmad-agent-dev` to write the model and mock integration service.

---

### Phase 2: Authentication & Gated Pricing API (Backend)
*   **Goal:** Expose endpoints for sending/verifying OTP and the gated pricing calculation controller.
*   **Scope of Work:**
    - Expose `POST /api/v1/auth/otp/send/`: Generates 4-digit code and dispatches SMS/WhatsApp.
    - Expose `POST /api/v1/auth/otp/verify/`: Validates code, marks OTP as verified, and signs a User Session/JWT token.
    - Expose gated endpoint `GET /api/v1/venues/{id}/pricing-breakdown/`:
        - Requires JWT Authentication.
        - If authenticated, calculates and returns the dynamic price breakdown (Rent + Catering + Decor + Royalty + GST).
        - If unauthenticated, returns HTTP 401 Unauthorized or structured metadata with starting prices only (`{"gated": true, "starting_veg_plate": X, "starting_rent": Y}`).
    - Expose `POST /api/v1/bookings/inquiries/`: Automatically creates an inquiry lead when the user completes verification.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 3: Frontend Gated Configurator & Verification Modal (Frontend UI)
*   **Goal:** Build the lock overlay on pricing cards and the two-step verification modal.
*   **Scope of Work:**
    - In [venues/[id]/page.tsx](file:///d:/PlanMyvivah/frontend/src/app/venues/[id]/page.tsx):
        - Integrate local state check for `isVerified` (checking browser cookie/JWT).
        - If `isVerified` is false, apply a CSS blur/overlay mask onto the pricing breakdown widget.
        - Create the **"Unlock Quote" Modal Component**:
            - **Step 1 Form**: Collect Name, Phone Number, Guest Count, and Event Date.
            - **Step 2 OTP**: Render verification input grid.
        - Wire the form submit handlers to call backend OTP endpoints via React-Query.
*   **Responsible Agent:** `🎨 Sally` (UX Designer) for the flow verification and transitions; `💻 Amelia` (Developer) for code.
*   **BMad Command:** `/bmad-agent-ux-designer` to design mock layouts, then `/bmad-agent-dev` to implement.

---

### Phase 4: Dynamic Calculator & Comparison Card Integration (Frontend UI)
*   **Goal:** Render the dynamic 3-card layout and recalculate prices on customization changes.
*   **Scope of Work:**
    - Once user session state transitions to `isVerified: true`, fetch detailed pricing from `/api/v1/venues/{id}/pricing-breakdown/`.
    - Wire interactive inputs (toggles for In-house vs. External Decor, and selected themes) to the price calculator.
    - Render the side-by-side **3 Pricing Cards** comparison layout (Venue Only vs. Venue + In-house vs. Venue + External Decor).
    - Update the primary widget CTA to `"Request Site Visit"` (high intent) which submits the inquiry.
*   **Responsible Agent:** `💻 Amelia` (Senior Software Engineer)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 5: Notification Routing & Booking CRM Workflow (Workflow Integration)
*   **Goal:** Alert venue managers and sales coordinators when inquiries are submitted.
*   **Scope of Work:**
    - Hook inquiry creation hooks in Django/FastAPI backend.
    - Dispatch automated WhatsApp alerts to the registered Venue Manager with the details: *"New Lead for [Date]! [Name], [Guests] guests. View Quote details on dashboard."*
    - Setup email alerts for internal PlanMyVivah sales coordinators.
*   **Responsible Agent:** `💻 Amelia` (Developer) & `📋 John` (Product Manager)
*   **BMad Command:** `/bmad-agent-dev`

---

### Phase 6: E2E Integration Testing & Quality Gate (Testing)
*   **Goal:** Validate that users can search, customize, complete the OTP flow, see pricing, and submit booking requests successfully.
*   **Scope of Work:**
    - Write end-to-end integration tests using Playwright/Cypress:
        1. Access listing -> navigate to detail -> verify pricing is locked.
        2. Enter invalid phone/OTP -> check validation alerts.
        3. Enter correct OTP -> verify modal closes, pricing calculations are revealed, and interactive controls update totals.
        4. Click "Request Site Visit" -> verify database contains lead with all customized selections.
*   **Responsible Agent:** `🍵 Murat` (QA Test Architect)
*   **BMad Command:** `/bmad-tea`

---

## 🤖 Recommended Agent Instructions & Prompts

Use these exact commands when you want to instruct our AI agents to build these phases.

### 1. Backend Setup (Phases 1 & 2)
```bash
/bmad-agent-dev Implement the OTPVerification model and service layer. Then expose the endpoints for POST /api/v1/auth/otp/send/ and /api/v1/auth/otp/verify/. Ensure the venue detail price calculation API is gated behind authenticated sessions.
```

### 2. UI Layout Review (Phase 3 UX)
```bash
/bmad-agent-ux-designer Review the mock layout for the 'Unlock Pricing' Modal on mobile. Verify that the two-step flow (Form -> OTP) minimizes friction for Indian wedding planners.
```

### 3. Frontend Implementation (Phases 3 & 4)
```bash
/bmad-agent-dev Build the interactive pricing configurator on the venue detail page. Implement the CSS blur lock overlay for anonymous users, trigger the OTP verification modal, and render the dynamic 3-card pricing breakdown upon verification.
```

### 4. Integration Test Design (Phase 6)
```bash
/bmad-tea Create the acceptance test suite for the customer gated pricing flow. Simulate verification steps, dynamic pricing calculations, and final site-visit request submission.
```

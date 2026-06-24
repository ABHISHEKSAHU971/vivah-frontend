# Implementation Plan — Phase 7: Collaborative Multi-Vendor Budget Planner & External Package Customizer

This feature introduces a dynamic, multi-vendor quote builder. Verified users can select external catering and decoration packages (with themes and tiers) and dynamically calculate combined pricing breakdown estimates. Anonymous users are lead-gated to capture their credentials before accessing these options.

---

## User Review Required

> [!IMPORTANT]
> **Vendor Location & Verification Constraints**:
> * We will **only show vendors located in the same city as the venue** (`vendor__city = venue.city`).
> * We will **only show approved/verified vendors** (`vendor__is_approved = True`).

> [!IMPORTANT]
> **Date-Based Availability Check**:
> * A vendor is considered **unavailable** for a selected date if they already have an active (`confirmed` or `pending`) booking on that date. 
> * We will filter out booked vendors from the dropdown listings based on the selected `event_date`.

---

## Proposed Changes

### 1. Backend API Extensions (Django)

#### [NEW] [endpoints.py] (Catering & Decor Availability Lists)
* Create endpoints or expand `CateringPackageViewSet` and `DecorationPackageViewSet` in the backend:
  * Expose `GET /api/v1/catering/catering-packages/available/?venue_id=X&date=YYYY-MM-DD`
  * Expose `GET /api/v1/decorations/decoration-packages/available/?venue_id=X&date=YYYY-MM-DD`
  * **Filtering Logic**:
    1. Retrieve the `Venue` by `venue_id` to get its `city`.
    2. Query all approved packages (`vendor__is_approved=True`) in that city (`vendor__city=venue.city`).
    3. Exclude packages where the vendor already has a booking on `date` with status `confirmed` or `pending`.

#### [MODIFY] [venue_inquiry.py](file:///c:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/venues/models/venue_inquiry.py)
* Add optional foreign keys `catering_package` and `decoration_package` to the `VenueInquiry` model.
* Generate and run database migrations.

#### [MODIFY] [serializers.py](file:///c:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/venues/serializers/__init__.py)
* Expose `catering_package` and `decoration_package` inside the `VenueInquirySerializer` fields list.

---

### 2. Frontend Layout & Interactive Controls (Next.js)

#### [MODIFY] [page.tsx](file:///c:/Users/91722/Downloads/PlanMyVivah/vivah-frontend/src/app/venues/[id]/page.tsx)
* **Gated State Handling**:
  * If `isVerified` is false and the user clicks the "External Vendor" tab or dropdown, trigger the "Unlock Quote" Modal.
  * Step 1 Form collects: Name, Phone, Guest Count, and Event Date.
* **Dynamic Selectors (Verified Session)**:
  * When `isVerified` is true and "External Vendor" is selected:
    * Fetch available external caterers: `GET /api/v1/catering/catering-packages/available/?venue_id={id}&date={eventDate}`.
    * Fetch available external decorators: `GET /api/v1/decorations/decoration-packages/available/?venue_id={id}&date={eventDate}`.
    * Render selectors for **External Caterer** (brand name + plate pricing) and **External Decorator** (brand name + selected tier).
* **Pricing Calculator Integration**:
  * Update `useQuery` for `/api/v1/venues/{id}/pricing-breakdown/` to pass selected packages.
  * Re-run calculations in real-time when customizers change.
* **Inquiry Submission**:
  * Pass selected external catering and decoration package IDs to the bookings inquiry payload.

---

## Verification Plan

### Automated Tests
* Create E2E Playwright integration tests:
  1. Complete OTP verification.
  2. Set event date `2026-11-20`.
  3. Select external caterer and decorator dropdown values.
  4. Assert pricing updates correctly.
  5. Check that bookings inquiry POST submits package IDs and successfully creates inquiry.

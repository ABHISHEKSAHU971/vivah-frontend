# Catering Management Module - Detailed Implementation Plan

## Project Goal
Build a scalable Catering Management System for PlanMyVivah where catering capabilities are fully integrated into the **Vendor Listing** flow. Vendors can manage their brand profile, configure multiple branches, define a master menu library, and build package tiers (Silver, Gold, Platinum) directly within their Listing. Customers can browse, compare, customize menus, and submit booking requests with live quote calculations.

---

## Phase 1 — Requirement Analysis & System Design (DONE)
*   **Tasks:**
    *   Map core catering workflows (Jain, Veg, Spicy dietary settings, plate-wise counts).
    *   Formulate Entity-Relationship (ER) models and PostgreSQL database schema.
    *   Draft REST API contracts and frontend page wireframe briefs.
*   **Deliverables:** [catering_system_design.md](file:///c:/Users/91722/.gemini/antigravity-ide/brain/50503b12-75fa-4a4e-9415-c1c1fee2fa7a/catering_system_design.md)

---

## Phase 2 — Backend Foundation & Models (DONE)
*   **Tasks:**
    *   Create `CateringBusiness` model (OneToOne to `VendorProfile`) and `Branch` model.
    *   Extend `CateringMenuItem` with extra tags (`is_spicy`, `addon_price`).
    *   Register all models with custom layouts in Django Admin.
    *   Generate and apply database migrations.
    *   Expose models through serialization fields.
*   **Deliverables:** Core Django models, migrations, serializers, and admin layouts.

---

## Phase 3 — Listing Form Integration (Catering Configurator) (DONE)
**Goal:** Integrate the catering profile, branch addresses, master menu library, and packages setup directly into the **Vendor Listing Wizard** (`add/form/page.tsx` & edit pages).

### A. Frontend Listing Form Wizard (`add/form/page.tsx`)
Modify the multi-step listing editor wizard. When a vendor selects the **Caterer** type, dynamically show steps to configure the catering business:
*   **Step 1: Listing Details:** Brand Name, General Description, Base City, Address, and Logo.
*   **Step 2: Business Profile & Branches:** Select Cuisines (Rajasthani, Gujarati, South Indian, Multi-Cuisine), set Minimum Guest limits, and list multiple branches with address and phone fields.
*   **Step 3: Master Menu Library:** Add/manage food items with fields: Name, Course (Starter, Main, Dessert, Welcome Drink), dietary checkboxes (Veg, Jain, Spicy), and premium Add-on price.
*   **Step 4: Package Tiers (Plans):** Build packages (e.g. Silver, Gold, Platinum) with plate pricing, minimum plates limits, and choose standard/allowed items from the menu library.

### B. Backend Listing REST Endpoints
*   Modify `GET /api/v1/listings/` and `POST /api/v1/listings/` serializers to automatically parse and save the nested catering payload (Profile, Branches, Menu items, Packages) transactionally when creating or editing a listing of type `'caterer'`.

---

## Phase 4 — Master Menu Library Management (DONE)
**Goal:** Provide full CRUD interface inside the Vendor Listing dashboard to manage the master food library.
*   **Tasks:**
    *   Develop a menu table within the listing page listing all cataloged dishes.
    *   Provide inline additions and edits with validation (e.g., addon price cannot be negative).
    *   Support CSV/Sheet upload for quick bulk import of dishes.

---

## Phase 5 — Dynamic Package Builder & Pricing Engine
**Goal:** Configure package constraints (e.g. Gold Platter: Choose max 4 Starters, 2 Seasonal Veg, 4 Welcome Drinks) and calculate live quotes.
*   **Tasks:**
    *   **New Database Table (Master Food Item):** Create a separate `MasterFoodItem` table (with ID, name, standard course category, veg/jain/spicy flags, and standard description) to allow a shared database of dishes accessible across all caterers.
    *   **Package Constraints & Quantity Selectors:** Implement Plan Sections with select constraints (`min_selectable`, `max_selectable`) and allow defining the number of allowable choices for each category (e.g., choose exactly 4 welcome drinks, 2 seasonal veg, etc.) directly in the package plan options.
    *   **Backend Pricing Engine Surcharges:** Incorporate calculation algorithms inside the backend pricing engine:
        $$\text{Subtotal} = (\text{Base Price/Plate} + \text{Add-ons}) \times \text{Guest Count}$$
    *   Add premium weekend or festival surcharges.

---

## Phase 6 — Customer Discovery & Comparison
**Goal:** Expose catering packages on the customer-facing discovery details page.
*   **Tasks:**
    *   Render packages in a comparison table (Silver vs Gold vs Diamond).
    *   Implement interactive food checkboxes where visitors choose their dishes.
    *   Display live price breakdown updates including Platform Royalty fees (5%) and GST (18%).

---

## Phase 7 — Interactive Catering Booking & Check availability
**Goal:** Connect customized packages to checkout and save inquiries.
*   **Tasks:**
    *   Gate booking checkout with OTP verification.
    *   Save selected customized menu items to the `CateringBooking` database.
    *   Verify vendor date availability before allowing checkouts.

---

## Verification Plan

### Automated Tests
*   Backend REST tests:
    ```bash
    python manage.py test apps.catering
    ```
*   Playwright E2E tests:
    ```bash
    npx playwright test e2e/catering_listing.spec.ts
    ```

### Manual Verification
*   Create a caterer vendor listing from the dashboard, configure branches and items, and verify it updates the customer catering catalogue search.

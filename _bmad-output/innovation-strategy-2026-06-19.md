# Innovation Strategy: PlanMyVivah

**Date:** 2026-06-19
**Strategist:** Asus
**Strategic Focus:** Vendor Onboarding & Core Flow Implementation

---

## 🎯 Strategic Context

### Current Situation

PlanMyVivah's vendor authentication, dashboard layout, and profile management are partially implemented, but they currently rely on mock structures (such as static booking inquiries and placeholders for verification states) and suffer from auth interceptor conflicts (e.g. redirect loops when expired tokens are present). The system needs to establish a fully integrated, verified onboarding and registration pipeline to enable real-world vendors to join the marketplace.

### Strategic Challenge

The primary challenge is to construct a secure, high-conversion onboarding and profile completion workflow. It must cleanly guide a vendor from initial OTP registration through complete business details submission (GSTIN, description, cities, type) and logo upload, transitioning them into an administrative approval queue. All this must happen with proper frontend-to-backend API integration, removing the reliance on mock data and preventing authentication-related page lockouts.

---

## 📊 MARKET ANALYSIS

### Market Landscape

The Indian wedding vendor marketplace (catering, venues, DJs, decor) is highly fragmented and characterized by low digital adoption but high dependence on referral networks. Traditional platforms function as basic directories (e.g., WedMeGood, WeddingWire), charging heavy subscription fees for lead placement without facilitating the transaction or project execution. 

### Competitive Dynamics

1. **Incumbents (WedMeGood, WeddingWire):** High brand equity, but suffer from lead dilution (sending the same lead to 10+ vendors) and manual, friction-filled bidding.
2. **Local Directories (JustDial, Sulekha):** Low-intent leads, high spam, zero wedding-specific workflow support.
3. **PlanMyVivah Opportunity:** Position as a "Collaboration Marketplace" rather than a mere advertisement directory. Vendors are integrated into the customer’s live planning canvas (AI planner).

### Market Opportunities

* **Frictionless Sign-Up:** A 10-second mobile OTP sign-up beats long email/password registration forms.
* **Collaboration-Driven Retention:** Getting vendors to interact with the customer's planner tasks locks them into the ecosystem, making them less likely to churn compared to purely listing sites.

### Critical Insights

* **The Lead Dilution Trap:** Wedding vendors are fatigued by paying for leads that never convert. Providing a workflow tool (planner) increases the value of every single contact.
* **Micro-Trust Verification:** Integrating quick validation checks (like GSTIN match) early in the onboarding flow prevents bad actors while building trust for couples.

---

## 💼 BUSINESS MODEL ANALYSIS

### Current Business Model

* **Type:** Two-Sided Marketplace (Couples and Wedding Vendors).
* **Value Creation:** Matching high-intent wedding couples with localized, verified service providers based on guest counts, budgets, and dates.
* **Monetization:** Currently exploring transaction commissions, premium listing placement, and software-as-a-service (SaaS) utility upgrades for vendors.

### Value Proposition Assessment

* **For Couples:** Discovery of trusted, vetted vendors with clear pricing and automated fitment checking (budget and guest capacity).
* **For Vendors:** A professional dashboard to showcase portfolios, collect verified reviews, receive high-intent local inquiries, and use collaboration tools to plan events with clients.

### Revenue and Cost Structure

* **Revenue Streams:** 
  1. Lead bidding credits.
  2. Transaction processing commission (escrow booking).
  3. Premium visibility subscription.
* **Cost Drivers:**
  1. SMS gateway charges (OTP validation).
  2. Cloud hosting and secure portfolio storage.
  3. Administrative overhead for manual verification.

### Business Model Weaknesses

* **High Onboarding Friction:** If registration requires too much business documentation upfront (e.g. tax documents, bank details), abandonment rates skyrocket.
* **Lead Disintermediation:** Vendors might attempt to communicate off-platform to avoid fees once a connection is made. Providing transaction value (e.g. plan generation, task management) keeps them engaged on-platform.

---

## ⚡ DISRUPTION OPPORTUNITIES

### Disruption Vectors

* **Work-Flow Integration:** Disrupt listing directories by offering a vendor-facing management console where they can generate live event plans, brief staff, and coordinate layouts directly with couples.
* **Progressive Verification:** Moving away from binary "approved / not-approved" states to progressive trust tiers (e.g. basic listings for new sign-ups, "GSTIN Verified" and "Admin Approved" badges for top tiers).

### Unmet Customer Jobs

* **"Brief my execution crew:"** Vendors struggle to coordinate setups on the event day. Generating structured lists (mandap setup, catering launch) solves a major execution pain point.
* **"Reduce billing follow-ups:"** Automated payment reminders and payment schedule tracking linked to bookings.

### Technology Enablers

* **Automated GSTIN Validation APIs:** Instantly verify business authenticity upon onboarding, reducing manual review queues by 80%.
* **Generative Event Planner:** AI-assisted checklist generation based on event details (guest count, style preferences).

### Strategic White Space

The "Transaction and Planning" layer of Indian weddings remains largely offline. Building a platform that manages the post-booking coordination (not just the pre-booking search) creates a highly defensible moat.

---

## 🚀 INNOVATION OPPORTUNITIES

### Innovation Initiatives

* **Progressive Trust-Based Access:** Allow immediate access to the dashboard upon registration, but block contact details and bidding until verification is complete.
* **AI-Powered Event Spec Generator:** A tool allowing vendors to output complete operational lists (timing, staff count, materials) in one click to share with clients.

### Business Model Innovation

* **Zero-Commission Lead Bidding:** Charge vendors based on successful bookings or a simple monthly SaaS subscription for coordination features, rather than transaction commission, aligning incentives.

### Value Chain Opportunities

* Directly integrate with wholesale supply chains (decor materials, ingredients) to offer business discounts to verified partner vendors.

### Partnership and Ecosystem Plays

* Partner with local municipal corporations or wedding chambers to streamline venue licensing and compliance checking for on-platform vendors.

---

## 🎲 STRATEGIC OPTIONS

### Option A: Open Platform (Self-Serve, Minimal Gatekeeping)

Focus on rapid vendor scale by allowing immediate registration and profile activation without manual approval. Verification is a paid add-on badge.

* **Pros:** Exponential growth in directory listings; low operational overhead.
* **Cons:** High risk of spam, fraudulent listings, and poor customer experiences.

### Option B: High-Barrier Exclusive Registry (Strict Manual Approval)

Require verified tax documentation, reference calls, and physical audits before *any* profile activation.

* **Pros:** Pristine platform quality and maximum trust.
* **Cons:** Extremely slow scale; high operational bottleneck; high registration abandonment.

### Option C: Progressive Trust & Verification (Recommended)

Allow instant signup via OTP and onboarding form completion. Provide immediate restricted dashboard access (configure portfolio, set packages, view lead list) with a prominent "Verification Pending" status. Unlocking contact details, bidding on live leads, and collecting payouts are gated behind automated GSTIN verification or administrative sign-off.

* **Pros:** Zero registration friction; maintains platform security; keeps vendors engaged while they wait for approval.
* **Cons:** Requires complex frontend and backend state management for restricted modes.

---

## 🏆 RECOMMENDED STRATEGY

### Strategic Direction

Implement **Option C: Progressive Trust & Verification**. We will design a seamless vendor flow that prioritizes speed of sign-up while enforcing a robust, two-step backend verification process. This will keep onboarding drop-offs low while protecting platform integrity.

### Key Hypotheses to Validate

* Can vendors complete the onboarding wizard within 3 minutes?
* Does offering restricted dashboard access during the pending approval state increase retention compared to showing a static lock screen?
* Are vendors willing to input their GSTIN for instant validation?

### Critical Success Factors

* **Zero Page Lockouts:** Ensure request/response interceptors never throw users into redirect loops on auth routes.
* **Intuitive Wizard UI:** Step-by-step onboarding that handles optional fields gracefully.
* **Responsive State Indicators:** Clear visual feedback to vendors regarding their approval state.

---

## 📋 EXECUTION ROADMAP

### Phase 1: Core Authentication & Secure Handshake

* Fix request interceptor to exclude public auth routes from attaching Authorization headers, preventing 401 redirect loops.
* Standardize phone number normalization to E.164 (`+91XXXXXXXXXX`) on both frontend input and backend Django serializer.
* Sync JWT token persistence between localStorage and cookies to protect layouts.

### Phase 2: Progressive Onboarding & Profile Verification

* Build the step-by-step onboarding wizard (/vendor/onboarding) supporting business name, vendor category, city, address, GSTIN, and description.
* Integrate `/auth/vendor/logo/` upload endpoint supporting image format and size checks (max 2MB, JPG/PNG/WebP).
* Connect onboarding form submission to the `/auth/vendor/onboard/` API endpoint to persist details.

### Phase 3: Administrative Approval Loop & Restricted States

* Implement conditional layouts in the vendor console based on the `is_approved` status returned from `/auth/vendor/status/`.
* Show "Pending Verification" banners and lock lead bidding/details.
* Set up admin panel actions to approve/reject vendors with reason logs, updating profiles.

---

## 📈 SUCCESS METRICS

### Leading Indicators

* **Onboarding Wizard Completion Rate:** % of registered users completing the profile form.
* **Average Time-to-Onboard:** Target under 3 minutes.
* **Error Rate during registration:** Target under 1%.

### Lagging Indicators

* **Verified Vendor Count:** Number of active, verified vendors.
* **Lead Response Time:** Time taken by a verified vendor to claim/respond to inquiries.

### Decision Gates

* **Gate 1:** Onboarding wizard drop-off is under 20% -> Proceed to launch automated GSTIN integration.
* **Gate 2:** Spam listings detected on platform is under 0.5% -> Maintain progressive approval flow; otherwise, shift to hard gatekeeping.

---

## ⚠️ RISKS AND MITIGATION

### Key Risks

1. **Approval Backlog:** Manual administrative reviews take too long, leading to vendor frustration and churn.
2. **Expired Sessions:** Authentication token expiry causes vendors to lose in-progress profile updates.
3. **Invalid GSTIN Spoofing:** Vendors inputting fake or third-party business numbers.

### Mitigation Strategies

* **Automate Verification:** Use third-party GSTIN lookup APIs to instantly match business name with input GSTIN.
* **Draft Auto-Saving:** Persist onboarding steps in local state or draft tables to prevent data loss.
* **Responsive Support Slack/WhatsApp Alert:** Auto-notify admins on Telegram/Slack whenever a new vendor completes onboarding, keeping response times under 2 hours.

---

_Generated using BMAD Creative Intelligence Suite - Innovation Strategy Workflow_

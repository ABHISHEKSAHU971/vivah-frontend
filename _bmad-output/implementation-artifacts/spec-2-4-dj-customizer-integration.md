---
title: 'Story 2.4: DJ Customizer and API Integration'
type: 'feature'
created: '2026-07-11'
status: 'done'
baseline_commit: '277fe1c3aa72b05b88dbd00b6190f5e23b3bd4a6'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Customers browsing DJ listings cannot customize their package selections, view standard vs add-on equipment, see dynamic pricing quotes, or receive scale-based setup warnings on the frontend. They are forced to submit generic inquiry details without custom configurations.

**Approach:** Implement a dedicated details and customizer page `/services/dj-sound/[id]` using a responsive split-pane layout matching the PlanMyVivah navy/gold aesthetic. The page will dynamically fetch the DJ's packages, call the backend quote API for live custom pricing, and use `GatedBookingModal` to verify details and submit inquiries.

## Boundaries & Constraints

**Always:**
- Apply the project's visual system: deep navy background (`#050D1A` / `#0A1628`), gold accents (`#C9A440`), Playfair Display heading typography, and Inter body typography.
- Fetch DJ packages using `GET /api/v1/dj/packages/?vendor=<id>` via the project's Axios client `api`.
- Request dynamic quote totals from `POST /api/v1/dj/equipment/quote/` when checkboxes are toggled or guest counts update.
- Display an orange warning message suggesting a speaker rig upgrade if the guest count exceeds `300`.
- Maintain full responsiveness, cascading to a single-column layout on viewports `<= 1024px`.

**Never:**
- Hardcode pricing totals or add-on equipment packages in production code.
- Submit booking inquiries without going through the GatedBookingModal verification (phone & OTP check).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Page Load | Route params: `id = 4` | Requests vendor 4 packages; loads first package, populates details & equipment lists | Display "No active packages found" if array is empty |
| Toggle Add-on | Check "lasers" checkbox | Calls `/dj/equipment/quote/` with selections; updates Custom Extras and Total Price | Show error banner if API response has `errors` |
| Slide Guests | Slider value = 350 | Displays alert: "Pro recommendation: guest count exceeds coverage" and highlights speaker row | N/A |
| Book Now | Click book, user unverified | Opens GatedBookingModal to send OTP, verify, and submit inquiry lead | Display validation error on incorrect OTP |

</frozen-after-approval>

## Code Map

- `src/app/services/dj-sound/page.tsx` -- Update checkout button to navigate to the details customizer page `/services/dj-sound/[id]`.
- `src/app/services/dj-sound/[id]/page.tsx` -- [NEW] Create split-pane customizer page integrating visual vibe selectors, review tabs, guest count checkers, live pricing quote updates, and booking submissions.

## Tasks & Acceptance

**Execution:**
- [x] `src/app/services/dj-sound/page.tsx` -- Route listing check buttons to `/services/dj-sound/[id]`.
- [x] `src/app/services/dj-sound/[id]/page.tsx` -- Develop customizer details layout with API connections for packages, equipment quotes, and gated verification submissions.

**Acceptance Criteria:**
- Given a customer lands on `/services/dj-sound/page.tsx`, when they click "Check Availability & Customize", then they are routed to `/services/dj-sound/[id]`.
- Given a customer is on `/services/dj-sound/[id]`, when they select different theme cards (Royal, Bollywood, etc.), then the page updates hero images, titles, and active package tier.
- Given a customer adjusts custom add-ons, when the quote API is called, then the pricing summary breakdown updates in real-time.
- Given guest count > 300, when the user adjusts the slider, then a warning message suggesting speaker upgrade is shown and the speaker row is highlighted.
- Given a user clicks "Submit Selection & Book", when they complete OTP verification, then an inquiry is created on the backend.

## Design Notes

The page state structure will manage package configurations dynamically:
```typescript
interface AddonSelection {
  equipment_item_id: number;
  quantity: number;
}
```

Axios pricing quote trigger logic:
```typescript
const fetchQuote = async (packageId: number, selections: AddonSelection[]) => {
  try {
    const res = await api.post("/dj/equipment/quote/", {
      package_id: packageId,
      selections
    });
    setQuoteData(res.data.data);
  } catch (err) {
    console.error("Quote fetching failed", err);
  }
};
```

## Verification

**Manual checks (if no CLI):**
- Visit `http://localhost:3000/services/dj-sound/4` (or any valid vendor ID), check styling, verify responsive reflow on mobile mode, check checkbox calculation updates, verify OTP code inputs and checkout modal triggers.

## Suggested Review Order

**Entry Point & Router Navigation**

- Redirect listing catalog book button actions to the dedicated customizer page.
  [`page.tsx:110`](../../src/app/services/dj-sound/page.tsx#L110)

**Interactive Customizer & Live pricing**

- [NEW] Configurator details page handling theme cards, guest count sliders, and Axios quote requests.
  [`page.tsx:142`](../../src/app/services/dj-sound/[id]/page.tsx#L142)

**Verification Checkout Integration**

- Append custom equipment specifications to inquiry messages.
  [`GatedBookingModal.tsx:194`](../../src/components/GatedBookingModal.tsx#L194)

# PlanMyVivah — Customer Flow

> Traced from actual codebase.

---

## 1. Customer Registration Flow

```
Customer opens app
        ↓
Enters phone number (role = "customer")
        ↓
POST /api/v1/auth/send-otp/  →  receives 6-digit OTP
        ↓
POST /api/v1/auth/verify-otp/  →  JWT tokens + user created
        ↓
Customer is logged in, can browse and enquire
```

### Registration Details

| Step | Endpoint | Permission | Status |
|---|---|---|---|
| Send OTP | `POST /api/v1/auth/send-otp/` | AllowAny | **IMPLEMENTED** |
| Verify OTP | `POST /api/v1/auth/verify-otp/` | AllowAny | **IMPLEMENTED** |
| Get Profile | `GET /api/v1/auth/me/` | IsAuthenticated | **IMPLEMENTED** |
| Update Profile | `PATCH /api/v1/auth/me/` | IsAuthenticated | **IMPLEMENTED** |

**Key difference from vendors:** Customers do NOT have a mandatory onboarding step. They can immediately browse and submit enquiries after OTP verification.

---

## 2. Customer Profile

**Table:** `customer_profiles` | **Source:** `apps/accounts/models/customer_profile.py`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | Primary key |
| `user` | OneToOne → User | Yes | Linked user account |
| `wedding_date` | DateField | No | Planned wedding/event date |
| `partner_name` | CharField(150) | No | Partner's name |
| `city` | CharField(100) | No | Preferred event city |
| `state` | CharField(100) | No | Default: "Madhya Pradesh" |
| `guest_count` | PositiveInteger | No | Expected number of guests |
| `budget_min` | Decimal(12,2) | No | Minimum budget in INR |
| `budget_max` | Decimal(12,2) | No | Maximum budget in INR |
| `planning_status` | CharField(30) | Yes | See choices below |
| `needs_catering` | Boolean | — | Default: true |
| `needs_decoration` | Boolean | — | Default: true |
| `needs_dj` | Boolean | — | Default: false |
| `needs_planner` | Boolean | — | Default: false |
| `created_at` | DateTimeField | Auto | — |
| `updated_at` | DateTimeField | Auto | — |

### Planning Status Choices

| Value | Label |
|---|---|
| `just_started` | Just Started Planning |
| `planning` | Actively Planning |
| `venue_confirmed` | Venue Confirmed |
| `finalised` | Almost Done |

### Customer Profile API

| Operation | Endpoint | Permission | Status |
|---|---|---|---|
| Get Profile | `GET /api/v1/auth/customer/profile/` | IsAuthenticated + IsCustomer | **IMPLEMENTED** |
| Update Profile | `PATCH /api/v1/auth/customer/profile/` | IsAuthenticated + IsCustomer | **IMPLEMENTED** |

---

## 3. Customer Browsing Journey

```
Customer browses venue listing
GET /api/v1/venues/venues/
        ↓
Applies filters (city, capacity, type, price, amenities)
        ↓
Opens venue detail page
GET /api/v1/venues/venues/{id}/
        ↓
Views images, pricing, service policies
        ↓
Optionally views pricing breakdown
GET /api/v1/venues/venues/{id}/pricing-breakdown/
        ↓
    ┌──────────────────────────────────────┐
    │ If unauthenticated:                  │
    │ → Sees "starting prices" only        │
    │ → Prompted to verify phone (4-digit  │
    │   OTP) to unlock full pricing        │
    │                                      │
    │ POST /api/v1/auth/otp/send/          │
    │ POST /api/v1/auth/otp/verify/        │
    └──────────────────────────────────────┘
        ↓
Submits enquiry
POST /api/v1/venues/venue-inquiries/
        ↓
Views enquiry history
GET /api/v1/venues/venue-inquiries/
```

---

## 4. Gated Pricing Flow

The platform uses a **gated pricing** model to capture leads:

| Step | Endpoint | OTP Length | Purpose |
|---|---|---|---|
| Send OTP | `POST /api/v1/auth/otp/send/` | 4 digits | Unlock detailed pricing |
| Verify OTP | `POST /api/v1/auth/otp/verify/` | 4 digits | Creates user + returns JWT |

**Unauthenticated users** see:
```json
{
  "gated": true,
  "starting_rent": 50000.0,
  "starting_veg_plate": 350.0
}
```

**Authenticated users** see full breakdown with royalty and GST.

**Status:** **IMPLEMENTED**

---

## 5. What Customers Can and Cannot Do

### ✅ Implemented

| Feature | Endpoint | Notes |
|---|---|---|
| Register via phone OTP | `POST /api/v1/auth/send-otp/` + `verify-otp/` | — |
| View own profile | `GET /api/v1/auth/me/` | Basic user info |
| Update profile | `PATCH /api/v1/auth/me/` | full_name, email, avatar |
| Manage customer profile | `GET/PATCH /api/v1/auth/customer/profile/` | Wedding planning details |
| Browse all active venues | `GET /api/v1/venues/venues/` | With filters, search, pagination |
| View venue detail | `GET /api/v1/venues/venues/{id}/` | Full detail + images |
| View pricing breakdown | `GET /api/v1/venues/venues/{id}/pricing-breakdown/` | Gated for anonymous |
| Submit enquiry | `POST /api/v1/venues/venue-inquiries/` | Public (AllowAny) |
| View own enquiries | `GET /api/v1/venues/venue-inquiries/` | Filtered to own user |
| Browse catering packages | `GET /api/v1/catering/catering-packages/` | — |
| Browse decoration packages | `GET /api/v1/decorations/decoration-packages/` | — |
| Browse DJ packages | `GET /api/v1/dj/packages/` | — |
| Get DJ equipment quote | `POST /api/v1/dj/equipment/quote/` | Live price calculation |

### ❌ Not Implemented

| Feature | Status |
|---|---|
| Save/favourite venues | NOT IMPLEMENTED |
| Compare venues | NOT IMPLEMENTED |
| Enquiry status notifications | NOT IMPLEMENTED |
| Chat with vendor | NOT IMPLEMENTED |
| Online booking/payment | NOT IMPLEMENTED (model exists, no customer-facing API) |
| Reviews and ratings | NOT IMPLEMENTED |
| Recommendations | NOT IMPLEMENTED (AI agent stubs exist) |
| Booking history | NOT IMPLEMENTED |
| Push notifications | NOT IMPLEMENTED |

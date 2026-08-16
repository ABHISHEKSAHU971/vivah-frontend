# PlanMyVivah — Admin Panel

> Traced from actual codebase. Documents both Django Admin and custom API endpoints.

---

## 1. Admin Access

### Admin Login API

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/auth/admin/login/` |
| **Controller** | `AdminLoginController` |
| **Authentication** | Email/phone + password |
| **Requirement** | User must have `role='admin'` or `is_staff=True` or `is_superuser=True` |
| **Response** | JWT access + refresh tokens |
| **Status** | **IMPLEMENTED** |

### Default Admin (from seed_all.py)

| Field | Value |
|---|---|
| Phone | `+910000000000` |
| Email | `abhishek.coder2001@gmail.com` |
| Password | `123456789` |
| Name | Abhishek Admin |

---

## 2. Django Admin Panel

**URL:** `/admin/`

### Registered Models

```
ADMIN PANEL
│
├── Accounts
│   ├── Users                    ← Custom UserAdmin
│   │   ├── List: phone, full_name, role, is_verified, is_active, created_at
│   │   ├── Filters: role, is_verified, is_active
│   │   ├── Search: phone, full_name, email
│   │   └── Actions: Standard Django admin actions
│   │
│   ├── OTP Verifications        ← OTPVerificationAdmin
│   │   ├── List: phone_number, is_verified, expires_at, created_at
│   │   └── Filters: is_verified
│   │
│   └── Vendor Profiles          ← VendorProfileAdmin
│       ├── List: business_name, vendor_type, user, city, is_approved, created_at
│       ├── Filters: is_approved, vendor_type, city
│       ├── Search: business_name, user__phone
│       ├── Fieldsets: Business Info, Approval, Timestamps
│       └── Actions:
│           ├── "Approve selected vendors" → sets is_approved=True, clears rejection_reason
│           └── "Reject selected vendors" → sets is_approved=False (admin must set rejection_reason manually first)
│
├── Catering
│   ├── Catering Businesses      ← With Branch inline
│   │   ├── List: brand_name, city, min_guests, is_active, created_at
│   │   └── Inlines: Branch (tabular)
│   │
│   ├── Branches
│   │   └── List: name, business, city, is_active, created_at
│   │
│   ├── Master Food Items
│   │   ├── List: name, course, is_veg, is_jain, is_spicy, created_at
│   │   └── Filters: course, is_veg, is_jain, is_spicy
│   │
│   ├── Catering Menu Items
│   │   ├── List: name, package, course, is_veg, is_jain, is_spicy
│   │   └── Filters: course, is_veg, is_jain, is_spicy
│   │
│   ├── Catering Packages
│   │   ├── List: name, vendor, cuisine_type, tier, price_per_plate, is_active
│   │   └── Filters: cuisine_type, tier, is_active
│   │
│   └── Venue Caterings
│       ├── List: venue, package, policy, is_default
│       └── Filters: policy, is_default
│
├── Decorations                  ← admin.py exists but not inspected; models registered
│
└── Listings                     ← admin.py is empty (models NOT registered in admin)
```

**Source Files:**
- `apps/accounts/admin.py`
- `apps/catering/admin.py`
- `apps/listings/admin.py` (empty — `# Register your models here.`)

### Models NOT Registered in Django Admin

| Model | App | Notes |
|---|---|---|
| Venue | venues | No `admin.py` found in venues app |
| VenueImage | venues | — |
| VenueInquiry | venues | — |
| VenueDeal | venues | — |
| VendorRoom | venues | — |
| Booking | bookings | — |
| BlockedDate | bookings | — |
| VenueAvailability | bookings | — |
| BaseListing | listings | admin.py is empty |
| PhotographerDetail | listings | — |
| MakeupDetail | listings | — |
| PlannerDetail | listings | — |
| DecorationPackage | decorations | **NEEDS VERIFICATION** |
| DJPackage | dj | — |
| DJEquipment | dj | — |
| CustomerProfile | accounts | — |

> **RECOMMENDATION:** Register Venue, VenueInquiry, Booking, and BaseListing in Django Admin for operational use.

---

## 3. Custom Admin API Endpoints

### 3.1 Vendor Approval Management

| Operation | Method | Endpoint | Permission |
|---|---|---|---|
| List all vendor profiles | GET | `/api/v1/auth/admin/approvals/` | IsAuthenticated + IsAdmin |
| Filter by approval status | GET | `/api/v1/auth/admin/approvals/?is_approved=false` | IsAuthenticated + IsAdmin |
| Approve/reject a vendor | POST | `/api/v1/auth/admin/approvals/{profile_id}/` | IsAuthenticated + IsAdmin |

**Approve request body:**
```json
{
  "is_approved": true
}
```

**Reject request body:**
```json
{
  "is_approved": false,
  "rejection_reason": "Incomplete documentation. Please provide GSTIN."
}
```

**Source:** `apps/accounts/controllers/admin_controller.py`
**Status:** **IMPLEMENTED**

---

### 3.2 Venue Verification

| Operation | Method | Endpoint | Permission |
|---|---|---|---|
| Verify a venue | POST | `/api/v1/venues/venues/{id}/verify/` | IsAuthenticated + admin check |

**Effect:** Sets `is_verified = true` on the venue.
**Source:** `apps/venues/controllers/__init__.py` → `VenueViewSet.verify()`
**Status:** **IMPLEMENTED**

---

### 3.3 Inquiry Management

| Operation | Method | Endpoint | Permission |
|---|---|---|---|
| List all inquiries | GET | `/api/v1/venues/admin/inquiries/` | IsAuthenticated + IsAdmin |
| Filter by venue | GET | `/api/v1/venues/admin/inquiries/?venue_id=123` | IsAuthenticated + IsAdmin |
| Inquiry analytics | GET | `/api/v1/venues/admin/inquiries/analytics/` | IsAuthenticated + IsAdmin |
| Analytics by venue | GET | `/api/v1/venues/admin/inquiries/analytics/?venue_id=123` | IsAuthenticated + IsAdmin |

**Source:** `apps/venues/controllers/admin_venues.py`
**Status:** **IMPLEMENTED**

---

### 3.4 Booking Management

| Operation | Method | Endpoint | Permission |
|---|---|---|---|
| List all bookings | GET | `/api/v1/bookings/admin/bookings/` | IsAuthenticated + IsAdmin |

**Source:** `apps/bookings/controllers/admin_bookings.py`
**Status:** **IMPLEMENTED**

---

### 3.5 Listing Management

| Operation | Method | Endpoint | Permission |
|---|---|---|---|
| List all listings | GET | `/api/v1/listings/admin/` | IsAuthenticated + IsAdmin |
| Manage single listing | GET/PATCH | `/api/v1/listings/admin/{pk}/` | IsAuthenticated + IsAdmin |

**Source:** `apps/listings/controllers/admin_listings.py`
**Status:** **IMPLEMENTED**

---

## 4. What Admin Can Do — Summary

### ✅ Implemented

| Capability | Via |
|---|---|
| Login with email/password | API |
| View all users | Django Admin |
| Manage user roles and status | Django Admin |
| View all vendor profiles | API + Django Admin |
| Approve/reject vendors | API + Django Admin |
| Set rejection reasons | API + Django Admin |
| Verify venues | API |
| View all enquiries | API |
| View enquiry analytics (day-wise) | API |
| View all bookings | API |
| Manage catering packages | Django Admin |
| Manage master food items | Django Admin |
| Manage catering businesses/branches | Django Admin |
| Manage venue caterings | Django Admin |
| Manage all listings | API |
| Seed data (admin, menu, caterers, DJ) | Management command |

### ❌ Not Implemented

| Capability | Notes |
|---|---|
| Admin dashboard with summary stats | No aggregate stats endpoint |
| Revenue/commission tracking | No financial reports |
| Customer management | No customer admin API |
| Enquiry status updates via admin API | Status is read_only in serializer |
| Bulk operations | Only approve/reject vendors in Django Admin |
| Audit logging | No action history tracking |
| Configuration management | No settings API |
| Platform fee configuration | Royalty (5%) is hardcoded |
| Email template management | — |
| SMS/WhatsApp configuration | — |

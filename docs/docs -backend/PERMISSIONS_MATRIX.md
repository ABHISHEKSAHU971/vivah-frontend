# PlanMyVivah — Permissions Matrix

> Traced from actual permission classes and controller configurations.

---

## Permission Classes Defined

**Source:** `apps/common/permissions/role_permissions.py`

| Class | Module | Logic |
|---|---|---|
| `IsVendor` | common | `user.is_authenticated AND user.role == 'vendor'` |
| `IsCustomer` | common | `user.is_authenticated AND user.role == 'customer'` |
| `IsApprovedVendor` | common | `IsVendor AND user.vendor_profile.is_approved` |
| `IsVendorOrReadOnly` | common | Vendor for writes, anyone for reads |
| `IsAdmin` | common | `user.is_authenticated AND (user.role == 'admin' OR user.is_staff)` |

**Source:** `apps/venues/permissions.py`

| Class | Module | Logic |
|---|---|---|
| `IsAdminUser` | venues | `user.is_staff OR user.role == 'admin'` |
| `IsOwnerVendor` | venues | `user.role == 'vendor' AND obj.vendor == user.vendor_profile` |
| `IsApprovedOwnerVendor` | venues | `IsOwnerVendor AND vendor_profile.is_approved` (bypassed in DEBUG) |
| `VenuePermission` | venues | Composite: AllowAny for reads, approved vendor for creates, owner/admin for updates |

**Source:** `apps/listings/permissions.py`

| Class | Module | Logic |
|---|---|---|
| `IsApprovedVendor` | listings | `user.role == 'vendor' AND vendor_profile.is_approved` (bypassed in DEBUG) |

---

## Full Endpoint × Role Matrix

### Legend
- ✅ = Allowed
- ❌ = Denied
- 🔓 = Public (no auth required)
- 👤 = Own data only
- 🏪 = Own venues/resources only

---

### Authentication Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `POST /auth/send-otp/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /auth/verify-otp/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /auth/refresh/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /auth/logout/` | ❌ | ✅ | ✅ | ✅ |
| `GET /auth/me/` | ❌ | ✅ | ✅ | ✅ |
| `PATCH /auth/me/` | ❌ | ✅ | ✅ | ✅ |
| `POST /auth/admin/login/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /auth/otp/send/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /auth/otp/verify/` | 🔓 | 🔓 | 🔓 | 🔓 |

### Vendor Profile Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `POST /auth/vendor/onboard/` | ❌ | ❌ | ✅ | ❌ |
| `GET /auth/vendor/profile/` | ❌ | ❌ | ✅ 👤 | ❌ |
| `PATCH /auth/vendor/profile/` | ❌ | ❌ | ✅ 👤 | ❌ |
| `POST /auth/vendor/logo/` | ❌ | ❌ | ✅ 👤 | ❌ |
| `GET /auth/vendor/status/` | ❌ | ❌ | ✅ 👤 | ❌ |

### Customer Profile Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET /auth/customer/profile/` | ❌ | ✅ 👤 | ❌ | ❌ |
| `PATCH /auth/customer/profile/` | ❌ | ✅ 👤 | ❌ | ❌ |

### Public Vendor Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET /auth/public/vendors/` | 🔓 | 🔓 | 🔓 | 🔓 |

### Admin Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET /auth/admin/approvals/` | ❌ | ❌ | ❌ | ✅ |
| `POST /auth/admin/approvals/{id}/` | ❌ | ❌ | ❌ | ✅ |
| `GET /venues/admin/inquiries/` | ❌ | ❌ | ❌ | ✅ |
| `GET /venues/admin/inquiries/analytics/` | ❌ | ❌ | ❌ | ✅ |
| `GET /bookings/admin/bookings/` | ❌ | ❌ | ❌ | ✅ |
| `GET /listings/admin/` | ❌ | ❌ | ❌ | ✅ |
| `GET/PATCH /listings/admin/{id}/` | ❌ | ❌ | ❌ | ✅ |

### Venue Endpoints

| Endpoint | Anon | Customer | Vendor (unapproved) | Vendor (approved) | Admin |
|---|---|---|---|---|---|
| `GET /venues/venues/` | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 |
| `GET /venues/venues/{id}/` | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /venues/venues/` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /venues/venues/{id}/` | ❌ | ❌ | ❌ | ✅ 🏪 | ✅ |
| `DELETE /venues/venues/{id}/` | ❌ | ❌ | ❌ | ✅ 🏪 | ✅ |
| `POST /venues/venues/{id}/verify/` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /venues/venues/my-venues/` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `GET /venues/venues/{id}/pricing-breakdown/` | 🔓 (gated) | ✅ (full) | ✅ (full) | ✅ (full) | ✅ (full) |

### Venue Sub-Resources

| Endpoint | Anon | Customer | Vendor (owner) | Admin |
|---|---|---|---|---|
| `GET /venues/venue-images/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /venues/venue-images/` | ❌ | ❌ | ✅ 🏪 | ✅ |
| `GET /venues/venue-deals/` | 🔓 (active only) | 🔓 (active only) | ✅ (all) | ✅ (all) |
| `POST /venues/venue-deals/` | ❌ | ❌ | ✅ 🏪 | ✅ |
| `GET /venues/vendor-rooms/` | 🔓 (active only) | 🔓 (active only) | ✅ (all) | ✅ (all) |
| `POST /venues/vendor-rooms/` | ❌ | ❌ | ✅ 🏪 | ✅ |

### Inquiry Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `POST /venues/venue-inquiries/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `GET /venues/venue-inquiries/` | ❌ | ✅ 👤 | ✅ 🏪 | ✅ |

### Booking Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET/POST /bookings/blocked-dates/` | Varies | Varies | ✅ 🏪 | ✅ |
| `GET/POST /bookings/venue-availabilitys/` | Varies | Varies | ✅ 🏪 | ✅ |
| `POST /bookings/inquiries/` | — | ✅ | — | — |

### Catering Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET /catering/catering-packages/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /catering/catering-packages/` | ❌ | ❌ | ✅ | ✅ |
| `GET /catering/master-food-items/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /catering/venue-caterings/` | ❌ | ❌ | ✅ | ✅ |
| `POST /catering/catering-bookings/` | ❌ | ✅ | — | ✅ |

### DJ Endpoints

| Endpoint | Anon | Customer | Vendor | Admin |
|---|---|---|---|---|
| `GET /dj/packages/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `GET /dj/packages/{id}/equipment/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `GET/POST /dj/vendor/equipment/` | ❌ | ❌ | ✅ | ❌ |
| `POST /dj/equipment/quote/` | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /dj/bookings/{id}/equipment/submit/` | ❌ | ✅ | — | — |

### Listing Endpoints

| Endpoint | Anon | Customer | Vendor (unapproved) | Vendor (approved) | Admin |
|---|---|---|---|---|---|
| `GET /listings/types/` | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 |
| `GET /listings/` | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 |
| `POST /listings/` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /listings/{id}/` | ❌ | ❌ | ❌ | ✅ 🏪 | ✅ |
| `DELETE /listings/{id}/` | ❌ | ❌ | ❌ | ✅ 🏪 | ✅ |
| `POST /listings/{id}/image/` | ❌ | ❌ | ❌ | ✅ 🏪 | ✅ |

---

## DEBUG Mode Bypass

> **Important:** In `DEBUG=True` mode, vendor approval checks are bypassed in several permission classes:

| Permission Class | Bypass Logic |
|---|---|
| `IsApprovedOwnerVendor` (venues) | `vendor_profile.is_approved OR settings.DEBUG` |
| `VenuePermission` (venues) | `vendor_profile.is_approved OR settings.DEBUG` |
| `IsApprovedVendor` (listings) | `vendor_profile.is_approved OR settings.DEBUG` |

This allows unapproved vendors to create/modify resources during development. **Must be disabled in production.**

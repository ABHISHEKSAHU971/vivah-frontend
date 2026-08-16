# PlanMyVivah — API Documentation

> Every endpoint listed below is traced from actual route files and controllers. No invented endpoints.

---

## Base URL

```
Development: http://localhost:8000/api/v1/
Production:  TBD
```

---

## Swagger / OpenAPI

| URL | Description |
|---|---|
| `/api/docs/` | Swagger UI (interactive) |
| `/api/schema/` | OpenAPI 3.0 schema (YAML/JSON) |

**Source:** `config/urls.py`

---

## 1. Authentication — `/api/v1/auth/`

**Source:** `apps/accounts/routes/auth_routes.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| POST | `/auth/send-otp/` | AllowAny | `SendOTPController` | Send 6-digit OTP to phone |
| POST | `/auth/verify-otp/` | AllowAny | `VerifyOTPController` | Verify OTP → JWT tokens |
| POST | `/auth/refresh/` | AllowAny | `RefreshTokenController` | Refresh access token |
| POST | `/auth/logout/` | IsAuthenticated | `LogoutController` | Blacklist refresh token |
| GET | `/auth/me/` | IsAuthenticated | `ProfileController` | Get current user |
| PATCH | `/auth/me/` | IsAuthenticated | `ProfileController` | Update user profile |
| POST | `/auth/admin/login/` | AllowAny | `AdminLoginController` | Admin email/password login |

### Gated OTP (4-digit for pricing unlock)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| POST | `/auth/otp/send/` | AllowAny | `GatedSendOTPController` | Send 4-digit OTP |
| POST | `/auth/otp/verify/` | AllowAny | `GatedVerifyOTPController` | Verify 4-digit OTP |

---

## 2. Vendor Management — `/api/v1/auth/vendor/`

**Source:** `apps/accounts/routes/vendor_routes.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| POST | `/auth/vendor/onboard/` | IsAuthenticated | `VendorOnboardController` | Complete vendor onboarding |
| GET | `/auth/vendor/profile/` | IsVendor | `VendorProfileController` | Get vendor profile |
| PATCH | `/auth/vendor/profile/` | IsVendor | `VendorProfileController` | Update vendor profile |
| POST | `/auth/vendor/logo/` | IsVendor | `VendorLogoController` | Upload business logo |
| GET | `/auth/vendor/status/` | IsVendor | `VendorStatusController` | Check approval status |

---

## 3. Customer Profile — `/api/v1/auth/customer/`

**Source:** `apps/accounts/routes/customer_routes.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/auth/customer/profile/` | IsAuthenticated + IsCustomer | `CustomerProfileController` | Get customer profile |
| PATCH | `/auth/customer/profile/` | IsAuthenticated + IsCustomer | `CustomerProfileController` | Update customer profile |

---

## 4. Public Vendors — `/api/v1/auth/`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/auth/public/vendors/` | AllowAny | `PublicVendorListController` | List approved vendors |
| GET | `/auth/public/vendors/?vendor_type=caterer` | AllowAny | `PublicVendorListController` | Filter by vendor type |

---

## 5. Admin — `/api/v1/auth/admin/`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/auth/admin/approvals/` | IsAuthenticated + IsAdmin | `AdminVendorApprovalController` | List vendor profiles |
| GET | `/auth/admin/approvals/?is_approved=false` | IsAuthenticated + IsAdmin | `AdminVendorApprovalController` | Filter unapproved |
| POST | `/auth/admin/approvals/{profile_id}/` | IsAuthenticated + IsAdmin | `AdminVendorApprovalController` | Approve/reject vendor |

---

## 6. Venues — `/api/v1/venues/`

**Source:** `apps/venues/routes/__init__.py`

### Venue CRUD (Router-based)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/venues/` | AllowAny | `VenueViewSet.list` | List active venues (paginated, filterable) |
| POST | `/venues/venues/` | Approved Vendor | `VenueViewSet.create` | Create venue |
| GET | `/venues/venues/{id}/` | AllowAny | `VenueViewSet.retrieve` | Get venue detail |
| PATCH | `/venues/venues/{id}/` | Owner/Admin | `VenueViewSet.partial_update` | Update venue |
| PUT | `/venues/venues/{id}/` | Owner/Admin | `VenueViewSet.update` | Update venue (alias) |
| DELETE | `/venues/venues/{id}/` | Owner/Admin | `VenueViewSet.destroy` | Soft-delete venue |
| POST | `/venues/venues/{id}/verify/` | Admin | `VenueViewSet.verify` | Verify venue |
| GET | `/venues/venues/my-venues/` | IsAuthenticated | `VenueViewSet.my_venues` | Vendor's own venues |

### Venue Images (Router-based)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/venue-images/` | AllowAny | `VenueImageViewSet.list` | List images |
| POST | `/venues/venue-images/` | Owner/Admin | `VenueImageViewSet.create` | Upload image |
| GET | `/venues/venue-images/{id}/` | AllowAny | `VenueImageViewSet.retrieve` | Get image detail |
| PATCH | `/venues/venue-images/{id}/` | Owner/Admin | `VenueImageViewSet.partial_update` | Update image |
| DELETE | `/venues/venue-images/{id}/` | Owner/Admin | `VenueImageViewSet.destroy` | Delete image |

### Venue Inquiries (Router-based)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/venue-inquiries/` | IsAuthenticated | `VenueInquiryViewSet.list` | List inquiries (role-filtered) |
| POST | `/venues/venue-inquiries/` | AllowAny | `VenueInquiryViewSet.create` | Submit inquiry |
| GET | `/venues/venue-inquiries/{id}/` | IsAuthenticated | `VenueInquiryViewSet.retrieve` | Get inquiry detail |

### Venue Deals (Router-based)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/venue-deals/` | AllowAny | `VenueDealViewSet.list` | List deals |
| POST | `/venues/venue-deals/` | Owner/Admin | `VenueDealViewSet.create` | Create deal |
| GET/PATCH/DELETE | `/venues/venue-deals/{id}/` | Owner/Admin | `VenueDealViewSet` | Manage deal |

### Vendor Rooms (Router-based)

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/vendor-rooms/` | AllowAny | `VendorRoomViewSet.list` | List rooms |
| POST | `/venues/vendor-rooms/` | Owner/Admin | `VendorRoomViewSet.create` | Create room |
| GET/PATCH/DELETE | `/venues/vendor-rooms/{id}/` | Owner/Admin | `VendorRoomViewSet` | Manage room |

### Pricing & Admin

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/venues/venues/{id}/pricing-breakdown/` | AllowAny | `VenuePricingBreakdownController` | Dynamic pricing (gated) |
| GET | `/venues/admin/inquiries/` | IsAdmin | `AdminInquiryController` | All inquiries |
| GET | `/venues/admin/inquiries/analytics/` | IsAdmin | `AdminInquiryAnalyticsController` | Day-wise analytics |

---

## 7. Bookings — `/api/v1/bookings/`

**Source:** `apps/bookings/routes/__init__.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET/POST | `/bookings/blocked-dates/` | Via ViewSet | `BlockedDateViewSet` | Manage blocked dates |
| GET/PATCH/DELETE | `/bookings/blocked-dates/{id}/` | Via ViewSet | `BlockedDateViewSet` | Specific blocked date |
| GET/POST | `/bookings/venue-availabilitys/` | Via ViewSet | `VenueAvailabilityViewSet` | Manage availability |
| GET/PATCH/DELETE | `/bookings/venue-availabilitys/{id}/` | Via ViewSet | `VenueAvailabilityViewSet` | Specific availability |
| POST | `/bookings/inquiries/` | — | `BookingInquiryController` | Submit booking inquiry |
| GET | `/bookings/admin/bookings/` | IsAdmin | `AdminBookingListController` | All bookings (admin) |

---

## 8. Catering — `/api/v1/catering/`

**Source:** `apps/catering/routes/__init__.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET/POST | `/catering/catering-packages/` | Via ViewSet | `CateringPackageViewSet` | CRUD packages |
| GET/POST | `/catering/catering-menu-items/` | Via ViewSet | `CateringMenuItemViewSet` | CRUD menu items |
| GET/POST | `/catering/venue-caterings/` | Via ViewSet | `VenueCateringViewSet` | Link packages to venues |
| GET/POST | `/catering/catering-businesses/` | Via ViewSet | `CateringBusinessViewSet` | CRUD businesses |
| GET/POST | `/catering/branches/` | Via ViewSet | `BranchViewSet` | CRUD branches |
| GET/POST | `/catering/quote/` | Via ViewSet | `QuoteView` | Get catering quote |
| GET/POST | `/catering/master-food-items/` | Via ViewSet | `MasterFoodItemViewSet` | CRUD food catalog |
| GET/POST | `/catering/catering-bookings/` | Via ViewSet | `CateringBookingViewSet` | CRUD bookings |

---

## 9. Decorations — `/api/v1/decorations/`

**Source:** `apps/decorations/routes/__init__.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET/POST | `/decorations/decoration-packages/` | Via ViewSet | `DecorationPackageViewSet` | CRUD packages |
| GET/POST | `/decorations/decoration-tiers/` | Via ViewSet | `DecorationTierViewSet` | CRUD price tiers |
| GET/POST | `/decorations/venue-decorations/` | Via ViewSet | `VenueDecorationViewSet` | Link to venues |

---

## 10. DJ — `/api/v1/dj/`

**Source:** `apps/dj/routes/__init__.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/dj/packages/` | AllowAny | `DJPackageListController` | List DJ packages |
| GET | `/dj/packages/{id}/` | AllowAny | `DJPackageDetailController` | Package detail |
| GET | `/dj/packages/{id}/equipment/` | AllowAny | `PackageEquipmentController` | Package equipment list |
| GET | `/dj/vendor/equipment/` | IsVendor | `VendorEquipmentListController` | Vendor equipment |
| GET/PATCH/DELETE | `/dj/vendor/equipment/{id}/` | IsVendor | `VendorEquipmentDetailController` | Manage equipment |
| POST | `/dj/equipment/quote/` | — | `DJEquipmentQuoteController` | Live price quote |
| GET | `/dj/bookings/{booking_id}/equipment/` | — | `DJBookingEquipmentListController` | Booking equipment |
| POST | `/dj/bookings/{booking_id}/equipment/submit/` | — | `DJBookingEquipmentSubmitController` | Submit selection |

---

## 11. Listings — `/api/v1/listings/`

**Source:** `apps/listings/routes/listing_routes.py`

| Method | Endpoint | Permission | Controller | Description |
|---|---|---|---|---|
| GET | `/listings/types/` | AllowAny | `ListingTypeDiscoveryController` | Available listing types |
| GET | `/listings/` | AllowAny | `ListingListCreateController` | List all listings |
| POST | `/listings/` | Approved Vendor | `ListingListCreateController` | Create listing |
| GET | `/listings/{id}/` | AllowAny | `ListingDetailUpdateDeleteController` | Listing detail |
| PATCH | `/listings/{id}/` | Owner/Admin | `ListingDetailUpdateDeleteController` | Update listing |
| DELETE | `/listings/{id}/` | Owner/Admin | `ListingDetailUpdateDeleteController` | Delete listing |
| POST | `/listings/{id}/image/` | Owner | `ListingImageUploadController` | Upload listing image |
| GET | `/listings/admin/` | IsAdmin | `AdminListingListController` | All listings (admin) |
| GET/PATCH | `/listings/admin/{id}/` | IsAdmin | `AdminListingDetailController` | Manage listing (admin) |

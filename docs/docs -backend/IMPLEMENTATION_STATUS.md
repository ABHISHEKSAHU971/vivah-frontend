# PlanMyVivah — Implementation Status

> Every feature audited against the actual codebase. Status is evidence-based.

---

## Status Legend

| Status | Meaning |
|---|---|
| ✅ **IMPLEMENTED** | Feature exists in code, complete with models, API, serializers, and business logic |
| 🟡 **PARTIALLY IMPLEMENTED** | Core logic exists but missing UI/workflow integration or edge cases |
| 🔲 **STUB** | Files/classes exist but contain placeholder code with no real functionality |
| ❌ **NOT IMPLEMENTED** | Feature does not exist in the codebase |
| ⚠️ **IMPLEMENTED BUT NEEDS REVIEW** | Feature exists but has known issues or incomplete integration |

---

## 1. Authentication & Authorization

| Feature | Status | Evidence |
|---|---|---|
| Phone-based OTP registration | ✅ IMPLEMENTED | `AuthService.send_otp()`, `OTPVerificationService` |
| OTP generation (6-digit, hashed) | ✅ IMPLEMENTED | `OTPVerification` model, `pyotp` library |
| OTP verification | ✅ IMPLEMENTED | `AuthService.verify_otp()` |
| JWT access + refresh tokens | ✅ IMPLEMENTED | `SimpleJWT` configured, `RefreshToken.for_user()` |
| Token refresh | ✅ IMPLEMENTED | `RefreshTokenController` |
| Token blacklist (logout) | ✅ IMPLEMENTED | `rest_framework_simplejwt.token_blacklist` app, `LogoutController` |
| Admin email/password login | ✅ IMPLEMENTED | `AdminLoginController`, `AuthService.admin_login()` |
| Role-based permissions | ✅ IMPLEMENTED | `IsVendor`, `IsCustomer`, `IsAdmin`, `IsApprovedVendor` |
| Object-level permissions | ✅ IMPLEMENTED | `IsOwnerVendor`, `VenuePermission` with `has_object_permission` |
| SMS/WhatsApp OTP delivery | ❌ NOT IMPLEMENTED | OTP is printed to console via `dev_otp` field; `SMSWhatsAppService` exists but no real gateway |
| Social login (Google/Facebook) | ❌ NOT IMPLEMENTED | — |
| Email verification | ❌ NOT IMPLEMENTED | — |
| Password reset | ❌ NOT IMPLEMENTED | Customers don't use passwords; admin has no reset flow |
| Rate limiting on OTP | ❌ NOT IMPLEMENTED | No throttle on `/send-otp/` |
| 4-digit gated OTP (pricing unlock) | ✅ IMPLEMENTED | `GatedSendOTPController`, `GatedVerifyOTPController` |

---

## 2. Vendor Management

| Feature | Status | Evidence |
|---|---|---|
| Vendor onboarding | ✅ IMPLEMENTED | `VendorOnboardController`, `VendorService.onboard()` |
| Vendor profile CRUD | ✅ IMPLEMENTED | `VendorProfileController` (GET + PATCH) |
| Logo upload (2MB, JPEG/PNG/WebP) | ✅ IMPLEMENTED | `VendorLogoController`, validated in serializer |
| Approval status check | ✅ IMPLEMENTED | `VendorStatusController`, `VendorService.get_status()` |
| Admin approval/rejection | ✅ IMPLEMENTED | `AdminVendorApprovalController` + Django admin actions |
| Public vendor listing | ✅ IMPLEMENTED | `PublicVendorListController` with `vendor_type` filter |
| GSTIN validation (15 chars) | ✅ IMPLEMENTED | `VendorOnboardSerializer.validate_gstin()` |
| Vendor dashboard/analytics | ❌ NOT IMPLEMENTED | No aggregate stats endpoint for vendors |
| Vendor notifications | ❌ NOT IMPLEMENTED | — |
| Vendor revenue tracking | ❌ NOT IMPLEMENTED | — |

---

## 3. Customer Management

| Feature | Status | Evidence |
|---|---|---|
| Customer registration (OTP) | ✅ IMPLEMENTED | Same auth flow as vendor, role='customer' |
| Customer profile | ✅ IMPLEMENTED | `CustomerProfileController`, `CustomerProfile` model |
| Planning status tracking | ✅ IMPLEMENTED | `planning_status` field with choices |
| Service need preferences | ✅ IMPLEMENTED | `needs_catering`, `needs_decoration`, `needs_dj`, `needs_planner` |
| Budget range tracking | ✅ IMPLEMENTED | `budget_min`, `budget_max` fields |
| Profile sync from inquiry | ✅ IMPLEMENTED | `CustomerService.sync_profile_from_inquiry()` |
| Favourite/saved venues | ❌ NOT IMPLEMENTED | — |
| Venue comparison | ❌ NOT IMPLEMENTED | — |
| Booking history for customer | ❌ NOT IMPLEMENTED | — |
| Push notifications | ❌ NOT IMPLEMENTED | — |

---

## 4. Venue Management

| Feature | Status | Evidence |
|---|---|---|
| Venue CRUD (create/read/update/delete) | ✅ IMPLEMENTED | `VenueViewSet` (full ViewSet), `VenueService`, `VenueRepository` |
| Venue listing with 12+ filter params | ✅ IMPLEMENTED | `VenueRepository.filter_by_params()` — city, type, capacity, price, amenities, policies |
| Full-text search (name, city, desc) | ✅ IMPLEMENTED | `VenueRepository.search()` using `Q(icontains)` |
| Sort by price/rating/bookings/date | ✅ IMPLEMENTED | `VenueService.list_venues()` with allowed orderings |
| Pagination (12/page) | ✅ IMPLEMENTED | `StandardPagination` |
| Venue images (gallery) | ✅ IMPLEMENTED | `VenueImageViewSet` (ModelViewSet) |
| Primary image detection | ✅ IMPLEMENTED | `VenueListSerializer.get_primary_image()` |
| Venue deals/promotions | ✅ IMPLEMENTED | `VenueDealViewSet`, discount percentage calculation |
| Vendor rooms inventory | ✅ IMPLEMENTED | `VendorRoomViewSet`, JSON amenities |
| Service policies (none/inhouse/both) | ✅ IMPLEMENTED | 4 policy fields on Venue model |
| Vendor's own venue list | ✅ IMPLEMENTED | `VenueViewSet.my_venues()` custom action |
| Venue verification (admin) | ✅ IMPLEMENTED | `VenueViewSet.verify()` → `VenueService.verify_venue()` |
| Soft-delete (is_active=false) | ✅ IMPLEMENTED | `VenueRepository.soft_delete()` |
| Hard-delete (admin only) | ✅ IMPLEMENTED | `VenueRepository.hard_delete()` |
| Gated pricing breakdown | ✅ IMPLEMENTED | `VenuePricingBreakdownController` — unauthenticated sees starting prices only |
| Dynamic pricing with royalty+GST | ✅ IMPLEMENTED | 5% royalty + 18% GST calculation |
| Database indexes (city, type, active) | ✅ IMPLEMENTED | `Meta.indexes` on Venue model |
| Capacity range validation | ✅ IMPLEMENTED | `VenueService.create_venue()`, `VenueWriteSerializer.validate()` |
| System field protection | ✅ IMPLEMENTED | avg_rating, total_bookings, is_verified stripped from client data |
| GPS coordinates | 🟡 PARTIALLY IMPLEMENTED | Fields exist (`latitude`, `longitude`) but no map/geocoding integration |
| Availability calendar (public) | ❌ NOT IMPLEMENTED | `VenueAvailability` model exists, no public-facing API for customers |
| Reviews/ratings system | ❌ NOT IMPLEMENTED | `avg_rating` field exists (system-managed) but no Review model or API |
| Linked service packages in detail | 🟡 PARTIALLY IMPLEMENTED | Data exists via `VenueCatering`, etc., but not included in `VenueDetailSerializer` |

---

## 5. Enquiry System

| Feature | Status | Evidence |
|---|---|---|
| Submit enquiry (public, anonymous OK) | ✅ IMPLEMENTED | `VenueInquiryViewSet.create()`, AllowAny |
| Enquiry with optional venue | ✅ IMPLEMENTED | `venue` is nullable FK |
| Enquiry with package references | ✅ IMPLEMENTED | `catering_package`, `decoration_package` FK fields |
| Role-based enquiry listing | ✅ IMPLEMENTED | Admin=all, Vendor=own venues, Customer=own |
| WhatsApp alert on new enquiry | ⚠️ IMPLEMENTED BUT NEEDS REVIEW | Signal fires, `SMSWhatsAppService` called, but real SMS gateway unclear |
| Email alert to coordinators | ✅ IMPLEMENTED | `send_mail()` in signal (console backend in dev) |
| Admin enquiry listing | ✅ IMPLEMENTED | `AdminInquiryController` |
| Admin enquiry analytics (day-wise) | ✅ IMPLEMENTED | `AdminInquiryAnalyticsController` using `TruncDate` + `Count` |
| Enquiry status lifecycle | 🟡 PARTIALLY IMPLEMENTED | Status field exists (pending/responded/closed) but no API to update it |
| Enquiry reply/comments | ❌ NOT IMPLEMENTED | — |
| Enquiry-to-booking conversion | ❌ NOT IMPLEMENTED | — |
| Enquiry status notifications | ❌ NOT IMPLEMENTED | — |
| Follow-up reminders | ❌ NOT IMPLEMENTED | — |
| Enquiry deduplication | ❌ NOT IMPLEMENTED | — |

---

## 6. Booking System

| Feature | Status | Evidence |
|---|---|---|
| Booking model (data schema) | ✅ IMPLEMENTED | `Booking` model with venue, customer, services, amounts, status |
| Blocked dates management | ✅ IMPLEMENTED | `BlockedDateViewSet` |
| Venue availability tracking | ✅ IMPLEMENTED | `VenueAvailabilityViewSet` |
| Booking inquiry endpoint | ✅ IMPLEMENTED | `BookingInquiryController` |
| Admin booking list | ✅ IMPLEMENTED | `AdminBookingListController` |
| Booking status state machine | 🟡 PARTIALLY IMPLEMENTED | Status choices defined but no transition validation |
| Customer-facing booking creation | ❌ NOT IMPLEMENTED | No public booking API |
| Online payment (Razorpay) | ❌ NOT IMPLEMENTED | Razorpay configured in requirements but not wired to booking flow |
| Booking confirmation/cancellation | ❌ NOT IMPLEMENTED | — |
| Booking invoicing | ❌ NOT IMPLEMENTED | — |
| Booking calendar for vendors | ❌ NOT IMPLEMENTED | — |

---

## 7. Catering Module

| Feature | Status | Evidence |
|---|---|---|
| Catering package CRUD | ✅ IMPLEMENTED | `CateringPackageViewSet`, model with tiers, cuisine types |
| Menu item management | ✅ IMPLEMENTED | `CateringMenuItemViewSet`, `CateringMenuItem` model |
| Master food item catalog | ✅ IMPLEMENTED | `MasterFoodItemViewSet`, 140+ items in `seed_all.py` |
| Catering business profile | ✅ IMPLEMENTED | `CateringBusinessViewSet`, 1:1 with VendorProfile |
| Branch management | ✅ IMPLEMENTED | `BranchViewSet`, inline in admin |
| Venue-catering linking | ✅ IMPLEMENTED | `VenueCateringViewSet`, with policy and default flag |
| Catering booking | ✅ IMPLEMENTED | `CateringBookingViewSet` with amounts and M2M menu items |
| Catering quote | ✅ IMPLEMENTED | `QuoteView` |
| Material option (with/without material) | ✅ IMPLEMENTED | `material_option` field + `price_per_plate_without_material` |
| Weekend/festival surcharge | ✅ IMPLEMENTED | `weekend_surcharge_pct`, `festival_surcharge_pct` fields |
| Platform default packages | ✅ IMPLEMENTED | `is_platform_default` flag |
| Seed data (2 caterers, 3 packages) | ✅ IMPLEMENTED | `seed_all.py --only caterers` |

---

## 8. Decoration Module

| Feature | Status | Evidence |
|---|---|---|
| Decoration package CRUD | ✅ IMPLEMENTED | `DecorationPackageViewSet`, model with styles and includes |
| Price tiers (low/medium/average/high) | ✅ IMPLEMENTED | `DecorationTierViewSet`, `DecorationTier` model |
| Venue-decoration linking | ✅ IMPLEMENTED | `VenueDecorationViewSet`, with policy and default flag |
| Platform default packages | ✅ IMPLEMENTED | `is_platform_default` flag |
| Decoration images | ✅ IMPLEMENTED | `image` field on DecorationPackage |
| Decoration booking | ❌ NOT IMPLEMENTED | No standalone decoration booking model/API |

---

## 9. DJ Module

| Feature | Status | Evidence |
|---|---|---|
| DJ package browsing | ✅ IMPLEMENTED | `DJPackageListController`, `DJPackageDetailController` |
| DJ equipment management | ✅ IMPLEMENTED | `VendorEquipmentListController`, `VendorEquipmentDetailController` |
| Included vs. add-on items | ✅ IMPLEMENTED | `DJEquipment.is_included` flag |
| Live price quote | ✅ IMPLEMENTED | `DJEquipmentQuoteController` |
| Booking equipment selection | ✅ IMPLEMENTED | `DJBookingEquipmentSubmitController`, snapshot pricing |
| Equipment availability tracking | ✅ IMPLEMENTED | `quantity_available` field |
| Theme/occasion tagging | ✅ IMPLEMENTED | `theme`, `occasion_types` fields on DJPackage |
| Venue-DJ linking | ✅ IMPLEMENTED | `VenueDJ` model |
| Seed data (1 DJ vendor, 8 equipment) | ✅ IMPLEMENTED | `seed_all.py --only dj` |

---

## 10. Listings Module (Multi-Category)

| Feature | Status | Evidence |
|---|---|---|
| Base listing CRUD | ✅ IMPLEMENTED | `ListingListCreateController`, `BaseListing` model |
| Service type discovery | ✅ IMPLEMENTED | `ListingTypeDiscoveryController` |
| Category-specific details | ✅ IMPLEMENTED | `PhotographerDetail`, `MakeupDetail`, `PlannerDetail` models |
| Listing image upload | ✅ IMPLEMENTED | `ListingImageUploadController` |
| Status workflow (draft/active/inactive) | ✅ IMPLEMENTED | `BaseListing.status` field |
| Admin listing management | ✅ IMPLEMENTED | `AdminListingListController`, `AdminListingDetailController` |
| Listing search/filter | 🟡 PARTIALLY IMPLEMENTED | Basic filtering exists but no advanced search |
| Django admin registration | ❌ NOT IMPLEMENTED | `admin.py` is empty |

---

## 11. AI/ML Features

| Feature | Status | Evidence |
|---|---|---|
| LLM service wrapper | 🔲 STUB | `ai_services/llm_service.py` — class exists, not integrated |
| Embedding service | 🔲 STUB | `ai_services/embedding_service.py` |
| Prompt builder | 🔲 STUB | `ai_services/prompt_builder.py` |
| Image generation | 🔲 STUB | `ai_services/image_generation_service.py` |
| Vector search | 🔲 STUB | `ai_services/vector_search_service.py` |
| Venue recommendation agent | 🔲 STUB | `ai_agents/venue_agent.py` |
| Budget planning agent | 🔲 STUB | `ai_agents/budget_agent.py` |
| Decoration suggestion agent | 🔲 STUB | `ai_agents/decor_agent.py` |
| Availability checking agent | 🔲 STUB | `ai_agents/availability_agent.py` |
| Wedding planner agent | 🔲 STUB | `ai_agents/wedding_planner_agent.py` |

---

## 12. Infrastructure & DevOps

| Feature | Status | Evidence |
|---|---|---|
| OpenAPI/Swagger documentation | ✅ IMPLEMENTED | `drf-spectacular`, `/api/docs/` |
| Django Admin panel | ✅ IMPLEMENTED | User, OTP, VendorProfile, Catering entities registered |
| Database seed command | ✅ IMPLEMENTED | `python manage.py seed_all` — admin, menu, caterers, DJ |
| CORS configuration | ✅ IMPLEMENTED | `django-cors-headers`, dev origins configured |
| S3 file storage (conditional) | ✅ IMPLEMENTED | `USE_S3` env var toggles between local and S3 |
| Standardized API responses | ✅ IMPLEMENTED | `apps/common/responses/` — success, error, created, not_found |
| Custom exception hierarchy | ✅ IMPLEMENTED | `AppException`, `NotFoundException`, `ForbiddenException`, `ValidationException` |
| Pagination | ✅ IMPLEMENTED | `StandardPagination` — 12 items/page |
| Celery task queue | 🟡 PARTIALLY IMPLEMENTED | `celery` in requirements, app configured, but minimal usage |
| Redis cache | 🟡 PARTIALLY IMPLEMENTED | `django-redis` in requirements, `LocMemCache` in dev settings |
| CI/CD pipeline | ❌ NOT IMPLEMENTED | No GitHub Actions, no Dockerfile |
| Docker containerization | ❌ NOT IMPLEMENTED | — |
| Unit/integration tests | 🟡 PARTIALLY IMPLEMENTED | Test files exist but coverage is minimal |
| Logging configuration | ❌ NOT IMPLEMENTED | Uses default Django logging |
| Health check endpoint | ❌ NOT IMPLEMENTED | — |
| Rate limiting/throttling | ❌ NOT IMPLEMENTED | — |

---

## Summary Statistics

| Category | Implemented | Partially | Stub | Not Implemented |
|---|---|---|---|---|
| Auth & AuthZ | 10 | 0 | 0 | 5 |
| Vendor | 7 | 0 | 0 | 3 |
| Customer | 6 | 0 | 0 | 4 |
| Venues | 18 | 2 | 0 | 3 |
| Enquiries | 7 | 1 | 0 | 5 |
| Bookings | 5 | 1 | 0 | 5 |
| Catering | 12 | 0 | 0 | 0 |
| Decorations | 5 | 0 | 0 | 1 |
| DJ | 9 | 0 | 0 | 0 |
| Listings | 6 | 1 | 0 | 1 |
| AI/ML | 0 | 0 | 10 | 0 |
| Infrastructure | 7 | 3 | 0 | 5 |
| **Total** | **92** | **8** | **10** | **32** |

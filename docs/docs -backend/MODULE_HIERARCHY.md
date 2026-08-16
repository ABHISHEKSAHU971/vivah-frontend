# PlanMyVivah — Module Hierarchy

> Generated from actual codebase inspection. Only modules that exist in the repository are listed.

```
PlanMyVivah (celebrationplatform/)
│
├── config/                          # Django project configuration
│   ├── settings/
│   │   ├── base.py                  # Shared settings (REST framework, JWT, apps)
│   │   ├── development.py           # Local dev (PostgreSQL, console email)
│   │   └── production.py            # Production settings (S3, allowed hosts)
│   ├── urls.py                      # Root URL router
│   └── wsgi.py                      # WSGI entry point
│
├── apps/                            # All Django applications
│   │
│   ├── accounts/                    # Authentication & User Management
│   │   ├── models/
│   │   │   ├── user.py              # Custom User (phone-based, roles)
│   │   │   ├── vendor_profile.py    # VendorProfile (1:1 with User)
│   │   │   ├── customer_profile.py  # CustomerProfile (1:1 with User)
│   │   │   ├── otp_verification.py  # OTPVerification (canonical OTP system)
│   │   │   └── otp.py               # OTP [DEPRECATED — scheduled for removal]
│   │   ├── controllers/
│   │   │   ├── auth_controller.py   # OTP send/verify, JWT, admin login
│   │   │   ├── vendor_controller.py # Vendor onboard, profile, logo, status
│   │   │   ├── customer_controller.py # Customer profile CRUD
│   │   │   └── admin_controller.py  # Admin vendor approval/rejection
│   │   ├── serializers/
│   │   │   ├── auth_serializer.py   # OTP, JWT, user serializers
│   │   │   ├── vendor_serializer.py # Vendor onboard/profile serializers
│   │   │   └── customer_serializer.py # Customer profile serializers
│   │   ├── services/
│   │   │   ├── auth_service.py      # Login/logout business logic
│   │   │   ├── otp_service.py       # OTP generation & verification
│   │   │   ├── vendor_service.py    # Vendor onboarding & profile management
│   │   │   └── customer_service.py  # Customer profile management
│   │   ├── repositories/
│   │   │   ├── user_repository.py   # User DB access layer
│   │   │   ├── vendor_repository.py # Vendor DB access layer
│   │   │   ├── customer_repository.py # Customer DB access layer
│   │   │   └── otp_repository.py    # OTP DB access layer
│   │   ├── routes/
│   │   │   ├── auth_routes.py       # /api/v1/auth/* endpoints
│   │   │   ├── vendor_routes.py     # /api/v1/auth/vendor/* endpoints
│   │   │   └── customer_routes.py   # /api/v1/auth/customer/* endpoints
│   │   ├── admin.py                 # Django admin: User, OTP, VendorProfile
│   │   └── tests.py                 # Account tests
│   │
│   ├── venues/                      # Venue Management (core module)
│   │   ├── models/
│   │   │   ├── venue.py             # Venue (main entity — 40+ fields)
│   │   │   ├── venue_image.py       # VenueImage (gallery)
│   │   │   ├── venue_inquiry.py     # VenueInquiry (customer enquiries)
│   │   │   ├── venue_deal.py        # VenueDeal (promotional pricing)
│   │   │   └── vendor_room.py       # VendorRoom (room inventory)
│   │   ├── controllers/
│   │   │   ├── __init__.py          # VenueViewSet, VenueImageViewSet,
│   │   │   │                        # VenueInquiryViewSet, VenueDealViewSet,
│   │   │   │                        # VendorRoomViewSet, VenuePricingBreakdownController
│   │   │   └── admin_venues.py      # AdminInquiryController, AdminInquiryAnalyticsController
│   │   ├── serializers/
│   │   │   └── __init__.py          # List/Detail/Write/Inquiry/Deal/Room serializers
│   │   ├── services/
│   │   │   └── venue_service.py     # Venue CRUD business logic
│   │   ├── repositories/
│   │   │   └── venue_repository.py  # Venue DB access (search, filter, CRUD)
│   │   ├── filters/                 # Filter backends (empty — filters in repository)
│   │   ├── permissions.py           # VenuePermission, IsOwnerVendor, IsAdminUser
│   │   ├── signals.py               # Post-save: WhatsApp + email on new inquiry
│   │   └── routes/
│   │       └── __init__.py          # /api/v1/venues/* router & URL patterns
│   │
│   ├── bookings/                    # Booking & Availability Management
│   │   ├── models/
│   │   │   ├── booking.py           # Booking (venue + bundled services)
│   │   │   ├── blocked_date.py      # BlockedDate (vendor-managed blocks)
│   │   │   └── venue_availability.py # VenueAvailability (date-level tracking)
│   │   ├── controllers/             # BlockedDateViewSet, VenueAvailabilityViewSet,
│   │   │                            # BookingInquiryController
│   │   ├── serializers/             # Booking serializers
│   │   ├── services/                # Booking business logic
│   │   ├── repositories/            # Booking DB access
│   │   └── routes/
│   │       └── __init__.py          # /api/v1/bookings/* endpoints
│   │
│   ├── catering/                    # Catering Service Management
│   │   ├── models/
│   │   │   ├── catering_business.py # CateringBusiness (1:1 with VendorProfile)
│   │   │   ├── catering_package.py  # CateringPackage (pricing tiers, cuisine types)
│   │   │   ├── catering_menu_item.py # CateringMenuItem (items in a package)
│   │   │   ├── master_food_item.py  # MasterFoodItem (global food catalog)
│   │   │   ├── venue_catering.py    # VenueCatering (links package ↔ venue)
│   │   │   ├── branch.py            # Branch (catering business branches)
│   │   │   └── catering_booking.py  # CateringBooking (customer catering order)
│   │   ├── controllers/             # CRUD ViewSets for all catering entities
│   │   ├── serializers/             # Catering serializers
│   │   ├── services/                # Catering business logic
│   │   ├── repositories/            # Catering DB access
│   │   ├── admin.py                 # Django admin for catering entities
│   │   └── routes/
│   │       └── __init__.py          # /api/v1/catering/* endpoints
│   │
│   ├── decorations/                 # Decoration Service Management
│   │   ├── models/
│   │   │   ├── decoration.py        # DecorationPackage (styles, includes)
│   │   │   ├── decoration_tier.py   # DecorationTier (low/medium/average/high pricing)
│   │   │   └── venue_decoration.py  # VenueDecoration (links package ↔ venue)
│   │   ├── controllers/             # CRUD ViewSets
│   │   ├── serializers/             # Decoration serializers
│   │   ├── services/                # Decoration business logic
│   │   ├── repositories/            # Decoration DB access
│   │   ├── admin.py                 # Django admin for decorations
│   │   └── routes/
│   │       └── __init__.py          # /api/v1/decorations/* endpoints
│   │
│   ├── dj/                          # DJ & Entertainment Service Management
│   │   ├── models/
│   │   │   ├── dj_package.py        # DJPackage (tier, theme, occasion)
│   │   │   ├── dj_equipment.py      # DJEquipment (included + add-on items)
│   │   │   ├── dj_booking_equipment.py # DJBookingEquipment (customer selections)
│   │   │   └── venue_dj.py          # VenueDJ (links DJ package ↔ venue)
│   │   ├── controllers/             # Package browsing, equipment CRUD, quotes
│   │   ├── serializers/             # DJ serializers
│   │   ├── services/                # DJ business logic
│   │   ├── repositories/            # DJ DB access
│   │   └── routes/
│   │       └── __init__.py          # /api/v1/dj/* endpoints
│   │
│   ├── listings/                    # Unified Multi-Category Listings
│   │   ├── models/
│   │   │   ├── base_listing.py      # BaseListing (generic listing with status workflow)
│   │   │   └── category_details.py  # PhotographerDetail, MakeupDetail, PlannerDetail
│   │   ├── controllers/
│   │   │   ├── listing_controller.py # CRUD + type discovery + image upload
│   │   │   └── admin_listings.py    # Admin listing management
│   │   ├── serializers/             # Listing serializers
│   │   ├── services/                # Listing business logic
│   │   ├── repositories/            # Listing DB access
│   │   ├── permissions.py           # IsApprovedVendor for listings
│   │   └── routes/
│   │       └── listing_routes.py    # /api/v1/listings/* endpoints
│   │
│   ├── common/                      # Shared Utilities & Infrastructure
│   │   ├── constants/
│   │   │   └── accounts/
│   │   │       ├── roles.py         # ROLE_CHOICES, VENDOR_TYPES
│   │   │       └── messages.py      # Error/success message constants
│   │   ├── permissions/
│   │   │   └── role_permissions.py  # IsVendor, IsCustomer, IsAdmin, IsApprovedVendor
│   │   ├── pagination/              # StandardPagination (12 items/page)
│   │   ├── responses/               # Standardized API response helpers
│   │   ├── exceptions/              # AppException, NotFoundException, etc.
│   │   ├── utils/                   # General utilities
│   │   └── management/
│   │       └── commands/
│   │           └── seed_all.py      # Unified data seeder
│   │
│   ├── ai_services/                 # AI/LLM Integration Layer [STUB]
│   │   ├── llm_service.py           # OpenAI LLM wrapper
│   │   ├── embedding_service.py     # Text embedding service
│   │   ├── prompt_builder.py        # Prompt template builder
│   │   ├── image_generation_service.py # AI image generation
│   │   └── vector_search_service.py # Vector similarity search
│   │
│   ├── ai_agents/                   # AI Agent System [STUB]
│   │   ├── base_agent.py            # Base agent interface
│   │   ├── venue_agent.py           # Venue recommendation agent
│   │   ├── budget_agent.py          # Budget planning agent
│   │   ├── decor_agent.py           # Decoration suggestion agent
│   │   ├── availability_agent.py    # Availability checking agent
│   │   └── wedding_planner_agent.py # Full planning orchestrator
│   │
│   └── analytics/                   # Analytics Module [MINIMAL]
│       ├── repositories/            # Analytics data access
│       └── services/                # Analytics business logic
│
├── tests/                           # Test Suite
│   ├── accounts/                    # Account/auth tests
│   ├── venues/                      # Venue tests
│   └── dj/                          # DJ module tests
│
├── docs/                            # Documentation (this folder)
├── media/                           # Uploaded files (local dev)
├── manage.py                        # Django management entry point
├── requirements.txt                 # Python dependencies
├── Makefile                         # Build/dev shortcuts
├── schema.yml                       # OpenAPI schema export
└── .env                             # Environment variables
```

## Architecture Pattern

The codebase follows a **layered architecture** consistently across all Django apps:

```
Controller (APIView / ViewSet)
    │  Validates input, calls service, returns standardized response
    ▼
Service
    │  Business logic, authorization checks, orchestration
    ▼
Repository
    │  All ORM queries — no raw SQL, no ORM in controllers
    ▼
Model
    │  Django ORM model definitions, validation, DB schema
    ▼
PostgreSQL
```

This separation ensures:
- Controllers contain **zero** business logic or ORM queries
- Services enforce business rules and coordinate between repositories
- Repositories are the only layer that touches the database
- Models define schema, constraints, and basic validation

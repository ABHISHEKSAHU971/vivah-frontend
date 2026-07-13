# Photographer Vendor Module Implementation Plan

This plan details the implementation of a dedicated, robust Photographer Vendor Module for the PlanMyVivah platform. It includes database schema design, backend logic services, REST API routing, and phase-wise rollouts.

## User Review Required

> [!IMPORTANT]
> **Vendor Relationship Pattern**: We will link `PhotographerProfile` directly to the existing `VendorProfile` model (from `apps.accounts`) using a `OneToOneField`. This aligns with the catering module pattern (`CateringBusiness` OneToOne to `VendorProfile`) rather than subclassing `BaseListing`.
> 
> **Booking Representation**: We will use the `PhotographyQuotation` (with status `ACCEPTED`) and `PhotographyInquiry` (with status `BOOKED`) as the final record of booking, updating the `PhotographerAvailability` calendar dates to `BOOKED`. This avoids duplicating invoice/booking tables.

---

## Open Questions

> [!NOTE]
> 1. **Image Storage Storage Settings**: Do we have an active AWS S3 storage bucket configured for `media_type` uploads (`PhotographerMedia`), or should we fall back to standard local file storage (`MEDIA_ROOT`)? *Assuming standard `django-storages`/local media fallback.*
> 2. **Notification/Email Triggers**: When a quotation is sent or accepted, should we trigger notifications/emails via the existing notification system, or is it out of scope for the MVP? *Assuming standard signals will handle basic notifications if integrated.*

---

## Proposed Changes

### Component: Backend (Django)

We will create a new app `apps/photographers` containing models, controllers, serializers, and services.

---

#### [NEW] [apps/photographers/apps.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/apps.py)
Declares the `PhotographersConfig` Django application.

#### [NEW] [apps/photographers/models/photographer_profile.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photographer_profile.py)
Stores main studio details:
- `vendor` (OneToOne to `VendorProfile`)
- `business_name`, `title`, `slug`, `description`, `starting_price` (Decimal)
- `city`, `state`, `address`, `pincode`
- `years_of_experience`, `team_size`
- `travels_outstation` (Boolean)
- `is_featured`, `is_verified`
- `status` (draft, active, suspended)

#### [NEW] [apps/photographers/models/photographer_branch.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photographer_branch.py)
Multiple physical office support:
- `photographer` (FK to `PhotographerProfile`)
- `branch_name`, `address`, `city`, `state`, `pincode`
- `latitude`, `longitude`, `contact_number`, `is_primary`

#### [NEW] [apps/photographers/models/photographer_media.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photographer_media.py)
Portfolio images and videos:
- `photographer` (FK to `PhotographerProfile`)
- `media_type` (IMAGE/VIDEO)
- `file` (FileField), `thumbnail` (ImageField)
- `title`, `event_type` (WEDDING, PRE_WEDDING, HALDI, MEHNDI, etc.), `is_cover`, `sort_order`

#### [NEW] [apps/photographers/models/photography_service.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photography_service.py)
Dynamic services catalog:
- `photographer` (FK to `PhotographerProfile`)
- `name`, `service_type` (Choices), `description`
- `pricing_type` (PER_DAY, PER_EVENT, FIXED, etc.)
- `base_price` (Decimal), `unit` (Choices)
- `default_discount_type` (PERCENTAGE, FIXED), `default_discount_value` (Decimal)
- `minimum_quantity`, `maximum_quantity`, `is_active`

#### [NEW] [apps/photographers/models/photography_package.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photography_package.py)
Bundled packages and deliverables:
- `PhotographyPackage`: `photographer` (FK), `name`, `slug`, `description`, `base_price`, `discount_type`, `discount_value`, `final_price`, `duration_days`, `is_customizable`, `is_featured`, `is_active`
- `PhotographyPackageItem`: `package` (FK), `service` (FK), `quantity`, `unit_price_override`
- `PackageDeliverable`: `package` (FK), `deliverable_type` (Choices), `name`, `description`, `quantity`, `delivery_timeline_days`

#### [NEW] [apps/photographers/models/photographer_availability.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photographer_availability.py)
Availability calendar blocks:
- `photographer` (FK)
- `date` (DateField)
- `status` (AVAILABLE, BLOCKED, BOOKED)
- Unique constraint on `(photographer_id, date)`

#### [NEW] [apps/photographers/models/photography_inquiry.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photography_inquiry.py)
Client inquiries and events:
- `PhotographyInquiry`: `inquiry_number`, `customer` (FK to User), `photographer` (FK), `package` (FK nullable), `event_city`, `event_state`, `venue_name`, `guest_count`, `budget_min`, `budget_max`, `requirements`, `status`
- `InquiryEvent`: `inquiry` (FK), `event_type`, `event_name`, `event_date`, `start_time`, `end_time`, `venue_name`, `city`, `notes`
- `InquiryServiceItem`: `inquiry` (FK), `service` (FK), `quantity`, `notes`

#### [NEW] [apps/photographers/models/photography_quotation.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photography_quotation.py)
Quotations and snapshots:
- `PhotographyQuotation`: `quotation_number`, `inquiry` (FK), `vendor` (FK), `subtotal`, `discount_amount`, `total_amount`, `booking_amount`, `balance_amount`, `valid_until`, `terms_and_conditions`, `vendor_notes`, `status`
- `QuotationItem`: `quotation` (FK), `service` (FK nullable), `item_name`, `pricing_type`, `quantity`, `unit`, `unit_price`, `discount_type`, `discount_value`, `discount_amount`, `line_subtotal`, `line_total`

#### [NEW] [apps/photographers/models/payment_milestone.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/payment_milestone.py)
Payment schedules:
- `quotation` (FK)
- `name`, `amount`, `percentage`, `due_type` (ON_BOOKING, BEFORE_EVENT, AFTER_EVENT, etc.), `due_date`, `status`

#### [NEW] [apps/photographers/models/photographer_policy.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/models/photographer_policy.py)
Per-vendor terms & rules:
- `photographer` (FK)
- `policy_type` (ALBUM_DELIVERY, RAW_DATA, TRAVEL, etc.), `title`, `content`, `is_active`

#### [NEW] [apps/photographers/services/pricing_service.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/services/pricing_service.py)
Backend-driven calculation engine for items, packages, and quotations using `Decimal`.

#### [NEW] [apps/photographers/services/quotation_service.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/services/quotation_service.py)
Domain logic:
- `create_quotation_from_inquiry`
- `create_quotation_from_package`
- `recalculate_quotation`
- `send_quotation`
- `accept_quotation` (sets dates to booked, generates milestones)

#### [NEW] [apps/photographers/services/availability_service.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/services/availability_service.py)
Validates conflicts and handles calendar blocks.

#### [NEW] [apps/photographers/serializers/photographer_serializer.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/serializers/photographer_serializer.py)
DRF Serializers for listings and branch details.

#### [NEW] [apps/photographers/serializers/service_serializer.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/serializers/service_serializer.py)
DRF Serializers for services and deliverables.

#### [NEW] [apps/photographers/serializers/package_serializer.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/serializers/package_serializer.py)
DRF Serializers for package configurations.

#### [NEW] [apps/photographers/serializers/inquiry_serializer.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/serializers/inquiry_serializer.py)
DRF Serializers for inquiries and inquiry items.

#### [NEW] [apps/photographers/serializers/quotation_serializer.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/serializers/quotation_serializer.py)
DRF Serializers for quotations, line items, and milestones.

#### [NEW] [apps/photographers/controllers/vendor_controllers.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/controllers/vendor_controllers.py)
ViewSets for vendor-facing actions (manage profiles, services, packages, quotations).

#### [NEW] [apps/photographers/controllers/customer_controllers.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/controllers/customer_controllers.py)
ViewSets for customer discovery actions (view listings, portfolios, packages, send inquiries, accept quotations).

#### [NEW] [apps/photographers/routes/__init__.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/apps/photographers/routes/__init__.py)
Routing definitions registering all controllers to the rest router.

#### [MODIFY] [config/settings/base.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/config/settings/base.py)
Append `'apps.photographers.apps.PhotographersConfig'` to `LOCAL_APPS`.

#### [MODIFY] [config/urls.py](file:///C:/Users/91722/Downloads/PlanMyVivah/vivah-backend/Vivah/config/urls.py)
Add URL route for photographers:
```python
path('api/v1/photographers/', include('apps.photographers.routes')),
```

---

## Verification Plan

### Automated Tests
Run unit tests for pricing logic, validation, constraints, and quotation lifecycle:
```bash
python manage.py test apps.photographers
```

### Manual Verification
1. Create a photographer profile using vendor endpoints.
2. Verify endpoints behave correctly for package calculations, portfolio media uploads, and date availability conflicts.
3. Walkthrough the complete flow of Inquiry -> Quotation Creation -> Discount Application -> Acceptance -> Milestones -> Date blocking.

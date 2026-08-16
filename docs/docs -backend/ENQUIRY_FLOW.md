# PlanMyVivah — Enquiry Flow

> Traced from actual codebase. This documents the complete lifecycle of a customer enquiry.

---

## 1. Enquiry Submission Flow

```
Customer opens venue detail page
        ↓
Clicks "Enquire Now" / submits enquiry form
        ↓
POST /api/v1/venues/venue-inquiries/
        ↓
VenueInquirySerializer validates input
        ↓
VenueInquiry record created in database
        ↓
Signal fires (post_save):
  ├── WhatsApp alert → Venue manager phone
  └── Email alert → Platform coordinators
        ↓
Vendor sees inquiry in their inquiry list
Admin sees inquiry in admin panel
Customer sees inquiry in their history
```

---

## 2. Enquiry Creation API

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/venues/venue-inquiries/` |
| **Controller** | `VenueInquiryViewSet.create()` |
| **File** | `apps/venues/controllers/__init__.py` |
| **Serializer** | `VenueInquirySerializer` |
| **Model** | `VenueInquiry` |
| **Permission** | `AllowAny` (anyone can submit — logged in or anonymous) |
| **Status** | **IMPLEMENTED** |

### Important Design Decisions
- **Anonymous enquiries are supported:** The `user` field is nullable. Walk-in or non-registered visitors can submit enquiries.
- **Venue is optional:** The `venue` field is nullable. This supports "individual service" enquiries (e.g., inquiring about a caterer or decorator without a specific venue).
- **Package references:** The enquiry can optionally reference a `catering_package` and `decoration_package` the customer is interested in.

---

## 3. VenueInquiry Model — Complete Field Reference

**Table:** `venue_inquiries` | **Source:** `apps/venues/models/venue_inquiry.py`

| Field | Model | Type | Required | Description |
|---|---|---|---|---|
| `id` | VenueInquiry | BigAutoField (PK) | Auto | Unique identifier |
| `venue` | FK → Venue | ForeignKey | No (nullable) | Target venue (null for individual service inquiries) |
| `user` | FK → User | ForeignKey | No (nullable) | Linked user (null for anonymous/walk-in) |
| `name` | VenueInquiry | CharField(150) | Yes | Customer name |
| `phone` | VenueInquiry | CharField(15) | Yes | Customer phone number |
| `email` | VenueInquiry | EmailField | No | Customer email |
| `location` | VenueInquiry | CharField(255) | No | Preferred event location/area |
| `budget` | VenueInquiry | Decimal(12,2) | No | Estimated budget in INR |
| `rooms_needed` | VenueInquiry | PositiveInteger | No | Number of rooms needed |
| `event_date` | VenueInquiry | DateField | No | Planned event date |
| `event_type` | VenueInquiry | CharField(100) | No | Type of event (wedding, engagement, etc.) |
| `guest_count` | VenueInquiry | PositiveInteger | No | Expected number of guests |
| `catering_package` | FK → CateringPackage | ForeignKey | No (nullable) | Selected catering package |
| `decoration_package` | FK → DecorationPackage | ForeignKey | No (nullable) | Selected decoration package |
| `message` | VenueInquiry | TextField | Yes | Customer message/requirements |
| `status` | VenueInquiry | CharField(20) | Yes | Default: "pending" |
| `created_at` | VenueInquiry | DateTimeField | Auto | Submission timestamp |

---

## 4. Enquiry Status Lifecycle

**Actual status choices** (source: `apps/venues/models/venue_inquiry.py`):

```
┌─────────┐
│ PENDING │  ← Initial status on creation
└────┬────┘
     │
     ▼
┌───────────┐
│ RESPONDED │  ← Vendor/admin has contacted the customer
└────┬──────┘
     │
     ▼
┌────────┐
│ CLOSED │  ← Enquiry resolved (booked, declined, or expired)
└────────┘
```

| Status | DB Value | Display Label | Description |
|---|---|---|---|
| Pending | `pending` | Pending | New enquiry, not yet addressed |
| Responded | `responded` | Responded | Vendor or admin has contacted the customer |
| Closed | `closed` | Closed | Enquiry is resolved |

> **NOT IMPLEMENTED — Enquiry status history is not currently persisted.** There is no audit trail of when status changes occurred or who changed them. The `status` field is a simple overwrite.

> **NOT IMPLEMENTED — Status change API for vendors.** The `status` field is `read_only` in the serializer (`read_only_fields = ['id', 'user', 'status', 'created_at']`). Vendors cannot update enquiry status via API. Status changes can only be made through Django Admin.

---

## 5. Automated Notifications on Enquiry Creation

**Source:** `apps/venues/signals.py`

When a new `VenueInquiry` is created, a Django `post_save` signal triggers:

### 5.1 WhatsApp Alert to Venue Manager

```python
SMSWhatsAppService.send_inquiry_whatsapp_alert(
    phone_number=manager_phone,
    name=inquiry.name,
    event_date=str(inquiry.event_date),
    guest_count=inquiry.guest_count
)
```

| Property | Value |
|---|---|
| **Recipient** | Venue owner's phone number (from `venue.vendor.user.phone`) |
| **Content** | Customer name, event date, guest count |
| **Status** | **IMPLEMENTED BUT NEEDS REVIEW** — `SMSWhatsAppService` exists but actual SMS/WhatsApp API integration is unclear; may only print to console in dev |

### 5.2 Email Alert to Sales Coordinators

| Property | Value |
|---|---|
| **Recipients** | `settings.PLANMYVIVAH_COORDINATORS` (default: `coordinators@planmyvivah.com`) |
| **Subject** | `[PlanMyVivah] New Inquiry Lead for {venue_name}` |
| **Content** | Full inquiry details: name, phone, email, event date, guest count, location, budget, rooms, message |
| **Backend** | Console email in dev (`django.core.mail.backends.console.EmailBackend`) |
| **Status** | **IMPLEMENTED** (console only in dev; production email backend needs configuration) |

### 5.3 Customer Profile Sync

When a logged-in customer submits an enquiry, their `CustomerProfile` is automatically updated:

```python
CustomerService.sync_profile_from_inquiry(user, serializer.validated_data)
```

This syncs fields like `guest_count`, `wedding_date`, `city` from the enquiry to the customer profile for future AI recommendations.

**Status:** **IMPLEMENTED**

---

## 6. Who Can See Enquiries

The `VenueInquiryViewSet.get_queryset()` method controls visibility:

| Role | What They See | Filter Logic |
|---|---|---|
| **Admin** (is_staff or role='admin') | All enquiries across all venues | No filter |
| **Vendor** (has vendor_profile) | Enquiries for their own venues, or enquiries referencing their catering/decoration packages | `venue__vendor=vp OR catering_package__vendor=vp OR decoration_package__vendor=vp` |
| **Customer** (authenticated, not vendor/admin) | Only their own enquiries | `user=request.user` |
| **Unauthenticated** | Nothing | Returns empty queryset |

---

## 7. Enquiry Listing APIs

### For Vendors/Customers

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/venue-inquiries/` |
| **Controller** | `VenueInquiryViewSet.list()` |
| **Permission** | `IsAuthenticated` |
| **Response** | Filtered by role (see above) |
| **Status** | **IMPLEMENTED** |

### For Admin (Dedicated Endpoint)

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/admin/inquiries/` |
| **Controller** | `AdminInquiryController` |
| **File** | `apps/venues/controllers/admin_venues.py` |
| **Permission** | `IsAuthenticated + IsAdmin` |
| **Filters** | `?venue_id=123` — filter by venue |
| **Status** | **IMPLEMENTED** |

### Admin Enquiry Analytics

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/admin/inquiries/analytics/` |
| **Controller** | `AdminInquiryAnalyticsController` |
| **Permission** | `IsAuthenticated + IsAdmin` |
| **Response** | Day-wise count of enquiries |
| **Format** | `[{"date": "2026-08-10", "count": 5}, ...]` |
| **Status** | **IMPLEMENTED** |

---

## 8. What Is Missing in the Enquiry System

| Feature | Status | Notes |
|---|---|---|
| Enquiry status update by vendor | **NOT IMPLEMENTED** | `status` is read_only in serializer |
| Enquiry status history/audit log | **NOT IMPLEMENTED** | No StatusHistory model |
| Vendor reply to enquiry | **NOT IMPLEMENTED** | No reply/comment system |
| Customer notification on status change | **NOT IMPLEMENTED** | No notification system |
| Enquiry-to-booking conversion | **NOT IMPLEMENTED** | No link between VenueInquiry and Booking |
| Follow-up reminders | **NOT IMPLEMENTED** | No scheduled task |
| Enquiry deduplication | **NOT IMPLEMENTED** | Same customer can submit multiple times |
| Enquiry analytics per vendor | **NOT IMPLEMENTED** | Analytics API is admin-only |
| Enquiry export (CSV/PDF) | **NOT IMPLEMENTED** | — |

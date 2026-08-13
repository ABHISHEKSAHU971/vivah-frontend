# PlanMyVivah — Venue Flow

> Traced from actual codebase. Every field, API, and relationship references the real implementation.

---

## 1. Venue Creation Flow

```
Approved Vendor
      ↓
POST /api/v1/venues/venues/
      ↓
VenueWriteSerializer validates input
      ↓
VenueService.create_venue() — business rules
      ↓
VenueRepository.create() — ORM insert
      ↓
Venue record created (is_active=true, is_verified=false)
      ↓
Vendor uploads images
POST /api/v1/venues/venue-images/
      ↓
Admin verifies venue
POST /api/v1/venues/venues/{id}/verify/
      ↓
Venue appears in public listing
```

### Create Venue API

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/venues/venues/` |
| **Controller** | `VenueViewSet.create()` |
| **File** | `apps/venues/controllers/__init__.py` |
| **Serializer** | `VenueWriteSerializer` |
| **Service** | `VenueService.create_venue()` |
| **Repository** | `VenueRepository.create()` |
| **Permission** | `VenuePermission` (authenticated + approved vendor) |
| **Status** | **IMPLEMENTED** |

### Business Rules (Enforced in Service)
- Vendor must have completed onboarding (VendorProfile exists)
- Vendor must be approved (`is_approved = true`)
- `vendor` field is injected server-side — cannot be set by client
- `min_capacity` must be less than `max_capacity`
- System fields (`avg_rating`, `total_bookings`, `is_verified`) cannot be set by client

---

## 2. Venue Model — Complete Field Reference

**Table:** `venues` | **Source:** `apps/venues/models/venue.py`

### Basic Information

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | — | Primary key |
| `vendor` | FK → VendorProfile | Yes | — | Owner vendor |
| `listing` | OneToOne → BaseListing | No | null | Unified listing reference |
| `name` | CharField(255) | Yes | — | Venue display name |
| `venue_type` | CharField(50) | Yes | — | Type of venue (see choices) |
| `description` | TextField | Yes | — | Detailed description |

### Venue Type Choices

| Value | Display Label |
|---|---|
| `wedding_garden` | Wedding Garden |
| `banquet_hall` | Banquet Hall |
| `resort` | Resort |
| `farmhouse` | Farmhouse |
| `hotel` | Hotel |
| `party_hall` | Party Hall |
| `outdoor` | Outdoor Venue |

### Location

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `city` | CharField(100) | Yes | — | City |
| `state` | CharField(100) | Yes | "Madhya Pradesh" | State |
| `address` | TextField | Yes | — | Full address |
| `pincode` | CharField(10) | No | — | Postal code |
| `latitude` | Decimal(9,6) | No | null | GPS latitude |
| `longitude` | Decimal(9,6) | No | null | GPS longitude |

### Capacity & Rooms

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `min_capacity` | PositiveInteger | Yes | 50 | Minimum guest capacity |
| `max_capacity` | PositiveInteger | Yes | — | Maximum guest capacity |
| `num_ac_rooms` | PositiveInteger | Yes | 0 | Number of AC rooms |
| `num_non_ac_rooms` | PositiveInteger | Yes | 0 | Number of non-AC rooms |
| `num_halls` | PositiveInteger | Yes | 0 | Number of banquets/halls |

### Pricing

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `price_per_day` | Decimal(10,2) | Yes | — | Base venue hire charge per day |
| `min_price` | Decimal(12,2) | No | null | Lowest seasonal/monthly price |
| `avg_price` | Decimal(12,2) | No | null | Average price across seasons |
| `max_price` | Decimal(12,2) | No | null | Peak season price |

### Service Policies

These fields indicate what services the venue provides and whether outside vendors are allowed:

| Field | Type | Choices | Purpose |
|---|---|---|---|
| `decoration_policy` | CharField(10) | `none` / `inhouse` / `both` | Decoration service availability |
| `catering_policy` | CharField(10) | `none` / `inhouse` / `both` | Catering service availability |
| `dj_policy` | CharField(10) | `none` / `inhouse` / `both` | DJ service availability |
| `planner_policy` | CharField(10) | `none` / `inhouse` / `both` | Event planner availability |

**Policy values:**
- `none` — Not Available
- `inhouse` — In-House Only (venue provides it, no outside vendors)
- `both` — In-House + Outside Allowed

### Amenities

| Field | Type | Default | Purpose |
|---|---|---|---|
| `has_parking` | Boolean | false | Parking available |
| `has_accommodation` | Boolean | false | Accommodation available |
| `is_ac` | Boolean | false | Air-conditioned |
| `is_outdoor` | Boolean | false | Outdoor venue |

### Status & Metrics

| Field | Type | Default | Purpose |
|---|---|---|---|
| `is_active` | Boolean | true | Soft-delete flag |
| `is_verified` | Boolean | false | Admin verification status |
| `avg_rating` | Decimal(3,2) | 0.0 | Average customer rating (system-managed) |
| `total_bookings` | PositiveInteger | 0 | Total booking count (system-managed) |

### Timestamps

| Field | Type | Purpose |
|---|---|---|
| `created_at` | DateTimeField | Auto-set on creation |
| `updated_at` | DateTimeField | Auto-set on every save |

### Database Indexes

| Index Name | Fields | Purpose |
|---|---|---|
| `venue_city_idx` | `city` | City-based filtering |
| `venue_type_idx` | `venue_type` | Type-based filtering |
| `venue_active_verified_idx` | `is_active`, `is_verified` | Active+verified listing queries |
| `venue_search_idx` | `city`, `venue_type`, `is_active` | Composite search optimization |

---

## 3. Venue Image Management

**Table:** `venue_images` | **Source:** `apps/venues/models/venue_image.py`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | Primary key |
| `venue` | FK → Venue | Yes | Parent venue |
| `image` | ImageField | Yes | Upload to `venues/images/` |
| `is_primary` | Boolean | No | Default: false — primary image for listings |
| `caption` | CharField(200) | No | Image caption |
| `order` | PositiveInteger | No | Default: 0 — display order |
| `created_at` | DateTimeField | Auto | Upload timestamp |

**API:** `POST /api/v1/venues/venue-images/` (ModelViewSet)
**Permission:** Owner vendor or admin only
**Status:** **IMPLEMENTED**

---

## 4. Venue Deals (Promotional Pricing)

**Table:** `venue_deals` | **Source:** `apps/venues/models/venue_deal.py`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | Primary key |
| `venue` | FK → Venue | Yes | Parent venue |
| `title` | CharField(150) | Yes | Default: "Best Deal" |
| `start_date` | DateField | Yes | Deal visibility start |
| `end_date` | DateField | Yes | Deal visibility end |
| `original_price` | Decimal(12,2) | No | Copied from venue.price_per_day |
| `discounted_price` | Decimal(12,2) | Yes | Promotional price |
| `is_active` | Boolean | — | Default: true |
| `notes` | TextField | No | Admin/vendor notes |

**Validation:**
- `end_date` must be after `start_date`
- `discounted_price` must be less than `original_price`
- Auto-calculates `discount_percent()` for display

**API:** `POST /api/v1/venues/venue-deals/` (ModelViewSet)
**Status:** **IMPLEMENTED**

---

## 5. Vendor Rooms

**Table:** `vendor_rooms` | **Source:** `apps/venues/models/vendor_room.py`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | Primary key |
| `venue` | FK → Venue | Yes | Parent venue |
| `name` | CharField(150) | Yes | e.g., "Deluxe Suite", "AC Room" |
| `capacity` | PositiveInteger | Yes | Default: 2 (persons) |
| `price_per_night` | Decimal(10,2) | No | Room pricing |
| `total_rooms` | PositiveInteger | Yes | Default: 0 |
| `amenities` | JSONField | No | e.g., `["ac", "tv", "wifi", "hot_water"]` |
| `is_active` | Boolean | — | Default: true |

**API:** `POST /api/v1/venues/vendor-rooms/` (ModelViewSet)
**Status:** **IMPLEMENTED**

---

## 6. Venue Listing (Public Catalog)

### How Venues Appear in the Public Listing

```
Vendor creates venue → is_active = true, is_verified = false
      ↓
Admin verifies → is_verified = true (optional — listing works without verification)
      ↓
GET /api/v1/venues/venues/ returns all where is_active = true
      ↓
Customer sees paginated list with filters & search
```

> **Important:** The public listing API filters by `is_active=True` only. `is_verified` is NOT required for a venue to appear in the listing. Verification is an optional trust signal displayed in the UI.

### List Venues API

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/venues/` |
| **Controller** | `VenueViewSet.list()` |
| **Serializer** | `VenueListSerializer` (lightweight) |
| **Permission** | `AllowAny` (public) |
| **Pagination** | `StandardPagination` — 12 per page |
| **Status** | **IMPLEMENTED** |

### Available Filters

| Parameter | Type | Description |
|---|---|---|
| `city` | String | Partial match on city name |
| `venue_type` | String | Exact match (e.g., `wedding_garden`) |
| `min_capacity` | Integer | Minimum guests needed |
| `max_capacity` | Integer | Maximum guests needed |
| `guests` | String | Range format: "600-1000 guests" |
| `has_parking` | Boolean | Filter venues with parking |
| `has_accommodation` | Boolean | Filter venues with accommodation |
| `is_ac` | Boolean | Filter AC venues |
| `is_outdoor` | Boolean | Filter outdoor venues |
| `min_price` | Number | Minimum price_per_day |
| `max_price` | Number | Maximum price_per_day |
| `decoration_policy` | String | none / inhouse / both |
| `catering_policy` | String | none / inhouse / both |
| `dj_policy` | String | none / inhouse / both |
| `search` | String | Full-text search (name, city, description) |
| `ordering` | String | price_per_day, avg_rating, total_bookings, created_at (prefix with `-` for desc) |

### What Customer Sees on Venue Listing Card

Fields returned by `VenueListSerializer`:

| Field | Source | Description |
|---|---|---|
| `id` | Venue.id | Unique identifier |
| `name` | Venue.name | Venue display name |
| `venue_type` | Venue.venue_type | Type of venue |
| `city` | Venue.city | City |
| `state` | Venue.state | State |
| `min_capacity` | Venue.min_capacity | Minimum guests |
| `max_capacity` | Venue.max_capacity | Maximum guests |
| `price_per_day` | Venue.price_per_day | Base daily hire |
| `min_price` | Venue.min_price | Lowest price |
| `avg_price` | Venue.avg_price | Average price |
| `max_price` | Venue.max_price | Peak price |
| `decoration_policy` | Venue | Service policy |
| `catering_policy` | Venue | Service policy |
| `dj_policy` | Venue | Service policy |
| `planner_policy` | Venue | Service policy |
| `has_parking` | Venue | Amenity flag |
| `has_accommodation` | Venue | Amenity flag |
| `is_ac` | Venue | Amenity flag |
| `is_outdoor` | Venue | Amenity flag |
| `avg_rating` | Venue.avg_rating | Customer rating |
| `total_bookings` | Venue.total_bookings | Popularity metric |
| `is_verified` | Venue.is_verified | Trust badge |
| `primary_image` | Computed | URL of primary image (or first image) |
| `discount_label` | Computed | e.g., "Save 20%" from active deals |

---

## 7. Venue Detail Page

### Detail API

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/venues/{id}/` |
| **Controller** | `VenueViewSet.retrieve()` |
| **Serializer** | `VenueDetailSerializer` (full) |
| **Permission** | `AllowAny` (public) |
| **Status** | **IMPLEMENTED** |

### What Customer Sees on Venue Detail

#### Basic Information
- Venue name, type, description
- Vendor business name (`vendor_name`)
- Verification badge (`is_verified`)
- Rating and booking count

#### Location
- City, state, full address, pincode
- Latitude/longitude (for map display — **map UI NOT IMPLEMENTED**)

#### Capacity & Rooms
- Min/max guest capacity
- Number of AC rooms, non-AC rooms, halls

#### Pricing
- Base price per day
- Min/avg/max seasonal pricing
- **Pricing breakdown API available** (gated for unauthenticated users)

#### Service Policies
- Decoration policy
- Catering policy
- DJ policy
- Planner policy

#### Amenities
- Parking, accommodation, AC, outdoor

#### Images
- Full image gallery with captions and ordering

#### NOT displayed (not in serializer):
- ❌ Reviews/ratings list — **NOT IMPLEMENTED**
- ❌ Availability calendar — **NOT IMPLEMENTED** (model exists, no public API)
- ❌ Linked catering/decoration/DJ packages in detail — **PARTIALLY IMPLEMENTED** (data exists, not in venue detail serializer)

---

## 8. Venue Pricing Breakdown

### Pricing Breakdown API

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/venues/venues/{id}/pricing-breakdown/` |
| **Controller** | `VenuePricingBreakdownController` |
| **Permission** | `AllowAny` (but response varies by auth status) |
| **Status** | **IMPLEMENTED** |

#### Unauthenticated Response (Gated):
```json
{
  "gated": true,
  "starting_rent": 50000.0,
  "starting_veg_plate": 350.0
}
```

#### Authenticated Response (Full Breakdown):
```json
{
  "gated": false,
  "venue_rent": 50000.0,
  "catering_total": 175000.0,
  "decor_total": 45000.0,
  "royalty": 13500.0,
  "gst": 51030.0,
  "total": 334530.0
}
```

**Calculation:**
- Subtotal = venue_rent + catering_total + decor_total
- Royalty = subtotal × 5%
- GST = (subtotal + royalty) × 18%
- Total = subtotal + royalty + GST

---

## 9. Venue Admin Verification

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/venues/venues/{id}/verify/` |
| **Controller** | `VenueViewSet.verify()` |
| **Service** | `VenueService.verify_venue()` |
| **Permission** | `IsAuthenticated` + admin check |
| **Effect** | Sets `is_verified = true` |
| **Status** | **IMPLEMENTED** |

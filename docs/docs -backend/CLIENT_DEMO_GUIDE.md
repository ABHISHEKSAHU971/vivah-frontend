# PlanMyVivah — Client Demo Guide

> Step-by-step instructions for demonstrating the platform to clients, investors, or stakeholders.

---

## Pre-Demo Setup

### 1. Start the Backend

```bash
# Navigate to project
cd d:\PlanMyvivah\celebrationplatform

# Create/activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or use .env file)
set DJANGO_SETTINGS_MODULE=config.settings.development
set DATABASE_URL=postgresql://postgres:password@localhost:5434/planMyVivah

# Run migrations
python manage.py migrate

# Seed demo data (admin + food catalog + caterers + DJ)
python manage.py seed_all

# Start server
python manage.py runserver
```

### 2. Verify Server

| Check | URL | Expected |
|---|---|---|
| Admin panel | http://localhost:8000/admin/ | Django admin login page |
| API docs | http://localhost:8000/api/docs/ | Swagger UI |
| Health check | http://localhost:8000/api/v1/venues/venues/ | JSON response with venues list |

---

## Demo Script

### Act 1: "The Customer Journey"

#### Scene 1: Vendor Discovery

> Show the public browsing experience — no login required.

```
# List all active venues (public, no auth)
GET http://localhost:8000/api/v1/venues/venues/
```

**Talking Points:**
- "The platform serves as a curated marketplace for wedding venues"
- "Customers can browse without creating an account"
- "Each listing shows venue type, capacity, pricing, amenities, and a trust badge"

```
# Filter by city
GET http://localhost:8000/api/v1/venues/venues/?city=Indore

# Filter by capacity
GET http://localhost:8000/api/v1/venues/venues/?min_capacity=200&max_capacity=500

# Filter by amenities
GET http://localhost:8000/api/v1/venues/venues/?has_parking=true&is_ac=true

# Full-text search
GET http://localhost:8000/api/v1/venues/venues/?search=garden

# Sort by price
GET http://localhost:8000/api/v1/venues/venues/?ordering=price_per_day
```

**Talking Points:**
- "12 powerful filter parameters for precise venue discovery"
- "Full-text search across venue names, cities, and descriptions"
- "Results are paginated — 12 venues per page"

---

#### Scene 2: Gated Pricing (Lead Capture)

```
# Unauthenticated user sees starting prices only
GET http://localhost:8000/api/v1/venues/venues/{venue_id}/pricing-breakdown/
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "gated": true,
    "starting_rent": 50000.0,
    "starting_veg_plate": 350.0
  },
  "message": "Authentication required to view detailed quote."
}
```

**Talking Points:**
- "We show starting prices to attract interest, but gate detailed quotes behind phone verification"
- "This is our lead capture mechanism — every serious inquiry gives us a verified phone number"

---

#### Scene 3: Phone Verification

```
# Send 4-digit OTP for pricing unlock
POST http://localhost:8000/api/v1/auth/otp/send/
Body: { "phone": "+919999999999" }

# Response includes dev_otp for demo
# Verify the OTP
POST http://localhost:8000/api/v1/auth/otp/verify/
Body: { "phone": "+919999999999", "otp_code": "1234" }
```

**Talking Points:**
- "Frictionless entry — just a phone number, no password needed"
- "In production, OTP is delivered via SMS/WhatsApp"
- "The system creates a customer account automatically"

---

#### Scene 4: Detailed Pricing Breakdown

```
# Now authenticated — sees full breakdown
GET http://localhost:8000/api/v1/venues/venues/{venue_id}/pricing-breakdown/?guest_count=300
Authorization: Bearer {access_token}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "gated": false,
    "venue_rent": 50000.0,
    "catering_total": 105000.0,
    "decor_total": 45000.0,
    "royalty": 10000.0,
    "gst": 37800.0,
    "total": 247800.0
  }
}
```

**Talking Points:**
- "Dynamic pricing calculator that factors in guest count, catering, decoration"
- "5% platform royalty is transparent — the customer sees exactly what they're paying"
- "18% GST is auto-calculated on the total"

---

#### Scene 5: Submit Enquiry

```
POST http://localhost:8000/api/v1/venues/venue-inquiries/
Body: {
  "venue": 1,
  "name": "Rahul Sharma",
  "phone": "+919999999999",
  "email": "rahul@example.com",
  "event_date": "2026-12-15",
  "event_type": "Wedding Reception",
  "guest_count": 300,
  "budget": 500000,
  "rooms_needed": 5,
  "message": "Looking for a venue with garden setup for winter wedding."
}
```

**Talking Points:**
- "The enquiry captures all key data points for the vendor"
- "Enquiries can reference specific catering and decoration packages"
- "Instant notification: vendor gets a WhatsApp alert, our coordinators get an email"
- "The customer's profile is automatically enriched with wedding details"

---

### Act 2: "The Vendor Experience"

#### Scene 1: Vendor Registration & Onboarding

```
# 1. Register with phone
POST http://localhost:8000/api/v1/auth/send-otp/
Body: { "phone": "+918888888888", "role": "vendor" }

# 2. Verify OTP
POST http://localhost:8000/api/v1/auth/verify-otp/
Body: { "phone": "+918888888888", "otp_code": "123456" }

# 3. Complete onboarding
POST http://localhost:8000/api/v1/auth/vendor/onboard/
Authorization: Bearer {access_token}
Body: {
  "full_name": "Rajesh Patel",
  "vendor_type": "venue",
  "business_name": "Royal Garden Palace",
  "city": "Indore",
  "description": "Premium wedding venue with 5-acre garden and 3 banquet halls"
}
```

**Talking Points:**
- "Three-step vendor onboarding — designed for mobile"
- "Support for 9 vendor types: venue, caterer, decorator, DJ, planner, photographer, outfit, makeup"
- "GSTIN validation for business compliance"

---

#### Scene 2: Create a Venue

```
POST http://localhost:8000/api/v1/venues/venues/
Authorization: Bearer {vendor_access_token}
Body: {
  "name": "Royal Garden Palace",
  "venue_type": "wedding_garden",
  "description": "5-acre lush green garden with 3 banquet halls",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "address": "AB Road, Indore",
  "min_capacity": 200,
  "max_capacity": 1000,
  "price_per_day": 75000,
  "has_parking": true,
  "has_accommodation": true,
  "is_ac": true,
  "catering_policy": "both",
  "decoration_policy": "both",
  "dj_policy": "inhouse"
}
```

---

#### Scene 3: View Incoming Enquiries

```
GET http://localhost:8000/api/v1/venues/venue-inquiries/
Authorization: Bearer {vendor_access_token}
```

**Talking Points:**
- "Vendors only see enquiries for their own venues — strict data isolation"
- "Each enquiry shows customer name, phone, event date, guest count, budget"

---

### Act 3: "The Admin Dashboard"

#### Scene 1: Admin Login

```
POST http://localhost:8000/api/v1/auth/admin/login/
Body: {
  "email": "abhishek.coder2001@gmail.com",
  "password": "123456789"
}
```

---

#### Scene 2: Review Pending Vendors

```
# List unapproved vendors
GET http://localhost:8000/api/v1/auth/admin/approvals/?is_approved=false
Authorization: Bearer {admin_access_token}

# Approve a vendor
POST http://localhost:8000/api/v1/auth/admin/approvals/{profile_id}/
Authorization: Bearer {admin_access_token}
Body: { "is_approved": true }
```

---

#### Scene 3: Enquiry Analytics

```
GET http://localhost:8000/api/v1/venues/admin/inquiries/analytics/
Authorization: Bearer {admin_access_token}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "analytics": [
      {"date": "2026-08-10", "count": 5},
      {"date": "2026-08-09", "count": 3}
    ]
  }
}
```

---

#### Scene 4: Django Admin Panel

Navigate to http://localhost:8000/admin/ and show:

1. **Users** — phone-based user list with role filtering
2. **Vendor Profiles** — approve/reject with custom admin actions
3. **Catering Packages** — managed packages with tier pricing
4. **Master Food Items** — 140+ items in the food catalog

---

### Act 4: "The Catering Deep-Dive"

```
# Browse catering packages
GET http://localhost:8000/api/v1/catering/catering-packages/

# Browse food catalog
GET http://localhost:8000/api/v1/catering/master-food-items/

# View catering businesses
GET http://localhost:8000/api/v1/catering/catering-businesses/
```

**Talking Points:**
- "140+ master food items cataloged with course type, veg/non-veg, Jain, spicy flags"
- "Packages support material/without-material pricing"
- "Weekend and festival surcharge built into the pricing model"

---

### Act 5: "The DJ Experience"

```
# Browse DJ packages
GET http://localhost:8000/api/v1/dj/packages/

# View equipment in a package
GET http://localhost:8000/api/v1/dj/packages/1/equipment/

# Get a live price quote
POST http://localhost:8000/api/v1/dj/equipment/quote/
Body: {
  "package_id": 1,
  "equipment_selections": [
    {"equipment_id": 7, "quantity": 1},
    {"equipment_id": 8, "quantity": 2}
  ]
}
```

**Talking Points:**
- "Equipment is split into included items and chargeable add-ons"
- "Customers can customize their DJ package and get a real-time quote"
- "Inventory tracking ensures we don't oversell"

---

## Post-Demo Talking Points

### Platform Differentiators
1. **Gated pricing model** — captures qualified leads while providing value
2. **5% royalty model** — transparent commission that aligns incentives
3. **Modular service architecture** — venues, catering, decoration, DJ are independently manageable but can be bundled
4. **AI-ready architecture** — agent stubs in place for venue recommendations, budget planning, decoration suggestions

### Roadmap Items (Not Yet Built)
1. Online booking with Razorpay payment
2. AI-powered venue recommendations
3. Vendor chat/messaging
4. Review and rating system
5. Push notifications
6. Mobile app frontend (React Native)

### Technical Highlights
1. Clean layered architecture (Controller → Service → Repository → Model)
2. Role-based + object-level permissions
3. OpenAPI/Swagger documentation auto-generated
4. 92 features fully implemented, 10 AI stubs ready for activation

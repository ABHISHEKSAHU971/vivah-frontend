# PlanMyVivah — Vendor Flow

> Traced from actual codebase. Every step references the real file, model, API endpoint, and implementation status.

---

## 1. Vendor Registration Flow

```
Customer/Vendor opens app
        ↓
Enters phone number + selects role = "vendor"
        ↓
POST /api/v1/auth/send-otp/
        ↓
Receives 6-digit OTP (currently printed to console — no SMS gateway)
        ↓
POST /api/v1/auth/verify-otp/
        ↓
JWT tokens (access + refresh) returned
User record created with role = "vendor"
        ↓
Frontend redirected to onboarding
        ↓
POST /api/v1/auth/vendor/onboard/
        ↓
VendorProfile created (is_approved = false)
        ↓
Vendor profile under admin review
        ↓
Admin approves → is_approved = true
        ↓
Vendor can now create venues & services
```

---

### Step 1: Send OTP

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/auth/send-otp/` |
| **Controller** | `SendOTPController` |
| **File** | `apps/accounts/controllers/auth_controller.py` |
| **Serializer** | `SendOTPSerializer` — fields: `phone`, `role` (customer/vendor) |
| **Service** | `AuthService.send_otp()` → `OTPVerificationService.generate_and_send_otp()` |
| **Models** | `User` (get_or_create), `OTPVerification` |
| **Permission** | `AllowAny` |
| **Response** | `is_new_user`, `requires_onboarding`, `dev_otp` (dev only) |
| **Status** | **IMPLEMENTED** |

**Business Rules:**
- If user doesn't exist, creates a new `User` with the specified role
- If user exists but role is different, updates role to vendor
- OTP is 6 digits, expires in 10 minutes
- OTP hash is stored (not plaintext) in `otp_verifications` table
- **SMS/WhatsApp delivery: NOT IMPLEMENTED** — OTP is printed to console

---

### Step 2: Verify OTP

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/auth/verify-otp/` |
| **Controller** | `VerifyOTPController` |
| **File** | `apps/accounts/controllers/auth_controller.py` |
| **Serializer** | `VerifyOTPSerializer` — fields: `phone`, `otp_code` (6 digits) |
| **Service** | `AuthService.verify_otp()` |
| **Response** | `access` (JWT), `refresh` (JWT), `needs_onboarding` (bool), `user` object |
| **Permission** | `AllowAny` |
| **Status** | **IMPLEMENTED** |

**Business Rules:**
- Validates OTP against hashed value in `otp_verifications`
- Marks OTP as verified
- Marks user as `is_verified = true`
- Returns `needs_onboarding = true` if user is vendor without a VendorProfile
- Issues JWT access token (24h) and refresh token (30 days)

---

### Step 3: Vendor Onboarding

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/auth/vendor/onboard/` |
| **Controller** | `VendorOnboardController` |
| **File** | `apps/accounts/controllers/vendor_controller.py` |
| **Serializer** | `VendorOnboardSerializer` |
| **Service** | `VendorService.onboard()` |
| **Models** | `User` (updated), `VendorProfile` (created) |
| **Permission** | `IsAuthenticated` |
| **Status** | **IMPLEMENTED** |

**Onboarding Fields:**

| Field | Required | Type | Validation |
|---|---|---|---|
| `full_name` | Yes | CharField(150) | — |
| `email` | No | EmailField | — |
| `vendor_type` | Yes | Choice | venue, decorator, caterer, dj, planner, photographer, outfit, makeup, other |
| `business_name` | Yes | CharField(255) | — |
| `description` | No | TextField | — |
| `city` | Yes | CharField(100) | — |
| `state` | No | CharField(100) | Default: "Madhya Pradesh" |
| `address` | No | TextField | — |
| `gstin` | No | CharField(15) | Must be exactly 15 chars, auto-uppercased |

**Business Rules:**
- Only users with `role = vendor` can onboard
- Cannot onboard twice — use PATCH to update existing profile
- Creates `VendorProfile` with `is_approved = false`
- Updates `User.full_name` and `User.email` from onboard data

---

### Step 4: Upload Logo

| Property | Value |
|---|---|
| **Endpoint** | `POST /api/v1/auth/vendor/logo/` |
| **Controller** | `VendorLogoController` |
| **File** | `apps/accounts/controllers/vendor_controller.py` |
| **Serializer** | `VendorLogoSerializer` |
| **Service** | `VendorService.upload_logo()` |
| **Permission** | `IsVendor` |
| **Validation** | Max 2MB, JPEG/PNG/WebP only |
| **Storage** | `vendor_logos/` directory |
| **Status** | **IMPLEMENTED** |

---

### Step 5: Check Approval Status

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/auth/vendor/status/` |
| **Controller** | `VendorStatusController` |
| **File** | `apps/accounts/controllers/vendor_controller.py` |
| **Service** | `VendorService.get_status()` |
| **Permission** | `IsVendor` |
| **Status** | **IMPLEMENTED** |

**Response structure:**
```json
{
  "onboarded": true,
  "is_approved": false,
  "business_name": "My Wedding Garden",
  "vendor_type": "venue",
  "rejection_reason": null,
  "message": "Your account is under review."
}
```

**Status messages:**
- Not onboarded → "Please complete onboarding."
- Pending review → "Your account is under review."
- Approved → "Your account is active and approved."
- Rejected → "Your application was not approved. See rejection_reason for details."

---

## 2. Vendor Profile Management

### Retrieve Profile

| Property | Value |
|---|---|
| **Endpoint** | `GET /api/v1/auth/vendor/profile/` |
| **Controller** | `VendorProfileController` |
| **Permission** | `IsVendor` |
| **Status** | **IMPLEMENTED** |

### Update Profile

| Property | Value |
|---|---|
| **Endpoint** | `PATCH /api/v1/auth/vendor/profile/` |
| **Controller** | `VendorProfileController` |
| **Serializer** | `VendorProfileUpdateSerializer` |
| **Updatable Fields** | full_name, email, business_name, description, city, state, address, gstin |
| **Permission** | `IsVendor` |
| **Status** | **IMPLEMENTED** |

---

## 3. Vendor Dashboard Capabilities

Once approved, a vendor can:

### Venue Management
- ✅ Create venues (`POST /api/v1/venues/venues/`)
- ✅ List own venues (`GET /api/v1/venues/venues/my-venues/`)
- ✅ Update own venues (`PATCH /api/v1/venues/venues/{id}/`)
- ✅ Soft-delete own venues (`DELETE /api/v1/venues/venues/{id}/`)
- ✅ Upload venue images (`POST /api/v1/venues/venue-images/`)
- ✅ Manage venue deals (`POST /api/v1/venues/venue-deals/`)
- ✅ Manage vendor rooms (`POST /api/v1/venues/vendor-rooms/`)

### Inquiry Management
- ✅ View inquiries for own venues (`GET /api/v1/venues/venue-inquiries/`)
- ❌ Update inquiry status — **NOT IMPLEMENTED** (no vendor-side status update endpoint)
- ❌ Reply to inquiries — **NOT IMPLEMENTED**

### Service Linking
- ✅ Link catering packages to venues (`POST /api/v1/catering/venue-caterings/`)
- ✅ Link decoration packages to venues (`POST /api/v1/decorations/venue-decorations/`)
- ✅ Link DJ packages to venues (`POST /api/v1/dj/packages/`)
- ✅ Manage DJ equipment (`POST /api/v1/dj/vendor/equipment/`)

### Booking Management
- ✅ Manage blocked dates (`POST /api/v1/bookings/blocked-dates/`)
- ✅ Manage venue availability (`POST /api/v1/bookings/venue-availabilitys/`)

### What's Missing for Vendors
- ❌ Vendor dashboard summary API (aggregate stats)
- ❌ Notification system
- ❌ Revenue/earning tracking
- ❌ Chat/messaging with customers
- ❌ Booking confirmation workflow
- ❌ Review/rating management

---

## 4. VendorProfile Model (Database)

**Table:** `vendor_profiles`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | BigAutoField (PK) | Auto | Primary key |
| `user_id` | FK → User | Yes | One-to-one link to User |
| `vendor_type` | CharField(20) | Yes | Type of vendor business |
| `business_name` | CharField(255) | Yes | Business display name |
| `description` | TextField | No | Business description |
| `city` | CharField(100) | Yes | City of operation |
| `state` | CharField(100) | Yes | Default: "Madhya Pradesh" |
| `address` | TextField | No | Full address |
| `gstin` | CharField(15) | No | GST Identification Number |
| `logo` | ImageField | No | Business logo (`vendor_logos/`) |
| `is_approved` | BooleanField | — | Default: false. Set by admin. |
| `rejection_reason` | TextField | No | Populated by admin on rejection |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Source:** `apps/accounts/models/vendor_profile.py`

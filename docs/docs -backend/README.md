# PlanMyVivah — Technical Documentation

> **Version:** 1.0 | **Generated:** August 2026 | **Source:** Actual codebase audit

---

## About PlanMyVivah

PlanMyVivah is an AI-powered wedding and event planning marketplace connecting customers with verified vendors across venues, catering, decoration, DJ, photography, makeup, and event planning services. Built with Django 4.2, Django REST Framework, PostgreSQL, and SimpleJWT authentication.

**Target Market:** Indian wedding market (primarily Madhya Pradesh)  
**Revenue Model:** 5% platform royalty + 18% GST on bookings  
**Current Stage:** Backend API complete, no frontend in this repository

---

## Documentation Index

| # | Document | Description |
|---|---|---|
| 1 | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Executive summary, technology stack, user roles, deployment configuration |
| 2 | [MODULE_HIERARCHY.md](MODULE_HIERARCHY.md) | Complete file tree with every app, model, controller, service, and repository |
| 3 | [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) | Layered architecture, authentication flow, middleware, signal system (Mermaid diagrams) |
| 4 | [DATABASE_ER_DIAGRAM.md](DATABASE_ER_DIAGRAM.md) | Full entity-relationship diagram with every model and foreign key (Mermaid ERD) |
| 5 | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Every API endpoint with method, URL, permission, and controller reference |
| 6 | [PERMISSIONS_MATRIX.md](PERMISSIONS_MATRIX.md) | Complete endpoint × role access matrix (anonymous, customer, vendor, admin) |
| 7 | [CUSTOMER_FLOW.md](CUSTOMER_FLOW.md) | Customer registration, browsing, gated pricing, enquiry submission |
| 8 | [VENDOR_FLOW.md](VENDOR_FLOW.md) | Vendor registration, onboarding, venue creation, profile management |
| 9 | [VENUE_FLOW.md](VENUE_FLOW.md) | Venue CRUD, images, deals, rooms, pricing breakdown, filters, listing |
| 10 | [ENQUIRY_FLOW.md](ENQUIRY_FLOW.md) | Enquiry lifecycle, notifications, role-based visibility, analytics |
| 11 | [ADMIN_PANEL.md](ADMIN_PANEL.md) | Django admin configuration, custom admin APIs, vendor approval workflow |
| 12 | [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | Feature-by-feature audit: 92 implemented, 8 partial, 10 stubs, 32 not implemented |
| 13 | [CLIENT_DEMO_GUIDE.md](CLIENT_DEMO_GUIDE.md) | Step-by-step demo script with API calls and talking points |

---

## Quick Links

### For Developers
- **API Reference:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Architecture:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
- **Database Schema:** [DATABASE_ER_DIAGRAM.md](DATABASE_ER_DIAGRAM.md)
- **Permissions:** [PERMISSIONS_MATRIX.md](PERMISSIONS_MATRIX.md)

### For Business/Product
- **Overview:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **What's Built:** [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- **Demo Script:** [CLIENT_DEMO_GUIDE.md](CLIENT_DEMO_GUIDE.md)

### For User Flows
- **Customer Journey:** [CUSTOMER_FLOW.md](CUSTOMER_FLOW.md)
- **Vendor Journey:** [VENDOR_FLOW.md](VENDOR_FLOW.md)
- **Enquiry Lifecycle:** [ENQUIRY_FLOW.md](ENQUIRY_FLOW.md)

---

## Implementation Summary

```
┌─────────────────────────────────────────────┐
│          IMPLEMENTATION SCORECARD            │
├─────────────────────────┬───────────────────┤
│ ✅ Fully Implemented    │ 92 features       │
│ 🟡 Partially Implemented│  8 features       │
│ 🔲 Stub (placeholder)   │ 10 features       │
│ ❌ Not Implemented       │ 32 features       │
├─────────────────────────┼───────────────────┤
│ Total Features Tracked  │ 142               │
│ Implementation Rate     │ 65% complete      │
│ Backend Readiness       │ 70% production    │
└─────────────────────────┴───────────────────┘
```

### What Works Today
- ✅ Phone OTP authentication with JWT
- ✅ Complete venue CRUD with 12+ filters and search
- ✅ Vendor onboarding and admin approval workflow
- ✅ Enquiry submission with WhatsApp + email alerts
- ✅ Gated pricing with dynamic breakdown (royalty + GST)
- ✅ Full catering system (packages, menu, business, bookings)
- ✅ DJ equipment management with live pricing quotes
- ✅ Decoration packages with tiered pricing
- ✅ Multi-category listings (photographer, makeup, planner)
- ✅ Role-based + object-level permission system
- ✅ OpenAPI/Swagger documentation
- ✅ Seed data for demo (admin, 140+ food items, caterers, DJ)

### What Needs Building
- ❌ Online payment (Razorpay configured but not wired)
- ❌ AI recommendations (stubs exist, no integration)
- ❌ Review/rating system
- ❌ Push notifications
- ❌ Vendor chat/messaging
- ❌ Customer favourites
- ❌ Booking confirmation workflow
- ❌ SMS/WhatsApp OTP delivery

---

## Methodology

This documentation was generated through a systematic codebase audit:

1. **File-by-file inspection** of every Django model, controller, serializer, service, repository, route, permission, signal, and admin configuration
2. **Cross-referencing** model fields against serializer fields against API endpoints
3. **Evidence-based status** — every "IMPLEMENTED" claim is backed by actual code; every "NOT IMPLEMENTED" was verified by searching the entire codebase
4. **No assumptions** — if a feature would "make sense" architecturally but the code doesn't exist, it is marked as NOT IMPLEMENTED

---

## How to Use This Documentation

1. **New developer onboarding:** Start with [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) → [MODULE_HIERARCHY.md](MODULE_HIERARCHY.md) → [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
2. **API integration:** Use [API_DOCUMENTATION.md](API_DOCUMENTATION.md) + [PERMISSIONS_MATRIX.md](PERMISSIONS_MATRIX.md)
3. **Client presentation:** Follow the [CLIENT_DEMO_GUIDE.md](CLIENT_DEMO_GUIDE.md) script
4. **Sprint planning:** Use [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) to identify gaps
5. **Database design review:** Refer to [DATABASE_ER_DIAGRAM.md](DATABASE_ER_DIAGRAM.md)

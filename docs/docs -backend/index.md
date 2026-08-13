# CelebrationPlatform — Documentation Index

> **Generated:** 2026-06-14 | **Scan Level:** Deep (full source-read)  
> **Project:** `celebrationplatform` (PlanMyVivah)

---

## Project Overview

- **Type:** Monolith Django REST API Backend
- **Primary Language:** Python 3.x
- **Architecture:** Controller → Service → Repository
- **Framework:** Django 4.2.13 + DRF 3.15.1

---

## Quick Reference

| Item | Value |
|---|---|
| Tech Stack | Django + DRF + PostgreSQL + Redis + Celery + OpenAI |
| Auth | Phone OTP → JWT (SimpleJWT) |
| API Base | `/api/v1/` |
| API Docs | `/api/docs/` (Swagger UI) |
| User Roles | `customer`, `vendor`, `admin` |
| Vendor Types | venue, decorator, caterer, dj, planner, photographer, outfit, makeup |
| Django Apps | accounts, venues, bookings, catering, decorations, dj, ai_agents, ai_services, analytics, common |
| Time Zone | `Asia/Kolkata` |
| OTP Expiry | 10 minutes |
| JWT Access | 1 day |
| JWT Refresh | 30 days |

---

## Generated Documentation

| Document | Description |
|---|---|
| [Project Overview](./project-overview.md) | Executive summary, tech stack table, app map, key config values |
| [Architecture](./architecture.md) | Detailed architecture, all apps, auth flow, security, deployment |
| [Source Tree Analysis](./source-tree-analysis.md) | Annotated directory tree, critical paths, entry points |
| [Data Models](./data-models-celebrationplatform.md) | All database tables, columns, types, relationships, ER overview |
| [API Contracts](./api-contracts-celebrationplatform.md) | All endpoints, request/response examples, status codes |
| [Development Guide](./development-guide-celebrationplatform.md) | Setup, env vars, commands, testing, troubleshooting |

---

## API Endpoints at a Glance

### Authentication (`/api/v1/auth/`)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/send-otp/` | Public | Initiate phone OTP |
| POST | `/verify-otp/` | Public | Verify OTP → get JWT tokens |
| POST | `/token/refresh/` | Public | Rotate refresh token |
| POST | `/logout/` | Auth | Blacklist refresh token |
| GET/PATCH | `/me/` | Auth | Get/update user profile |
| POST | `/onboard/` | Auth | Register as vendor |
| GET/PATCH | `/profile/` | Vendor | Vendor profile management |
| POST | `/logo/` | Vendor | Upload vendor logo |
| GET | `/status/` | Vendor | Approval status check |

### Venues (`/api/v1/venues/`)

| Resource | Endpoints | Notes |
|---|---|---|
| `venues/` | CRUD ViewSet | Public read, Vendor write |
| `venue-images/` | CRUD ViewSet | Image upload |
| `venue-inquirys/` | CRUD ViewSet | Customer inquiries |
| `venue-deals/` | CRUD ViewSet | Promotional pricing |
| `vendor-rooms/` | CRUD ViewSet | Accommodation rooms |

### Bookings (`/api/v1/bookings/`)

| Resource | Endpoints | Notes |
|---|---|---|
| `venue-availabilitys/` | CRUD ViewSet | Per-date availability |
| `blocked-dates/` | CRUD ViewSet | Date range blocking |

### Services (`/api/v1/catering/`, `/api/v1/decorations/`, `/api/v1/dj/`)

| App | Resources |
|---|---|
| Catering | `catering-packages/`, `catering-menu-items/`, `venue-caterings/` |
| Decorations | `decoration-packages/`, `decoration-tiers/`, `venue-decorations/` |
| DJ | `dj-packages/`, `dj-equipments/`, `venue-djs/` |

---

## Data Model Summary

| Table | Model | App |
|---|---|---|
| `users` | User | accounts |
| `vendor_profiles` | VendorProfile | accounts |
| `venues` | Venue | venues |
| `venue_availability` | VenueAvailability | venues |
| `venue_inquiries` | VenueInquiry | venues |
| `venue_deals` | VenueDeal | venues |
| `vendor_rooms` | VendorRoom | venues |
| `venue_blocked_dates` | BlockedDate | venues |
| `catering_packages` | CateringPackage | venues |
| `decoration_packages` | DecorationPackage | venues |
| `dj_packages` | DJPackage | venues |

---

## AI System

| Component | Purpose |
|---|---|
| `WeddingPlannerAgent` | End-to-end wedding planning via GPT-4o-mini |
| `VenueAgent` | Venue recommendations with live database context |
| `BudgetAgent` | Budget estimation and breakdown |
| `DecorationAgent` | Decoration style and theme recommendations |
| `AvailabilityAgent` | Venue availability guidance |
| `LLMService` | OpenAI GPT-4o-mini wrapper |
| `ImageGenerationService` | DALL-E image generation |
| `EmbeddingService` | Text embeddings for semantic search |

---

## Getting Started (New Developer)

1. **Read** [Development Guide](./development-guide-celebrationplatform.md) for full setup instructions
2. **Understand** [Architecture](./architecture.md) to know how the code is structured
3. **Explore** [Data Models](./data-models-celebrationplatform.md) to understand the database
4. **Test APIs** via [API Contracts](./api-contracts-celebrationplatform.md) + Swagger at `/api/docs/`

**Quick start:**
```bash
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
# Edit .env with your DATABASE_URL and OPENAI_API_KEY
python manage.py sync_tables
python manage.py runserver
```

---

## Important Architectural Notes

> [!IMPORTANT]
> Migrations are **disabled** for all apps. Schema is managed via `python manage.py sync_tables` or direct SQL.

> [!NOTE]
> `CateringPackage`, `DecorationPackage`, and `DJPackage` models declare `app_label = 'venues'`. This is an intentional (if unusual) design choice that co-locates their tables under the venues schema space.

> [!TIP]
> The `VenueAgent` AI agent enriches its context with **live venue data** from the database before calling the LLM — making it the most powerful AI agent for venue matching.

> [!NOTE]
> PostgreSQL is configured on **port 5434** (not the default 5432) in the local `.env`. Adjust if your local Postgres runs on a different port.

# PlanMyVivah — Project Overview

## Executive Summary

**PlanMyVivah** is an AI-powered wedding and event planning platform built for the Indian market (primarily Madhya Pradesh). It connects customers planning weddings and celebrations with verified vendors who offer venues, catering, decoration, DJ/entertainment, photography, makeup, and event planning services.

The platform operates as a **B2B2C marketplace** — vendors list their services and venues, the platform team verifies and approves them, and customers discover, compare, and enquire about these services through a unified digital experience.

> **Current Stage:** The backend API is substantially built with Django REST Framework. No standalone frontend application exists in this repository — the system is designed as a headless API consumed by a separate React Native mobile app and/or web frontend.

---

## Business Objective

1. **For Customers:** Simplify wedding planning by providing a curated, searchable catalog of verified venues and service providers with transparent pricing, easy enquiry submission, and (future) AI-powered recommendations.

2. **For Vendors:** Provide a digital storefront to showcase venues, packages, and services; receive and manage customer enquiries; and track bookings — replacing fragmented phone/WhatsApp-based lead management.

3. **For Platform (PlanMyVivah):** Earn revenue through a **5% royalty** on bookings plus GST, while building a data-rich marketplace that enables AI-driven matchmaking and pricing intelligence.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.x |
| Framework | Django | 4.2.13 |
| API Layer | Django REST Framework | 3.15.1 |
| Authentication | SimpleJWT (OTP-based) | 5.3.1 |
| Database | PostgreSQL | — |
| API Documentation | drf-spectacular (OpenAPI/Swagger) | 0.27.2 |
| File Storage | Local / AWS S3 (via django-storages) | — |
| Task Queue | Celery (configured, usage minimal) | 5.3.6 |
| Cache | Redis / django-redis (configured) | 5.0.4 |
| Payment Gateway | Razorpay (configured, not fully wired) | 1.4.1 |
| AI/LLM | OpenAI (configured, agent stubs exist) | 1.30.1 |
| Phone Validation | django-phonenumber-field | 7.3.0 |
| CORS | django-cors-headers | 4.3.1 |
| OTP Library | pyotp | 2.9.0 |
| Image Processing | Pillow | 10.3.0 |
| Production Server | Gunicorn | 22.0.0 |

---

## User Roles

The platform defines **three user roles** (source: `apps/common/constants/accounts/roles.py`):

| Role | Description | Authentication |
|---|---|---|
| **Customer** | End-user planning a wedding/event. Browses venues, submits enquiries. | Phone OTP (6-digit) |
| **Vendor** | Business owner listing venues/services. Manages enquiries and packages. | Phone OTP (6-digit) + Onboarding |
| **Admin** | Platform operator. Approves vendors, manages all data. | Email + Password |

### Vendor Types

Vendors are further classified (source: `apps/common/constants/accounts/roles.py`):

- Venue Owner
- Decorator
- Caterer
- DJ
- Event Planner
- Photographer
- Outfit Rental
- Makeup Artist
- Other

---

## Geographic Focus

The platform currently defaults to **Madhya Pradesh, India** (default state in models). Key cities referenced in seed data include **Indore** and **Bhopal**.

---

## Deployment Configuration

| Setting | Value |
|---|---|
| Default DB | `postgresql://postgres:password@localhost:5434/planMyVivah` |
| Media Storage | Local filesystem (`/media/`) or S3 (`USE_S3` env var) |
| CORS Origins | `http://localhost:3000`, `http://localhost:8081` |
| Time Zone | `Asia/Kolkata` |
| JWT Access Lifetime | 1 day |
| JWT Refresh Lifetime | 30 days |
| Pagination | 12 items per page (StandardPagination) |
| API Docs | `/api/docs/` (Swagger UI) |
| Admin Panel | `/admin/` (Django Admin) |

---

## What This Document Set Covers

This documentation package explains:

1. What exists in the current codebase (not aspirational features)
2. How each user role interacts with the system
3. The complete data model and relationships
4. Every API endpoint with its purpose and authentication
5. The enquiry lifecycle from customer to vendor to admin
6. What is implemented vs. partially implemented vs. missing
7. A step-by-step demo guide for client presentations

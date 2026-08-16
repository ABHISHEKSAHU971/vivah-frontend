# CelebrationPlatform — Development Guide

> **Last Updated:** 2026-06-14

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.10+ | Recommended |
| PostgreSQL | 14+ | Running on port 5434 (local default) |
| Redis | 6+ | For caching and Celery |
| Git | Any | |

---

## 1. Clone & Set Up Virtual Environment

```bash
# Clone the repo
git clone <repo-url>
cd celebrationplatform

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Copy and edit the `.env` file:

```bash
# .env (already present in repo for dev)
SECRET_KEY=django-insecure-change-in-production-local-dev-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,*
DATABASE_URL=postgresql://postgres:password@localhost:5434/planMyVivah
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
OPENAI_API_KEY=sk-your-openai-key-here
USE_S3=False
```

**Required env vars:**

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `DATABASE_URL` | PostgreSQL connection URL |
| `CORS_ALLOWED_ORIGINS` | Frontend origins (comma-separated) |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) |
| `USE_S3` | `False` for local file storage |
| `RAZORPAY_KEY_ID` | Razorpay key (for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |

---

## 4. Set Up Database

The project uses PostgreSQL. Migrations are **disabled** (`MIGRATION_MODULES = None`), so schema is created via the custom `sync_tables` command.

```bash
# Ensure PostgreSQL is running at port 5434
# manage.py will auto-create the 'planMyVivah' database if it doesn't exist

# Sync database tables (creates all tables from models)
python manage.py sync_tables

# OR apply standard Django migrations (if sync_tables unavailable)
# python manage.py migrate
```

> **Note:** `manage.py` automatically attempts to create the database if it doesn't exist when running `runserver`, `migrate`, `sync_tables`, or `check`.

---

## 5. Create Admin Superuser

```bash
python manage.py createsuperuser
```

When prompted, enter a phone number in E.164 format (e.g., `+919876543210`) and a password.

---

## 6. Run the Development Server

```bash
python manage.py runserver
```

The server starts at: `http://127.0.0.1:8000/`

- **API Base:** `http://127.0.0.1:8000/api/v1/`
- **Swagger Docs:** `http://127.0.0.1:8000/api/docs/`
- **Admin Panel:** `http://127.0.0.1:8000/admin/`

---

## 7. Run Celery Worker (for async tasks)

```bash
# In a separate terminal, with venv activated
celery -A config worker -l info
```

Celery uses Redis as broker. Make sure Redis is running:

```bash
# Windows (via WSL or Redis for Windows)
redis-server

# macOS
brew services start redis
```

---

## Common Management Commands

```bash
# Check project health
python manage.py check

# Sync database schema
python manage.py sync_tables

# Create a superuser
python manage.py createsuperuser

# Shell with Django context
python manage.py shell

# Collect static files (for production)
python manage.py collectstatic
```

---

## Running Tests

```bash
# Run all tests
python manage.py test apps

# Run specific app tests
python manage.py test apps.accounts
python manage.py test apps.venues

# Run with verbosity
python manage.py test apps -v 2
```

Test files are located in `apps/<app>/tests/` directories.

---

## API Testing

### Using Swagger UI

1. Start the dev server: `python manage.py runserver`
2. Open `http://127.0.0.1:8000/api/docs/`
3. Use the "Authorize" button to add your JWT token

### Quick Auth Flow (curl)

```bash
# 1. Send OTP
curl -X POST http://localhost:8000/api/v1/auth/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# 2. Verify OTP (get tokens)
curl -X POST http://localhost:8000/api/v1/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'

# 3. Use access token
curl -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Project Structure Quick Reference

```
apps/accounts/    → Auth + Vendor management
apps/venues/      → Venue catalog
apps/bookings/    → Availability calendar
apps/catering/    → Catering packages
apps/decorations/ → Decoration packages
apps/dj/          → DJ packages
apps/ai_agents/   → AI chatbot agents
apps/ai_services/ → LLM/AI infrastructure
apps/analytics/   → Platform analytics
apps/common/      → Shared utilities
config/           → Django settings + URL config
```

---

## Settings Modules

| Setting Module | Use When |
|---|---|
| `config.settings.development` | Local development (default in manage.py) |
| `config.settings.production` | Production deployment |

Override settings module:
```bash
DJANGO_SETTINGS_MODULE=config.settings.production python manage.py runserver
```

---

## AI Features Setup

AI agents require an OpenAI API key:

1. Get a key from https://platform.openai.com/
2. Add to `.env`: `OPENAI_API_KEY=sk-your-key`
3. The platform uses `gpt-4o-mini` model for cost efficiency

**AI Agents available:**
- `WeddingPlannerAgent` — full event planning assistant
- `VenueAgent` — venue recommendations (with live DB data)
- `BudgetAgent` — budget estimation
- `DecorationAgent` — decor theme suggestions
- `AvailabilityAgent` — date/availability guidance

---

## Environment-Specific Notes

### Development
- `DEBUG=True` — detailed error pages
- Media files served locally from `media/` directory
- CORS allows `localhost:3000` and `localhost:8081`
- PostgreSQL on port `5434` (non-standard — check your local setup)

### Production
- `DEBUG=False`
- Media/static files served from S3 (`USE_S3=True`)
- Gunicorn as WSGI server
- Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` appropriately

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `database "planMyVivah" does not exist` | manage.py auto-creates it; ensure Postgres is running |
| `redis.exceptions.ConnectionError` | Start Redis server before running Celery |
| `Invalid phone number` | Phone must be E.164 format: `+91XXXXXXXXXX` |
| `401 Unauthorized` on API | Add `Authorization: Bearer <token>` header |
| `403 Forbidden` on vendor endpoint | User must have `role=vendor` AND `is_approved=True` |
| OpenAI error | Add valid `OPENAI_API_KEY` to `.env` |

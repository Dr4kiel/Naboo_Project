# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Naboo** (Note et Analyse du Budget Organisé et Optimisé) is a personal budget management app. Users track expenses, plan budgets, view transaction history, and generate financial reports.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript, Vite, Tailwind CSS, ShadcnUI |
| Backend | PHP Laravel, Laravel Sanctum (auth) |
| Database | PostgreSQL |
| Containerization | Docker (3 services: `naboo-front`, `naboo-api`, `naboo-db`) |
| CI/CD | GitHub Actions |

## Project Structure

```
Naboo_Project/
├── front/          # React + TypeScript + Vite frontend
├── back/           # Laravel PHP backend
├── docs/           # Project documentation
│   └── GOOD_PRACTICES.md
├── docker-compose.yml
└── README.md
```

## Development Commands

### Docker (full stack)

```bash
docker compose up -d          # Start all services (front, api, db)
docker compose down           # Stop all services
docker compose logs -f api    # Follow API logs
```

### Backend (Laravel — run inside `back/`)

```bash
composer install              # Install PHP dependencies
php artisan serve             # Dev server (without Docker)
php artisan migrate           # Run database migrations
php artisan migrate:fresh --seed  # Reset DB and seed
php artisan test              # Run all tests
php artisan test --filter TestName  # Run a single test
php artisan make:model ModelName -mcr --api  # Generate model + migration + API controller
php artisan route:list        # List all registered routes
php artisan install:api       # Install Sanctum + publish config + personal_access_tokens migration
```

### Frontend (run inside `front/`)

```bash
npm install       # Install JS dependencies
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # Run ESLint
npm test          # Run tests
```

## Architecture

### Backend (Laravel — MVC)
- **Routes** → `routes/api.php` (all API routes, prefixed with `/api`)
- **Controllers** → `app/Http/Controllers/` (thin controllers, delegate to services)
- **Models** → `app/Models/` (Eloquent ORM, PostgreSQL)
- **Services** → `app/Services/` (business logic layer)
- **Requests** → `app/Http/Requests/` (validation)
- Authentication via Laravel Sanctum (token-based SPA auth)

### Frontend (React)
- Functional components only
- Components organized by feature/domain, not by type
- Tailwind CSS for styling, ShadcnUI for reusable components
- **Mobile-first**: all UI designed for mobile, scaled up for desktop

### Database
- PostgreSQL via Docker (`naboo-db`, port 5432)
- Credentials in `.env` (never hardcoded); docker-compose uses `postgres/postgres` for local dev only

## Key Design Decisions

- **Mobile-first**: The homepage must be minimal — quick access to create a transaction and view the current budget.
- **API-only backend**: Laravel serves JSON only; no Blade views (except possibly `/`).
- **SPA authentication**: Laravel Sanctum issues tokens consumed by the React frontend.
- **Input validation**: All user input validated server-side in Laravel Form Requests.

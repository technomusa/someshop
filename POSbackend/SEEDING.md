# Seeding and running the local backend

This document explains how to run the migrations and seeders we updated so the front-end can fetch realistic demo data.

Prerequisites
- PHP (as required by your Laravel version)
- Composer
- A configured database and `.env` pointing to it

Quick commands

1. Install dependencies (if not already):

```bash
composer install
```

2. Run migrations and seeders (this will reset the DB):

```bash
# optionally backup existing DB first
php artisan migrate:fresh --seed
```

3. Run the backend server locally (default port 8000):

```bash
php artisan serve --port=8001
```

Notes
- `DatabaseSeeder` now runs `ShopSeeder`, `ProductSeeder`, and `InventorySeeder` (plus existing catalog seeders).
- `ProductSeeder` creates products and also creates matching `inventories` for the first `Shop` found.
- If you don't want to reset the DB, run `php artisan db:seed` instead.

Front-end
- From `posfrontend/` run:

```bash
npm install
npm run dev
```

- The front-end expects the API base URL in `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://127.0.0.1:8001/api`).

If you want, I can run a quick smoke-check script (non-blocking) to verify endpoints, or add a tiny endpoint that returns seeded counts (products/customers/inventories). Let me know which you'd prefer.

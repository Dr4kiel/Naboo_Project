#!/bin/sh
set -e

# ── Bootstrap .env ────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
    echo "[entrypoint] No .env found — copying .env.example"
    cp .env.example .env
    php artisan key:generate --no-interaction
fi

# ── Writable directories ──────────────────────────────────────────────────────
mkdir -p \
    storage/logs \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache

chmod -R 777 storage bootstrap/cache

# ── Package discovery (writes bootstrap/cache/packages.php) ──────────────────
php artisan package:discover --no-interaction

# ── Wait for PostgreSQL ───────────────────────────────────────────────────────
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "[entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT}..."
until nc -z "$DB_HOST" "$DB_PORT"; do
    printf '.'
    sleep 1
done
echo " ready."

# ── Migrate ───────────────────────────────────────────────────────────────────
php artisan migrate --force --no-interaction

# ── Storage symlink (idempotent) ──────────────────────────────────────────────
php artisan storage:link --no-interaction 2>/dev/null || true

# ── Start dev server ──────────────────────────────────────────────────────────
echo "[entrypoint] Starting Laravel on 0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000

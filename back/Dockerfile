FROM php:8.4-cli

# System deps + PHP extensions
RUN apt-get update && apt-get install -y \
        libpq-dev \
        unzip \
        netcat-openbsd \
        cron \
    && docker-php-ext-install \
        pdo_pgsql \
        bcmath \
        pcntl \
        opcache \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (layer cache: only re-runs when lock file changes)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --prefer-dist

# Copy application source
COPY . .

# Install crontab for the Laravel scheduler
COPY crontab-laravel /etc/cron.d/laravel-scheduler
RUN chmod 0644 /etc/cron.d/laravel-scheduler

# Generate optimized autoloader (no artisan, no DB needed)
RUN composer dump-autoload --optimize --no-scripts

EXPOSE 8000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

FROM php:8.4-cli-alpine

# php-extension-installer — gère les deps OS automatiquement (Alpine-version-agnostic)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# System deps + PHP extensions
RUN apk add --no-cache unzip \
    && install-php-extensions \
        pdo_pgsql \
        bcmath \
        pcntl \
        opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (layer cache: only re-runs when lock file changes)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --prefer-dist

# Copy application source
COPY . .

# Generate optimized autoloader (no artisan, no DB needed)
RUN composer dump-autoload --optimize --no-scripts

EXPOSE 8000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

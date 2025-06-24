#!/bin/bash

# Run migrations
php artisan migrate --force

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start cron for scheduler
cron

# Substitute $PORT in nginx.conf for Render.com compatibility
export PORT=${PORT:-80}
envsubst '$PORT' < /etc/nginx/sites-available/default > /etc/nginx/sites-available/default.subst
mv /etc/nginx/sites-available/default.subst /etc/nginx/sites-available/default

# Start Supervisor (for queue worker and others)
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

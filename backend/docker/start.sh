#!/bin/bash

# Run migrations
php artisan migrate --force

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start cron for scheduler
cron

# Start Supervisor (for queue worker and others)
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

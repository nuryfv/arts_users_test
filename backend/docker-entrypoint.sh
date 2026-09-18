#!/bin/sh
set -e

# Render y Railway asignan el puerto por la variable PORT; Apache escucha
# en 80 por defecto, asi que hay que alinearlo antes de arrancar.
PUERTO="${PORT:-80}"
sed -i "s/^Listen .*/Listen ${PUERTO}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]\+>/<VirtualHost *:${PUERTO}>/" /etc/apache2/sites-available/000-default.conf

# Migraciones al desplegar, solo si se pide explicitamente.
if [ "${RUN_MIGRATIONS}" = "true" ]; then
    echo "Aplicando migraciones..."
    php spark migrate --all
fi

# Carga inicial de datos de ejemplo, solo si se pide explicitamente.
if [ "${RUN_SEED}" = "true" ]; then
    echo "Cargando datos de ejemplo..."
    php spark db:seed UserSeeder
fi

exec "$@"

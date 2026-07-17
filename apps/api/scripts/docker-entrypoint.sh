#!/bin/sh
set -e

echo "🚀 Iniciando Excepio API..."

# Función para verificar si PostgreSQL está listo
wait_for_postgres() {
  echo "⏳ Esperando a que PostgreSQL esté listo..."
  until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ PostgreSQL está listo"
}

# Función para verificar si las tablas existen
check_tables_exist() {
  echo "SELECT 1 FROM \"User\" LIMIT 1" | npx prisma db execute --stdin > /dev/null 2>&1
  return $?
}

# Función para verificar si hay usuarios usando un marker file
# Si el seed ya se ejecutó, crea un archivo .seeded
check_already_seeded() {
  [ -f /app/apps/api/.seeded ]
  return $?
}

mark_as_seeded() {
  touch /app/apps/api/.seeded
}

# Esperar a PostgreSQL
wait_for_postgres

# Verificar si necesita migración
if ! check_tables_exist; then
  echo "🔄 Primera ejecución detectada. Ejecutando migraciones..."
  npx prisma migrate deploy
  echo "✅ Migraciones completadas"
  
  echo "🌱 Ejecutando seed inicial..."
  ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
  echo "✅ Seed completado"
else
  echo "📦 Base de datos ya migrada"
  echo "📊 Omitiendo seed (tablas ya existen)."
fi

echo "🎯 Iniciando servidor NestJS..."
exec node dist/src/main.js

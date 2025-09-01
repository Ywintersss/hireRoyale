#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Resetting database and applying migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run start

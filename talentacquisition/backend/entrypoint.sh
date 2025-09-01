#!/bin/sh
set -e

echo "Resetting database and applying migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run start

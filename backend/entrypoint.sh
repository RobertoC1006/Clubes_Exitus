#!/bin/sh

# exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for database to be ready..."

# We use prisma generate and migrate
# Depending on the environment, you might want prisma migrate dev or deploy.
# For a "professor opening the repo", migrate dev --name init might be easier if they want to see the DB structure.
# But deploy is safer for existing schemas.
# Let's try to run deploy first. If it fails due to connection, we retry.

until npx prisma db push; do
  echo "Database is not ready yet - retrying in 5 seconds..."
  sleep 5
done

echo "Database is ready."

echo "Starting the application..."
npm run start:prod

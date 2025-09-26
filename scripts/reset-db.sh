#!/bin/bash

# StartResume.io Database Reset Script
# This script completely cleans the database

echo "🚨 DATABASE RESET SCRIPT"
echo "========================"
echo "⚠️  WARNING: This will DELETE ALL DATA!"
echo ""

# Check if we're in development
if [ "$NODE_ENV" = "production" ]; then
    echo "❌ BLOCKED: Cannot run in production environment"
    exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | xargs)
elif [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "❌ No environment file found (.env.local or .env)"
    exit 1
fi

echo "🔍 Environment: ${NODE_ENV:-development}"
echo ""

# Confirmation
read -p "❓ Type 'RESET' to delete all data: " confirmation

if [ "$confirmation" != "RESET" ]; then
    echo "❌ Reset cancelled"
    exit 1
fi

echo ""
echo "🧹 Resetting database..."

# Try to use the SQL script directly with psql if available
if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    echo "🔄 Using direct SQL execution..."
    psql "$DATABASE_URL" -f scripts/clean-database.sql
elif [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "🔄 Using Node.js cleanup script..."
    node scripts/run-database-cleanup.js
else
    echo "❌ No database connection method available"
    echo "   Need either DATABASE_URL for psql or Supabase credentials"
    exit 1
fi

echo ""
echo "✅ Database reset completed!"
echo "💡 All user data has been removed"

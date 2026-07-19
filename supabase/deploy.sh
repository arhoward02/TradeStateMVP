#!/bin/bash
# Supabase deployment script

echo "Deploying Supabase migrations..."
echo ""

if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found!"
    echo "Install: https://supabase.com/docs/guides/cli"
    exit 1
fi

if ! supabase projects list &> /dev/null; then
    echo "Not logged in to Supabase!"
    echo "Run: supabase login"
    exit 1
fi

echo "Applying database migrations..."
supabase db push

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Enable Google provider in Supabase Dashboard -> Authentication -> Providers"
echo "2. Add redirect URLs: http://localhost:3000 and https://tradestate.io"
echo "3. Configure Google OAuth credentials in Supabase"

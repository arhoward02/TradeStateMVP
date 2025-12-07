#!/bin/bash
# Supabase Edge Functions Deployment Script

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase!"
    echo "Please run: supabase login"
    exit 1
fi

echo "📦 Deploying oauth-initiate function..."
supabase functions deploy oauth-initiate --no-verify-jwt

echo "📦 Deploying oauth-callback function..."
supabase functions deploy oauth-callback --no-verify-jwt

echo "📦 Deploying tradovate-proxy function..."
supabase functions deploy tradovate-proxy --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment secrets if not already done:"
echo "   supabase secrets set TRADOVATE_CLIENT_ID=your_client_id"
echo "   supabase secrets set TRADOVATE_CLIENT_SECRET=your_client_secret"
echo "   supabase secrets set TRADOVATE_REDIRECT_URI=http://localhost:3000/callback"
echo "   supabase secrets set TRADOVATE_ENVIRONMENT=demo"
echo "   supabase secrets set SUPABASE_URL=your_supabase_url"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "2. Test the functions:"
echo "   - Navigate to your app and try OAuth flow"
echo "   - Check logs: supabase functions logs oauth-callback"
echo ""




# Supabase Edge Functions Deployment Script (PowerShell)

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Please install it first: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase!" -ForegroundColor Red
    Write-Host "Please run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Deploying oauth-initiate function..." -ForegroundColor Green
supabase functions deploy oauth-initiate --no-verify-jwt

Write-Host "📦 Deploying oauth-callback function..." -ForegroundColor Green
supabase functions deploy oauth-callback --no-verify-jwt

Write-Host "📦 Deploying tradovate-proxy function..." -ForegroundColor Green
supabase functions deploy tradovate-proxy --no-verify-jwt

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment secrets if not already done:"
Write-Host "   supabase secrets set TRADOVATE_CLIENT_ID=your_client_id" -ForegroundColor Yellow
Write-Host "   supabase secrets set TRADOVATE_CLIENT_SECRET=your_client_secret" -ForegroundColor Yellow
Write-Host "   supabase secrets set TRADOVATE_REDIRECT_URI=http://localhost:3000/callback" -ForegroundColor Yellow
Write-Host "   supabase secrets set TRADOVATE_ENVIRONMENT=demo" -ForegroundColor Yellow
Write-Host "   supabase secrets set SUPABASE_URL=your_supabase_url" -ForegroundColor Yellow
Write-Host "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test the functions:" -ForegroundColor Cyan
Write-Host "   - Navigate to your app and try OAuth flow"
Write-Host "   - Check logs: supabase functions logs oauth-callback"
Write-Host ""




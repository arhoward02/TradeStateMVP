# Supabase deployment script (PowerShell)

Write-Host "Deploying Supabase migrations..." -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Supabase!" -ForegroundColor Red
    Write-Host "Run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Applying database migrations..." -ForegroundColor Green
supabase db push

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Enable Google provider in Supabase Dashboard -> Authentication -> Providers"
Write-Host "2. Add redirect URLs: http://localhost:3000 and https://tradestate.io"
Write-Host "3. Configure Google OAuth credentials in Supabase"

# Start Strela AI on the RTX 5090 PC: install deps if needed, build web, run gateway.
# Usage (from repo folder):  .\scripts\start.ps1
# Messages are in English on purpose: Windows PowerShell 5.1 breaks non-ASCII in scripts.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Check($what) { if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: $what" -ForegroundColor Red; exit 1 } }

# 1. Stop an old gateway if it is still running on port 8787.
$old = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
if ($old) {
    Step "Stopping old gateway (pid $($old.OwningProcess))"
    Stop-Process -Id $old.OwningProcess -Force
    Start-Sleep -Seconds 1
}

# 2. Is the model engine running? (console text stays neutral: no engine or model names)
try {
    $v = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/version' -TimeoutSec 3
    Write-Host "Model engine is running" -ForegroundColor Green
} catch {
    Write-Host 'WARNING: model engine is not responding. Start it from the Start menu, then run start again.' -ForegroundColor Yellow
}

# 3. Dependencies (first run only; update.ps1 reinstalls when package-lock changes).
if (-not (Test-Path 'node_modules')) {
    Step 'npm ci (first run, takes a minute)'
    npm ci
    Check 'npm ci'
}

# 4. Local settings.
if (-not (Test-Path 'apps/gateway/.env')) {
    Copy-Item 'apps/gateway/.env.example' 'apps/gateway/.env'
    Write-Host 'Created apps/gateway/.env from .env.example'
}

# 5. Build web and start gateway (serves the site + API on http://localhost:8787).
Step 'Building web'
npm run build
Check 'npm run build'

Step 'Starting gateway. Open http://localhost:8787  (Ctrl+C to stop)'
npm start

# Update Strela AI from git and restart. Usage (from repo folder):  .\scripts\update.ps1
# Messages are in English on purpose: Windows PowerShell 5.1 breaks non-ASCII in scripts.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Check($what) { if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: $what" -ForegroundColor Red; exit 1 } }

# Stop the running gateway first: Windows locks files in node_modules while it runs, so npm ci would fail.
$old = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
if ($old) {
    Write-Host "`n==> Stopping running gateway (pid $($old.OwningProcess))" -ForegroundColor Cyan
    Stop-Process -Id $old.OwningProcess -Force
    Start-Sleep -Seconds 1
}

$before = git rev-parse --short HEAD
$lockBefore = (Get-FileHash 'package-lock.json').Hash

Write-Host "`n==> git pull" -ForegroundColor Cyan
git pull --ff-only
Check 'git pull (local changes? run: git status)'

$after = git rev-parse --short HEAD
$lockAfter = (Get-FileHash 'package-lock.json').Hash
Write-Host "commit: $before -> $after"
git log --oneline "$before..$after"

if ($lockBefore -ne $lockAfter -or -not (Test-Path 'node_modules')) {
    Write-Host "`n==> Dependencies changed: npm ci" -ForegroundColor Cyan
    npm ci
    Check 'npm ci'
}

$version = (Select-String -Path 'packages/shared/src/version.ts' -Pattern "'(.+)'").Matches[0].Groups[1].Value
Write-Host "`nVersion now: $version" -ForegroundColor Green

& "$PSScriptRoot\start.ps1"

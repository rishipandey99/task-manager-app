# Pura project browser mein: pehle backend, phir frontend (khud browser kholta hai).
$root = $PSScriptRoot
Write-Host "Starting API on http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; npm start"
Start-Sleep -Seconds 3
Write-Host "Starting frontend (Vite) -- browser khulega ..." -ForegroundColor Cyan
Set-Location "$root\frontend"
npm run dev

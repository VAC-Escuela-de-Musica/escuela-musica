#!/usr/bin/env pwsh

Write-Host "🚀 Iniciando servidor de desarrollo frontend..." -ForegroundColor Green
Set-Location "C:\Users\gcadin\Documents\Universidad\2025_1\GPS\Proyecto\escuela-musica\frontend"

# Verificar si node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "📦 node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Mostrar información del proyecto
Write-Host "📋 Información del proyecto:" -ForegroundColor Cyan
Write-Host "  - Ubicación: $(Get-Location)" -ForegroundColor Gray
Write-Host "  - Puerto: 5173" -ForegroundColor Gray
Write-Host "  - URL: http://localhost:5173" -ForegroundColor Gray

# Iniciar servidor de desarrollo
Write-Host "🔥 Iniciando Vite..." -ForegroundColor Green
npm run dev

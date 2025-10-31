# Script de lancement EcoMaroc Dashboard React avec NPX
# Solution alternative si npm install ne fonctionne pas correctement

Write-Host "🌍 EcoMaroc Dashboard - Démarrage avec NPX..." -ForegroundColor Green
Write-Host ""

# Vérifier si Node.js est installé
Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "📥 Téléchargez-le depuis: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

# Vérifier si npm est installé
Write-Host "🔍 Vérification de npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé!" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Lancement du serveur avec NPX..." -ForegroundColor Cyan
Write-Host "   (Pas d'installation locale requise - NPX télécharge Vite temporairement)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 L'application sera accessible sur: http://localhost:5173" -ForegroundColor Green
Write-Host "🔥 Hot Reload activé - Les modifications seront automatiques" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Pour arrêter le serveur: Appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Lancer le serveur avec npx
npx vite


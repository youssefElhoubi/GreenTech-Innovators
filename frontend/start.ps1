# Script de lancement EcoMaroc Dashboard React
# Pour Windows PowerShell

Write-Host "🌍 EcoMaroc Dashboard - Démarrage..." -ForegroundColor Green
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

# Vérifier si node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    Write-Host "⏱️  Cela peut prendre 1-2 minutes..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'installation des dépendances!" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit
    }
    
    Write-Host "✅ Dépendances installées avec succès!" -ForegroundColor Green
} else {
    Write-Host "✅ Dépendances déjà installées" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Lancement du serveur de développement..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 L'application sera accessible sur: http://localhost:3000" -ForegroundColor Green
Write-Host "🔥 Hot Reload activé - Les modifications seront automatiques" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Pour arrêter le serveur: Appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Lancer le serveur
npm run dev


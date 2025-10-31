@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║      🌍 EcoMaroc Dashboard - Démarrage React              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Vérifier Node.js
echo [1/3] 🔍 Vérification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé!
    echo 📥 Téléchargez-le depuis: https://nodejs.org
    pause
    exit /b
)
echo ✅ Node.js détecté
for /f "tokens=*" %%i in ('node --version') do echo    Version: %%i
echo.

REM Vérifier npm
echo [2/3] 🔍 Vérification de npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé!
    pause
    exit /b
)
echo ✅ npm détecté
for /f "tokens=*" %%i in ('npm --version') do echo    Version: %%i
echo.

REM Installer les dépendances si nécessaire
echo [3/3] 📦 Vérification des dépendances...
if not exist "node_modules" (
    echo ⏱️  Installation en cours... Cela peut prendre 1-2 minutes
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Erreur lors de l'installation!
        pause
        exit /b
    )
    echo ✅ Installation terminée!
) else (
    echo ✅ Dépendances déjà installées
)
echo.

echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 Lancement du serveur de développement...
echo.
echo 📱 Application disponible sur: http://localhost:3000
echo 🔥 Hot Reload: Les modifications seront automatiques
echo.
echo ⚠️  Pour arrêter: Appuyez sur Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Lancer le serveur
call npm run dev

pause


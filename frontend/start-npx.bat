@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║      🌍 EcoMaroc Dashboard - Lancement avec NPX           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Vérifier Node.js
echo [1/2] 🔍 Vérification de Node.js...
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
echo [2/2] 🔍 Vérification de npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé!
    pause
    exit /b
)
echo ✅ npm détecté
for /f "tokens=*" %%i in ('npm --version') do echo    Version: %%i
echo.

echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 Lancement du serveur avec NPX (pas d'installation requise)...
echo.
echo 📱 L'application sera disponible sur: http://localhost:5173
echo 🔥 Hot Reload: Les modifications seront automatiques
echo.
echo ⚠️  Pour arrêter: Appuyez sur Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Lancer le serveur avec npx
npx vite

pause


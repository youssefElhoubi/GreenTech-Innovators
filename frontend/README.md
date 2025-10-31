# EcoMaroc Dashboard - Application React

Dashboard environnemental pour la surveillance en temps réel de la qualité de l'air au Maroc avec 29 stations ESP32.

## 🚀 Installation

### Option 1: Lancement Rapide avec NPX (Recommandé)

**Si vous avez des problèmes avec `npm install`**, utilisez cette méthode qui fonctionne sans installation :

#### Windows

```cmd
# Avec Command Prompt
start-npx.bat

# OU avec PowerShell
.\start-npx.ps1
```

#### Mac/Linux

```bash
npx vite
```

**→ L'application sera sur http://localhost:5173** 🎉

### Option 2: Installation Classique

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

> **Note**: Si `npm install` n'installe que 8-12 packages au lieu de centaines, utilisez **Option 1 avec NPX**.
>
> Voir `LANCEMENT_RAPIDE.md` pour plus de détails.

## 📦 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **Leaflet** - Cartographie interactive
- **Chart.js** - Graphiques de données
- **Font Awesome** - Icônes

## 🎨 Fonctionnalités

- ✅ Dashboard en temps réel avec 7 capteurs
- ✅ Carte interactive du Maroc avec 10 villes
- ✅ 14 thèmes de couleurs personnalisables
- ✅ Prédictions IA avec Machine Learning
- ✅ Rapports téléchargeables (PDF/CSV)
- ✅ Gestion des 29 stations ESP32
- ✅ Graphiques détaillés par ville et capteur
- ✅ Interface responsive et moderne

## 📂 Structure du Projet

```
Frontend/
├── src/
│   ├── components/       # Composants React
│   ├── pages/           # Pages de l'application
│   ├── data/            # Données et configurations
│   ├── styles/          # Fichiers CSS
│   ├── App.jsx          # Composant principal
│   └── main.jsx         # Point d'entrée
├── public/              # Ressources statiques
└── index.html           # Template HTML
```

## 🎯 Pages

1. **Dashboard** - Surveillance en temps réel
2. **IA & Prévisions** - Prédictions ML et calendrier
3. **Rapports** - Historique et téléchargements
4. **Stations ESP32** - Gestion des capteurs

## 🌐 Développé pour

Surveillance environnementale au Maroc avec stations ESP32 déployées dans:

- Casablanca, Rabat, Marrakech, Fès, Tanger
- Agadir, Meknès, Oujda, Tétouan, Safi

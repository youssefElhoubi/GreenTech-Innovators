# 🚀 Guide de Démarrage - EcoMaroc Dashboard React

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé:
- **Node.js** version 16 ou supérieure
- **npm** ou **yarn**

Vérifiez votre installation:
```bash
node --version
npm --version
```

## 🔧 Installation

### Étape 1: Accéder au dossier Frontend
```bash
cd Frontend
```

### Étape 2: Installer les dépendances
```bash
npm install
```

Cette commande va installer toutes les dépendances nécessaires:
- React & React DOM
- Vite (build tool)
- Leaflet & React-Leaflet (cartes)
- Chart.js & React-ChartJS-2 (graphiques)
- Et autres dépendances...

⏱️ L'installation prend environ 1-2 minutes.

## 🎯 Lancer l'Application

### Mode Développement
```bash
npm run dev
```

L'application sera accessible à: **http://localhost:3000**

Le navigateur devrait s'ouvrir automatiquement. Sinon, ouvrez manuellement l'URL ci-dessus.

### Mode Production

Pour créer un build optimisé pour la production:
```bash
npm run build
```

Pour prévisualiser le build de production:
```bash
npm run preview
```

## 📁 Structure du Projet

```
Frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Navigation.jsx   # Barre de navigation
│   │   ├── Header.jsx       # En-tête avec date/heure
│   │   ├── StatCard.jsx     # Carte de statistiques
│   │   ├── CityCard.jsx     # Carte de ville
│   │   ├── MapView.jsx      # Carte Leaflet
│   │   ├── SensorChart.jsx  # Graphique de capteur
│   │   └── Particles.jsx    # Particules animées
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Dashboard.jsx    # Page principale
│   │   ├── AIPage.jsx       # Prédictions IA
│   │   ├── ReportsPage.jsx  # Rapports
│   │   └── StationsPage.jsx # Gestion stations ESP32
│   │
│   ├── data/                # Données et configurations
│   │   ├── cities.js        # Données des villes
│   │   ├── stations.js      # Stations ESP32
│   │   ├── themes.js        # Thèmes de couleurs
│   │   └── sensors.js       # Configuration capteurs
│   │
│   ├── utils/               # Fonctions utilitaires
│   │   └── helpers.js       # Fonctions helper
│   │
│   ├── styles/              # Styles CSS
│   │   └── index.css        # Styles principaux
│   │
│   ├── App.jsx              # Composant racine
│   └── main.jsx             # Point d'entrée
│
├── public/                  # Ressources statiques
├── index.html               # Template HTML
├── package.json             # Dépendances
├── vite.config.js           # Configuration Vite
└── README.md                # Documentation

```

## ✨ Fonctionnalités

### ✅ Dashboard (Page Principale)
- 7 cartes de statistiques en temps réel
- Carte interactive du Maroc avec 10 villes
- Sidebar avec liste des villes
- Graphiques détaillés par capteur et par ville
- Sélecteur de ville avec moyenne nationale

### ✅ IA & Prédictions
- Métriques ML (précision, alertes, prédictions)
- Graphiques de performance
- Calendrier des prédictions sur 7 jours
- Événements normaux/attention/critiques

### ✅ Rapports
- Liste des rapports disponibles
- Téléchargement PDF/CSV
- Statistiques globales
- Indicateur du prochain rapport

### ✅ Stations ESP32
- Liste complète des 29 stations
- Ajout/modification/suppression de stations
- Toggle en ligne/hors ligne
- Statistiques en temps réel

### ✅ Personnalisation
- 14 thèmes de couleurs
- Interface responsive
- Animations fluides
- Design moderne et épuré

## 🎨 Thèmes Disponibles

1. Sombre (défaut)
2. Vert Émeraude
3. Océan
4. Turquoise
5. Ardoise
6. Bleu Marine
7. Forêt
8. Violet Rose
9. Nuit Céleste
10. Coucher de Soleil
11. Aurore Boréale
12. Minuit Violet
13. Cosmique
14. Émeraude Lumineuse

## 📊 Capteurs Surveillés

1. **DHT22** - Température & Humidité
2. **BMP280** - Pression atmosphérique & Température
3. **MQ-135** - CO₂ et qualité de l'air
4. **MICS-5524** - CO et autres gaz
5. **ML8511** - Rayonnement UV
6. **BH1750** - Intensité lumineuse

## 🗺️ Villes Couvertes

- Casablanca (5 stations)
- Rabat (4 stations)
- Marrakech (4 stations)
- Fès (3 stations)
- Tanger (3 stations)
- Agadir (2 stations)
- Meknès (3 stations)
- Oujda (3 stations)
- Tétouan (3 stations)
- Safi (3 stations)

**Total: 29 stations ESP32**

## 🔧 Développement

### Hot Reload
Le serveur de développement Vite offre le rechargement à chaud (Hot Module Replacement). Toute modification du code sera instantanément reflétée dans le navigateur.

### Structure des Composants
L'application utilise une architecture basée sur:
- **Hooks React** (useState, useEffect, useCallback, useRef)
- **Composants fonctionnels**
- **Props drilling** pour le passage de données
- **LocalStorage** pour la persistance des préférences

### Gestion d'État
- État local avec `useState` pour chaque composant
- Pas de Redux (pour simplicité)
- LocalStorage pour le thème sélectionné

## 📦 Dépendances Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```

## 🐛 Dépannage

### Port déjà utilisé
Si le port 3000 est déjà utilisé:
```bash
# Modifiez le port dans vite.config.js
server: {
  port: 3001  // Changez ici
}
```

### Erreurs d'installation
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
```

### Problèmes de cache
```bash
# Nettoyez le cache de Vite
npm run dev -- --force
```

## 🚀 Prochaines Étapes

1. **Backend API**: Connecter à un vrai backend pour les données en temps réel
2. **WebSockets**: Implémenter des mises à jour en temps réel
3. **Authentification**: Ajouter un système de login
4. **Base de données**: Stocker l'historique des données
5. **Notifications**: Alertes en temps réel pour événements critiques

## 📞 Support

Pour toute question ou problème:
- Consultez la documentation React: https://react.dev
- Documentation Vite: https://vitejs.dev
- Documentation Leaflet: https://leafletjs.com
- Documentation Chart.js: https://www.chartjs.org

## 🎉 C'est Prêt !

Vous êtes maintenant prêt à utiliser EcoMaroc Dashboard React !

```bash
cd Frontend
npm install
npm run dev
```

Enjoy! 🌍✨


# 🚀 Lancement Rapide - EcoMaroc Dashboard React

## ⚡ Solution Recommandée (NPX - Sans Installation)

Si vous avez des problèmes avec `npm install`, utilisez ces scripts qui fonctionnent **sans installer Vite localement** :

### Windows

#### Option 1: Command Prompt
```cmd
start-npx.bat
```

#### Option 2: PowerShell
```powershell
.\start-npx.ps1
```

### Mac/Linux
```bash
npx vite
```

**L'application sera disponible sur: http://localhost:5173** 🎉

> **Note**: Le port par défaut de Vite avec npx est **5173** (pas 3000)

---

## 📋 Pourquoi NPX ?

NPX télécharge et exécute Vite temporairement **sans l'installer** dans `node_modules`. C'est parfait quand:
- ✅ `npm install` n'installe pas toutes les dépendances
- ✅ Vous voulez un démarrage rapide sans installation
- ✅ Vous testez l'application pour la première fois

---

## 🔧 Installation Normale (Si ça fonctionne)

Si `npm install` fonctionne correctement sur votre machine:

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

---

## 🐛 Dépannage

### Problème: "Cannot find package 'vite'"
**Solution**: Utilisez `start-npx.bat` ou `start-npx.ps1`

### Problème: "Port 5173 already in use"
**Solution**: 
```bash
# Spécifiez un autre port
npx vite --port 3000
```

### Problème: Scripts PowerShell bloqués
**Solution**:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-npx.ps1
```

---

## 📦 Dépendances Manquantes?

Si certaines bibliothèques (Leaflet, Chart.js) ne sont pas installées:

```bash
# Installer seulement les dépendances de production
npm install react react-dom leaflet chart.js
```

Puis lancez avec NPX:
```bash
npx vite
```

---

## ✅ Vérification

Une fois le serveur lancé, vous devriez voir:

```
VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Ouvrez http://localhost:5173 dans votre navigateur!** 🎉

---

## 🎯 Commandes Utiles

```bash
# Lancer avec npx
npx vite

# Lancer sur un port spécifique
npx vite --port 3000

# Build pour production
npx vite build

# Preview du build
npx vite preview

# Ouvrir automatiquement le navigateur
npx vite --open
```

---

## 🌟 Avantages de NPX

| Aspect | npm install + npm run dev | npx vite |
|--------|---------------------------|----------|
| **Installation** | Nécessaire (peut échouer) | ❌ Pas nécessaire |
| **Espace disque** | ~200+ MB dans node_modules | ✅ Cache temporaire |
| **Vitesse première fois** | Lent (installation) | ✅ Rapide |
| **Mises à jour** | Manuel | ✅ Toujours la dernière |
| **Problèmes dépendances** | Peut bloquer | ✅ Contourne le problème |

---

## 📝 Notes

- **NPX** télécharge Vite dans un cache temporaire npm
- Le cache est réutilisé entre les exécutions
- Parfait pour le développement et les tests
- Pour la production, préférez une installation locale complète

---

**Bon développement! 🚀**


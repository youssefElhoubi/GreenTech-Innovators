# Données factices pour MongoDB

Ce dossier contient des fichiers JSON avec des données factices pour insertion manuelle dans MongoDB.

## Structure des fichiers

- **cities.json** : Liste des villes (Safi, Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès)
- **stations.json** : Stations de mesure avec coordonnées GPS et adresses MAC
- **data.json** : Données de capteurs (température, humidité, pression, CO2, gaz, UV) avec timestamps
- **predictions.json** : Prédictions de qualité de l'air avec statuts (NORMAL, WARNING, DANGER)

## Instructions d'insertion

### Méthode 1 : MongoDB Compass (Interface graphique)

1. Ouvrez MongoDB Compass
2. Connectez-vous à votre base de données `GreenTech_Innovators`
3. Pour chaque fichier JSON :
   - Sélectionnez la collection correspondante (cities, stations, data, predictions)
   - Cliquez sur "ADD DATA" → "Insert Document"
   - Copiez-collez le contenu du fichier JSON
   - Cliquez sur "Insert"

### Méthode 2 : MongoDB Shell (mongoimport)

```bash
# Importer les villes
mongoimport --db GreenTech_Innovators --collection cities --file data/cities.json --jsonArray

# Importer les stations
mongoimport --db GreenTech_Innovators --collection stations --file data/stations.json --jsonArray

# Importer les données
mongoimport --db GreenTech_Innovators --collection data --file data/data.json --jsonArray

# Importer les prédictions
mongoimport --db GreenTech_Innovators --collection predictions --file data/predictions.json --jsonArray
```

### Méthode 3 : MongoDB Shell (mongosh)

```javascript
// Se connecter à MongoDB
use GreenTech_Innovators

// Insérer les villes
db.cities.insertMany([
  // Copier le contenu de cities.json ici
])

// Insérer les stations
db.stations.insertMany([
  // Copier le contenu de stations.json ici
])

// Insérer les données
db.data.insertMany([
  // Copier le contenu de data.json ici
])

// Insérer les prédictions
db.predictions.insertMany([
  // Copier le contenu de predictions.json ici
])
```

## Ordre d'insertion recommandé

1. **cities.json** (doit être inséré en premier)
2. **stations.json** (référence les villes)
3. **data.json** (peut être inséré indépendamment)
4. **predictions.json** (référence les villes)

## Notes importantes

- Les références DBRef dans `stations.json` et `predictions.json` utilisent la syntaxe MongoDB standard avec `$ref` et `$id`
- Les timestamps dans `data.json` sont au format ISO 8601
- Les valeurs de capteurs sont réalistes pour le contexte marocain
- Les adresses MAC sont fictives mais suivent le format standard

## Vérification

Après insertion, vérifiez que les données sont bien présentes :

```javascript
// Compter les documents
db.cities.countDocuments()
db.stations.countDocuments()
db.data.countDocuments()
db.predictions.countDocuments()

// Vérifier un document
db.cities.findOne()
db.stations.findOne()
```


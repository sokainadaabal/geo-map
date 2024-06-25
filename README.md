# GIS Web Application

Cette application web utilise l'API ArcGIS pour JavaScript pour créer une carte interactive du Maroc. Elle permet de visualiser et d'interagir avec différentes couches de données géographiques, notamment les régions, les provinces et les stations de transport.

## Fonctionnalités

- Affichage d'une carte interactive du Maroc
- Visualisation des couches de données :
  - Régions du Maroc
  - Provinces du Maroc
  - Stations de transport
- Possibilité de basculer entre différents fonds de carte (rues, satellite, topographique)
- Affichage des informations détaillées des entités via des fenêtres pop-up
- Édition des attributs des entités sélectionnées
- Outils de dessin et de modification de géométries

## Technologies utilisées

- React.js
- API ArcGIS pour JavaScript
- esri-loader pour charger les modules ArcGIS
- CSS pour le styling

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement installé avec Node.js)

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/sokainadaabal/geo-map.git
   ```
2. Naviguez dans le dossier du projet :
   ```
   cd front-end-map
   ```
3. Installez les dépendances :
   ```
   npm install
   ```

## Lancement de l'application

Pour démarrer l'application en mode développement :
```
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
src/
├── components/
│   ├── MapComponet.js
│   ├── LayerControl.js
│   ├── FilterPanel.js
│   └── Dashboard.js
├── App.js
└── index.js
```

## Données utilisées

L'application utilise les données suivantes :

- `regions.geojson` : Contient les données des régions du Maroc
- `provinces.geojson` : Contient les données des provinces du Maroc
- `transport_stations.csv` : Contient les données des stations de transport

Ces fichiers sont stockés dans le dossier `data-map` du dépôt.

## Approche de résolution

1. Initialisation de la carte ArcGIS et chargement des données GeoJSON.
2. Implémentation des outils de création et modification de géométries.
3. Développement des fonctionnalités de filtrage et de requête.
4. Création du tableau de bord avec graphiques synchronisés.
5. Optimisation des performances et de l'expérience utilisateur.

## Hypothèses

- Les fichiers GeoJSON fournis sont correctement formatés et contiennent les attributs nécessaires.
- L'application est destinée à être utilisée sur des appareils de bureau, avec une adaptation possible pour les appareils mobiles.
- Les utilisateurs ont une connexion Internet stable pour charger les données cartographiques.

## Améliorations futures

- Ajout de tests unitaires et d'intégration
- Optimisation des performances pour de grands ensembles de données
- Implémentation d'un backend pour la persistance des données utilisateur
- Ajout de fonctionnalités d'exportation de données

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
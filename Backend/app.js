// Importation des modules nécessaires
const path = require('path'); // Module pour manipuler les chemins de fichiers
const express = require('express'); // Framework web pour créer des applications web
const cors = require('cors'); // Middleware pour configurer CORS (Cross-Origin Resource Sharing)
const mongoose = require('mongoose'); // Bibliothèque pour interagir avec MongoDB

// Création de l'application Express
const app = express();

// Importation des routes spécifiques à certaines fonctionnalités
const booksRoutes = require('./routes/books'); // Routes pour gérer les livres
const userRoutes = require('./routes/user'); // Routes pour gérer l'authentification des utilisateurs

// Chargement des variables d'environnement depuis un fichier .env
require('dotenv').config(); 

// Connexion à la base de données MongoDB
const mongoUri =  process.env.DATABASE_URL; // Récupération de l'URL de la base de données depuis les variables d'environnement
mongoose.connect(mongoUri)
  .then(() => console.log('Connexion à MongoDB réussie !')) // Message si la connexion est réussie
  .catch((err) => {
    console.error('Connexion à MongoDB échouée !', err); // Message si la connexion échoue
    process.exit(1); // Arrêt du processus en cas d'erreur
  });

// Configuration CORS pour permettre les requêtes depuis un domaine spécifique
app.use(cors({
  origin: 'http://localhost:3000', // Autorise les requêtes provenant de ce domaine (frontend)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes HTTP autorisées
  credentials: true // Autorise l'envoi de cookies ou d'en-têtes d'autorisation
}));

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json()); 

// Définition des routes de l'API
app.use('/api/books', booksRoutes); // Route pour gérer les requêtes liées aux livres
app.use('/api/auth', userRoutes); // Route pour gérer les requêtes liées à l'authentification des utilisateurs

// Servir des fichiers statiques depuis le répertoire "images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Exportation de l'application pour qu'elle puisse être utilisée par le serveur HTTP
module.exports = app;

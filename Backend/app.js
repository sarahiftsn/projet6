const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

require('dotenv').config();

const mongoUri =  process.env.DATABASE_URL;
mongoose.connect(mongoUri)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => {
    console.error('Connexion à MongoDB échouée !', err);
    process.exit(1);
  });

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par le domaine d'origine de vos requêtes
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;

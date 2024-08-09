// Importer le module HTTP pour créer un serveur HTTP
const http = require('http');

// Importer l'application Express depuis le fichier app.js 
const app = require('./app'); 

// Fonction pour normaliser un port en un nombre, une chaîne de caractères, ou false
const normalizePort = val => {
  // Convertit la valeur en entier
  const port = parseInt(val, 10);

  // Si la valeur convertie n'est pas un nombre, retourner la valeur d'origine 
  if (isNaN(port)) {
    return val;
  }

  // Si le port est un nombre valide et supérieur ou égal à 0, retourner ce port
  if (port >= 0) {
    return port;
  }

  // Si le port n'est pas valide, retourner false
  return false;
};

// Récupérer le port à partir des variables d'environnement ou utiliser une valeur par défaut (4000)
const port = normalizePort(process.env.PORT || '4000');

// Définir le port dans l'application Express (cela peut être utilisé ailleurs dans l'application si nécessaire)
app.set('port', port);

// Fonction pour gérer les erreurs qui peuvent survenir lors du démarrage du serveur
const errorHandler = error => {
  // Si l'erreur n'est pas liée à l'appel de la fonction listen, lancer l'erreur
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Récupérer l'adresse à laquelle le serveur essaie de se lier
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // Gérer les erreurs spécifiques liées à l'écoute avec des messages explicites
  switch (error.code) {
    case 'EACCES':
      // EACCES signifie que le port nécessite des privilèges élevés
      console.error(bind + ' nécessite des privilèges élevés.');
      // Quitter le processus avec un statut d'échec
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // EADDRINUSE signifie que le port est déjà utilisé par un autre processus
      console.error(bind + ' est déjà utilisé.');
      // Quitter le processus avec un statut d'échec
      process.exit(1);
      break;
    default:
      // Pour toute autre erreur, lancer l'erreur
      throw error;
  }
};

// Créer un serveur HTTP en utilisant l'application Express comme gestionnaire de requêtes
const server = http.createServer(app);

// Associer la fonction de gestion des erreurs à l'événement 'error' du serveur
server.on('error', errorHandler);

// Associer un écouteur à l'événement 'listening' du serveur
server.on('listening', () => {
  // Récupérer l'adresse à laquelle le serveur est lié
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;

  // Afficher un message indiquant que le serveur écoute, en précisant le port ou le pipe
  console.log('Écoute sur ' + bind);
});

// Démarrer le serveur et le faire écouter sur le port spécifié
server.listen(port);

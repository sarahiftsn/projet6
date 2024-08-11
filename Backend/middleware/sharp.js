// Importation des modules nécessaires
const sharp = require('sharp'); // sharp pour redimensionner les images
const fs = require('fs'); // fs pour manipuler les fichiers sur le système
const path = require('path'); // path pour gérer les chemins de fichiers

// Middleware pour redimensionner l'image
const resizeImage = (req, res, next) => {
  // Vérifie s'il y a un fichier dans la requête
  if (!req.file) {
    return next(); // S'il n'y a pas de fichier, passe au middleware suivant
  }

  // Remplace les espaces dans le nom du fichier par des underscores
  const originalName = req.file.originalname.split(' ').join('_');
  // Crée un nouveau nom de fichier en ajoutant un préfixe "resized-" et un timestamp pour garantir l'unicité
  const newFilename = `resized-${originalName}-${Date.now()}.webp`;
  // Définit le chemin de sortie où l'image redimensionnée sera enregistrée
  const outputPath = path.join(__dirname, '..', 'images', newFilename);

  // Utilise sharp pour redimensionner l'image
  sharp(req.file.buffer)
    .resize(206, 260) // Redimensionne l'image à 206x260 pixels
    .toFormat('webp') // Convertit l'image au format WebP
    .toBuffer() // Retourne l'image redimensionnée sous forme de buffer
    .then(buffer => {
      // Écrit le buffer de l'image redimensionnée dans un fichier
      fs.writeFile(outputPath, buffer, err => {
        if (err) {
          console.error('Erreur lors de la sauvegarde de l\'image', err); // Affiche une erreur si la sauvegarde échoue
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'image' }); // Renvoie une réponse 500 en cas d'erreur
        }
        // Si la sauvegarde est réussie, met à jour le chemin et le nom du fichier dans la requête
        req.file.path = outputPath;
        req.file.filename = newFilename;
        // Passe au middleware suivant
        next();
      });
    })
    .catch(err => {
      console.error('Erreur lors du traitement de l\'image', err); // Affiche une erreur si le traitement échoue
      res.status(500).json({ error: 'Erreur lors du traitement de l\'image' }); // Renvoie une réponse 500 en cas d'erreur
    });
};

// Exportation du middleware pour l'utiliser dans d'autres parties de l'application
module.exports = resizeImage;

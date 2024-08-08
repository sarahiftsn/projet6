const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalName = req.file.originalname.split(' ').join('_');
  const newFilename = `resized-${originalName}-${Date.now()}.webp`;
  const outputPath = path.join(__dirname, '..', 'images', newFilename);

  sharp(req.file.buffer)
    .resize(206, 260) 
    .toFormat('webp') 
    .toBuffer()
    .then(buffer => {
      fs.writeFile(outputPath, buffer, err => {
        if (err) {
          console.error('Erreur lors de la sauvegarde de l\'image', err);
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'image' });
        }
        req.file.path = outputPath;
        req.file.filename = newFilename;
        next();
      });
    })
    .catch(err => {
      console.error('Erreur lors du traitement de l\'image', err);
      res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
    });
};

module.exports = resizeImage;
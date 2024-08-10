const Book = require('../models/book'); // Importation du modèle Book
const fs = require('fs'); // Importation du module fs pour manipuler les fichiers

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {
    // Parse le corps de la requête pour obtenir les détails du livre
    const bookObject = JSON.parse(req.body.book);
    // Supprime les propriétés non nécessaires
    delete bookObject.id;
    delete bookObject.userId;
    
    // Crée une nouvelle instance du modèle Book
    const book = new Book({
        ...bookObject, // Copie les propriétés du livre
        userId: req.auth.userId, // Ajoute l'ID de l'utilisateur
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de l'image du livre
    });

    // Sauvegarde le livre dans la base de données
    book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' })) // Réponse en cas de succès
    .catch(error => res.status(400).json({ error })); // Réponse en cas d'erreur
};

// Fonction pour modifier un livre existant
exports.modifyBook = (req, res, next) => {
    // Crée un objet bookObject avec les nouvelles données
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de la nouvelle image si un fichier est téléchargé
    } : { ...req.body }; // Sinon, utilise les données du corps de la requête

    // Supprime l'ID de l'utilisateur du bookObject
    delete bookObject.userId;

    // Trouve le livre par ID
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        // Vérifie si l'utilisateur est autorisé à modifier le livre
        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' }); // Non autorisé
        } else {
            // Met à jour le livre dans la base de données
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié !' })) // Réponse en cas de succès
            .catch(error => res.status(401).json({ error })); // Réponse en cas d'erreur
        }
    })
    .catch((error) => res.status(400).json({ error })); // Réponse en cas d'erreur lors de la recherche du livre
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
    // Trouve le livre par ID
    Book.findOne({ _id: req.params.id })
    .then(book => {
        // Vérifie si l'utilisateur est autorisé à supprimer le livre
        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' }); // Non autorisé
        } else {
            // Récupère le nom du fichier de l'image à partir de l'URL
            const filename = book.imageUrl.split('/images/')[1];
            // Supprime le fichier image du disque
            fs.unlink(`images/${filename}`, (error) => {
                if (error) {
                    console.error('Erreur lors de la suppression du fichier:', error); // Erreur lors de la suppression du fichier
                    return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' }); // Réponse en cas d'erreur
                }
                // Supprime le livre de la base de données
                Book.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre supprimé' })) // Réponse en cas de succès
                .catch(error => res.status(401).json({ error })); // Réponse en cas d'erreur
            });
        }
    })
    .catch(error => res.status(500).json({ error })); // Réponse en cas d'erreur lors de la recherche du livre
};

// Fonction pour obtenir les détails d'un seul livre
exports.getOneBook = (req, res, next) => {
    // Trouve le livre par ID
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book)) // Réponse avec les détails du livre
    .catch(error => res.status(404).json({ error })); // Réponse en cas d'erreur, livre non trouvé
};

// Fonction pour obtenir tous les livres
exports.getAllBook = (req, res, next) => {
    // Trouve tous les livres
    Book.find()
    .then(books => res.status(200).json(books)) // Réponse avec la liste des livres
    .catch(error => res.status(400).json({ error })); // Réponse en cas d'erreur
};

// Fonction pour noter un livre
exports.rateBook = (req, res, next) => {
    const { userId, rating } = req.body;

    // Trouve le livre par ID
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        // Vérifie si le livre existe
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé.' }); // Livre non trouvé
        }

        // Vérifie si l'utilisateur a déjà noté ce livre
        const existingRatingIndex = book.ratings.findIndex((r) => r.userId.toString() === userId);
        if (existingRatingIndex !== -1) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre' }); // Déjà noté
        }

        // Ajoute la nouvelle note
        book.ratings.push({ userId, grade: rating });

        // Calcule la note moyenne
        const averageRating = book.ratings.reduce((acc, curr) => acc + Number(curr.grade), 0) / book.ratings.length;
        book.averageRating = averageRating;

        // Sauvegarde les changements
        book.save()
        .then(() => res.status(200).json(book)) // Réponse avec le livre mis à jour
        .catch(error => res.status(500).json({ error })); // Réponse en cas d'erreur
    })
    .catch(error => res.status(500).json({ error })); // Réponse en cas d'erreur lors de la recherche du livre
};

// Fonction pour obtenir les livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
    // Trouve les livres, trie par note moyenne (décroissant) et limite à 3 livres
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((bestRatedBooks) => {
        res.status(200).json(bestRatedBooks); // Réponse avec les livres les mieux notés
    })
    .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error' }); // Réponse en cas d'erreur interne
    });
};

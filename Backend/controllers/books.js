const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject.id;
    delete bookObject.userId;
    const book = new Book ({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then(() => {res.status(201).json({ message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json({ error })});
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    delete bookObject.userId;
    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized'});
        } else {
            Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message: 'Livre modifié !'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Not authorized'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, (error) => {
                if (error) {
                    console.error('Erreur lors de la suppression du fichier:', error);
                    return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
                }
                Book.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({ message: 'Livre supprimé' }))
                .catch(error => res.status(401).json({ error }));
            });
            
        }
    })
    .catch(error => {
        res.status(500).json({ error });
    });
};


exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};


exports.getAllBook = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.rateBook = (req, res, next) => {
    const { userId, rating } = req.body;

    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé.' });
        }

        const existingRatingIndex = book.ratings.findIndex((r) => r.userId.toString() === userId);
        if (existingRatingIndex !== -1) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        }

        book.ratings.push({ userId, grade: rating });

        const averageRating = book.ratings.reduce((acc, curr) => acc + Number(curr.grade), 0) / book.ratings.length;
        book.averageRating = averageRating;

        book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};


exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((bestRatedBooks) => {
        res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error'});
    });
}
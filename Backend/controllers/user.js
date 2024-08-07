const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator'); // Ajout de la bibliothèque validator

// Fonction d'inscription
exports.signup = (req, res, next) => {
    console.log('Signup request received with email:', req.body.email);

    // Validation de l'email
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Format d\'email invalide.' });
    }

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => {
            console.log('User created successfully');
            res.status(201).json({ message: 'Utilisateur créé !' });
        })
        .catch(error => {
            console.error('Error creating user:', error);
            res.status(400).json({ message: 'Utilisateur existe déjà.' });
        });
    })
    .catch(error => {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
    });
};

// Fonction de connexion
exports.login = (req, res, next) => {
    console.log('Login request received with email:', req.body.email);

    // Validation de l'email
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Format d\'email invalide.' });
    }

    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            console.warn('User not found');
            return res.status(401).json({ message: 'Compte inexistant.' });
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                console.warn('Invalid password');
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte.' });
            }
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('User logged in successfully');
            res.status(200).json({
                userId: user._id,
                token
            });
        })
        .catch(error => {
            console.error('Error comparing passwords:', error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la comparaison des mots de passe.' });
        });
    })
    .catch(error => {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' });
    });
};

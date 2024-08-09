const bcrypt = require('bcrypt'); // Importation du module bcrypt pour le hachage des mots de passe
const jwt = require('jsonwebtoken'); // Importation du module jsonwebtoken pour la gestion des tokens
const User = require('../models/User'); // Importation du modèle User
const validator = require('validator'); // Importation de la bibliothèque validator pour la validation des données

// Fonction d'inscription (signup)
exports.signup = (req, res, next) => {
    console.log('Signup request received with email:', req.body.email);

    // Validation de l'email
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Format d\'email invalide.' }); // Réponse en cas de format d'email invalide
    }

    // Hachage du mot de passe avec bcrypt
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        // Création d'une nouvelle instance du modèle User avec l'email et le mot de passe haché
        const user = new User({
            email: req.body.email,
            password: hash
        });

        // Sauvegarde de l'utilisateur dans la base de données
        user.save()
        .then(() => {
            console.log('User created successfully'); // Confirmation dans la console
            res.status(201).json({ message: 'Utilisateur créé !' }); // Réponse en cas de succès
        })
        .catch(error => {
            console.error('Error creating user:', error); // Erreur lors de la création de l'utilisateur
            res.status(400).json({ message: 'Utilisateur existe déjà.' }); // Réponse en cas d'erreur, utilisateur déjà existant
        });
    })
    .catch(error => {
        console.error('Error hashing password:', error); // Erreur lors du hachage du mot de passe
        res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.' }); // Réponse en cas d'erreur serveur
    });
};

// Fonction de connexion (login)
exports.login = (req, res, next) => {
    console.log('Login request received with email:', req.body.email);

    // Validation de l'email
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Format d\'email invalide.' }); // Réponse en cas de format d'email invalide
    }

    // Recherche de l'utilisateur par email
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            console.warn('User not found'); // Avertissement dans la console si l'utilisateur n'existe pas
            return res.status(401).json({ message: 'Compte inexistant.' }); // Réponse en cas d'utilisateur non trouvé
        }

        // Comparaison du mot de passe fourni avec le mot de passe stocké
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                console.warn('Invalid password'); // Avertissement dans la console si le mot de passe est invalide
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte.' }); // Réponse en cas de mot de passe incorrect
            }

            // Génération d'un token JWT pour l'utilisateur
            const token = jwt.sign(
                { userId: user._id }, // Payload avec l'ID de l'utilisateur
                process.env.JWT_SECRET, // Clé secrète pour signer le token
                { expiresIn: '24h' } // Durée de validité du token
            );

            console.log('User logged in successfully'); // Confirmation dans la console
            res.status(200).json({
                userId: user._id, // ID de l'utilisateur
                token // Token JWT
            });
        })
        .catch(error => {
            console.error('Error comparing passwords:', error); // Erreur lors de la comparaison des mots de passe
            res.status(500).json({ message: 'Une erreur est survenue lors de la comparaison des mots de passe.' }); // Réponse en cas d'erreur serveur
        });
    })
    .catch(error => {
        console.error('Error finding user:', error); // Erreur lors de la recherche de l'utilisateur
        res.status(500).json({ message: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' }); // Réponse en cas d'erreur serveur
    });
};

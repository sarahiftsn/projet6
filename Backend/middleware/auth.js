// Importation du module jsonwebtoken pour la gestion des JWT
const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
    try {
        // Récupération de l'en-tête Authorization depuis la requête
        const authorizationHeader = req.headers.authorization;

        // Vérification si l'en-tête Authorization est présent
        if (!authorizationHeader) {
            throw new Error('Authorization header is missing');
        }

        // Extraction du token depuis l'en-tête Authorization (format attendu : "Bearer TOKEN")
        const token = authorizationHeader.split(' ')[1];

        // Vérification si le token est présent
        if (!token) {
            throw new Error('Token is missing');
        }

        // Décodage et vérification du token avec la clé secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Vérification si le token a été correctement décodé
        if (!decodedToken) {
            throw new Error('Token verification failed');
        }

        // Extraction de l'ID utilisateur du token décodé
        const userId = decodedToken.userId;

        // Vérification si l'ID utilisateur est présent dans le token
        if (!userId) {
            throw new Error('User ID not found in token');
        }

        // Ajout des informations d'authentification à l'objet req
        req.auth = {
            userId: userId
        };

        // Passer le contrôle au middleware suivant ou à la route
        next();
    } catch (error) {
        // En cas d'erreur, afficher le message d'erreur dans la console et renvoyer une réponse 401 (Unauthorized)
        console.error('Authentication error:', error);
        res.status(401).json({ error: error.message || 'Unauthorized' });
    }
};

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Types MIME autorisés
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

// Configuration du stockage avec Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); // Dossier de destination
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.originalname.split(' ').join('_');
        cb(null, uniqueSuffix + '-' + name);
    }
});

// Initialiser Multer avec les limites de taille et le filtre de fichier
const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // Taille max de 4 Mo
    fileFilter: (req, file, cb) => {
        if (MIME_TYPES[file.mimetype]) {
            cb(null, true); // Accepter les fichiers avec un type MIME valide
        } else {
            cb(new Error('Type de fichier invalide'), false); // Rejeter les fichiers non autorisés
        }
    }
});

// Middleware pour redimensionner l'image avec Sharp et convertir en WebP
const resizeImage = (req, res, next) => {
    if (!req.file) {
        return next(); // Si pas de fichier, passer au middleware suivant
    }

    const filePath = req.file.path; // Chemin de l'image originale
    const fileName = req.file.filename.split('.')[0]; // Nom du fichier sans extension
    const outputFileName = `resized_${fileName}.webp`; // Nom du fichier WebP
    const outputPath = path.join('images', outputFileName); // Chemin de sortie en WebP

    sharp(filePath)
        .resize({
            width: 206, // Largeur cible
            height: 260, // Hauteur cible
            fit: 'cover' // Mode de redimensionnement
        })
        .webp() // Convertir en WebP
        .toFile(outputPath) // Sauvegarder l'image convertie en WebP
        .then(() => {
            // Supprimer le fichier original après redimensionnement et conversion
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                req.file.path = outputPath; // Mettre à jour le chemin du fichier pour pointer vers le fichier WebP
                req.file.filename = outputFileName; // Mettre à jour le nom du fichier
                next(); // Passer au middleware suivant
            });
        })
        .catch(err => {
            console.error(err);
            return next(err); // Gérer l'erreur
        });
};

// Export des middlewares Multer et Sharp
module.exports = {
    upload, // Export du middleware de Multer
    resizeImage
};

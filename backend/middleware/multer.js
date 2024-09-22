const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.originalname.split(' ').join('_');
        cb(null, uniqueSuffix + '-' + name);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (MIME_TYPES[file.mimetype]) {
            cb(null, true);e
        } else {
            cb(new Error('Type de fichier invalide'), false); 
        }
    }
});

const resizeImage = (req, res, next) => {
    if (!req.file) {
        return next(); 
    }

    const filePath = req.file.path; 
    const fileName = req.file.filename.split('.')[0]; 
    const outputFileName = `resized_${fileName}.webp`; 
    const outputPath = path.join('images', outputFileName); 
    sharp(filePath)
        .resize({
            width: 206, 
            height: 260, 
            fit: 'cover' 
        })
        .webp() 
        .toFile(outputPath)
        .then(() => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    return next(err);
                }
                req.file.path = outputPath; 
                req.file.filename = outputFileName; 
                next(); 
            });
        })
        .catch(err => {
            return next(err); // Gérer l'erreur
        });
};

// Export des middlewares Multer et Sharp
module.exports = {
    upload, // Export du middleware de Multer
    resizeImage
};

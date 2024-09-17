const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { upload, resizeImage } = require('../middleware/multer');  // Assure-toi d'importer correctement

const authController = require('../middleware/auth.js')

router.get('/', booksController.getAllBooks);
router.get('/bestrating', booksController.bestBook);

router.post('/', authController.authenticateJWT, upload.single('image'), resizeImage, booksController.createBook);
router.put('/:id', authController.authenticateJWT, upload.single('image'), resizeImage, booksController.updateBook);
router.post('/:id/rating', authController.authenticateJWT, booksController.addRating);
router.get('/:id', booksController.searchBook);
router.delete('/:id', authController.authenticateJWT, booksController.deleteBooks);

module.exports = router;

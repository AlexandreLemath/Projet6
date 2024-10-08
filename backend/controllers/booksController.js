const Books = require("../models/Books");
const fs = require("fs");
const path = require("path");
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Books.find();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Erreur du serveur" });
  }
};

exports.createBook = async (req, res) => {
  try {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: "Image non reçue" });
    }

    if (!req.body.book) {
      return res.status(400).json({ message: "Données du livre non reçues" });
    }

    const bookData = JSON.parse(req.body.book);
    delete bookData._id;
    delete bookData._userid;

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;

    const newBook = new Books({
      ...bookData,
      userId: req.user.userId,
      imageUrl: imageUrl,
      ratings: bookData.ratings || [],
      averageRating:
        bookData.ratings && bookData.ratings.length > 0
          ? bookData.ratings[0].grade
          : 0,
    });

    await newBook.save();
    return res
      .status(201)
      .json({ message: "Livre enregistré avec succès", book: newBook });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement du livre" });
  }
};

exports.searchBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    const book = await Books.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur du serveur lors de la recherche du livre" });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const existingBook = await Books.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    const hasFile = req.file != null;
    let bookData;

    if (hasFile) {
      bookData = JSON.parse(req.body.book);
      const imageUrl = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
      bookData.imageUrl = imageUrl;

      if (existingBook.imageUrl) {
        const oldImageName = path.basename(existingBook.imageUrl);
        const oldImagePath = path.join(__dirname, "..", "images", oldImageName);

        await fs.promises.unlink(oldImagePath);
      }
    } else {
      bookData = req.body;
    }

    bookData.ratings = bookData.ratings || [];

    const updatedBook = await Books.findByIdAndUpdate(bookId, bookData, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    return res
      .status(200)
      .json({ message: "Livre mis à jour avec succès", book: updatedBook });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur du serveur lors de la mise à jour du livre" });
  }
};

exports.bestBook = async (req, res) => {
  try {
    const topThreeBooks = await Books.find()
      .sort({ averageRating: -1 })
      .limit(3);

    if (!topThreeBooks.length) {
      return res.status(404).json({ message: "Aucun livre trouvé" });
    }

    return res.status(200).json(topThreeBooks);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur du serveur lors de la récupération des meilleurs livres",
    });
  }
};

exports.addRating = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { userId, rating } = req.body;

    const grade = Number(rating);
    if (isNaN(grade) || grade < 0 || grade > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être un nombre compris entre 0 et 5." });
    }

    const book = await Books.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    book.ratings.push({ userId, grade });

    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = sumRatings / totalRatings;

    const bookUptaded = await book.save();

    return res.status(201).json(bookUptaded);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur lors de l'envoi de la note." });
  }
};

exports.deleteBooks = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Books.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.imageUrl) {
      const imageName = path.basename(book.imageUrl);
      const imagePath = path.join(__dirname, "..", "images", imageName);

      await fs.promises.unlink(imagePath);
    }

    await Books.findByIdAndDelete(bookId);

    res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur lors de la suppression du livre" });
  }
};

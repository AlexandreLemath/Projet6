const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },  // L'utilisateur qui a ajouté le livre
  genre: { type: String, required: true },
  year: { type: Number, required: true }, 
  ratings: [
    {
      userId: { type: String, required: true },  
      grade: { type: Number, required: true },  

    }
  ],
  averageRating: { type: Number, default: 0 }  // La note moyenne calculée
});

module.exports = mongoose.model('Books', bookSchema);

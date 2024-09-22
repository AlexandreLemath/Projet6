const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/userRoutes');
const booksRoutes = require('./routes/booksRoutes');
require('dotenv').config() ;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
//modficitation utiliser un fichier .env
mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.ngsg03j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;
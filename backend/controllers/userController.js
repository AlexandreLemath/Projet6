const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const secretKey = process.env.JWT_SECRET ;

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();
    return res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error); 
    return res.status(500).json({ message: 'Erreur du serveur lors de l\'inscription' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ userId: user._id, token });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error); 
    return res.status(500).json({ message: 'Erreur du serveur lors de la connexion' });
  }
};


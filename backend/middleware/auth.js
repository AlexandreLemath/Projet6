require('dotenv').config();

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET ;

exports.authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }
  
    jwt.verify(token, secretKey, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: 'Token invalide ou expiré' });
      }
  
      req.user = { userId: decodedToken.userId };
      next();
    });
  };
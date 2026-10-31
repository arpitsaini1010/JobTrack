const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please log in again' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Please log in again' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobtrack_jwt_super_secret_key_2026_krish');
    req.user = decoded; // Contains id, name, email
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Please log in again', expired: true });
    }
    return res.status(401).json({ message: 'Please log in again' });
  }
};

module.exports = authMiddleware;

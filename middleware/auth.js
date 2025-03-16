const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded; // Lưu thông tin user (id) vào request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès admin requis' });
  }
  next();
};

module.exports = { requireAdmin };
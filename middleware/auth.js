const { httpError } = require('../utils/http');

// Only logged-in users may continue.
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) return next(httpError(401, 'Not logged in.'));
  req.user = req.session.user;
  next();
}

// Use after requireLogin: only admins may continue.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return next(httpError(403, 'Admins only.'));
  next();
}

module.exports = { requireLogin, requireAdmin };

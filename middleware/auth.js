module.exports = function (req, res, next) {
  if (!req.session || !req.session.user) {
    // If it's an API call return JSON, otherwise redirect
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    return res.redirect('/');
  }
  req.user = req.session.user;
  next();
};
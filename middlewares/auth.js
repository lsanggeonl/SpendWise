/**
 * Authentication middleware
 * Protects routes requiring user login and injects user session into templates
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user;
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
}

/**
 * Guest middleware: redirect already authenticated users to dashboard
 */
function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

/**
 * Global template locals middleware
 */
function setLocals(req, res, next) {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.currentPath = req.path;
  res.locals.query = req.query;
  res.locals.formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('ko-KR') + '원';
  };
  res.locals.formatNumber = (num) => {
    return Number(num || 0).toLocaleString('ko-KR');
  };
  res.locals.formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  next();
}

module.exports = {
  isAuthenticated,
  isGuest,
  setLocals
};

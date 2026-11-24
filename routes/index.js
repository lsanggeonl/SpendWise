const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const transactionsRoutes = require('./transactions');
const budgetRoutes = require('./budget');
const analysisRoutes = require('./analysis');
const challengesRoutes = require('./challenges');
const settingsRoutes = require('./settings');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budget', budgetRoutes);
router.use('/analysis', analysisRoutes);
router.use('/challenges', challengesRoutes);
router.use('/settings', settingsRoutes);

// Root redirect
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});

module.exports = router;

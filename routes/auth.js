const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middlewares/auth');

router.get('/login', isGuest, AuthController.showLogin);
router.post('/login', isGuest, AuthController.login);
router.get('/signup', isGuest, AuthController.showSignup);
router.post('/signup', isGuest, AuthController.signup);
router.get('/logout', isAuthenticated, AuthController.logout);

module.exports = router;

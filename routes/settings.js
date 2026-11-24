const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/settingController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', SettingController.index);
router.post('/profile', SettingController.updateProfile);
router.post('/password', SettingController.updatePassword);

module.exports = router;

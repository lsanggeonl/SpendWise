const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', AnalysisController.index);
router.post('/recalculate', AnalysisController.recalculate);

module.exports = router;

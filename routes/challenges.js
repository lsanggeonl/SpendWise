const express = require('express');
const router = express.Router();
const ChallengeController = require('../controllers/challengeController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', ChallengeController.index);
router.post('/', ChallengeController.create);
router.post('/:id/progress', ChallengeController.addProgress);
router.post('/:id/edit', ChallengeController.update);
router.post('/:id/delete', ChallengeController.delete);

module.exports = router;

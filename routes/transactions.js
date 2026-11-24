const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', TransactionController.index);
router.get('/new', TransactionController.showCreate);
router.post('/', TransactionController.create);
router.get('/:id/edit', TransactionController.showEdit);
router.post('/:id/edit', TransactionController.update);
router.post('/:id/delete', TransactionController.delete);

module.exports = router;

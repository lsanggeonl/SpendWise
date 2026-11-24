const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', BudgetController.index);
router.post('/total', BudgetController.setTotal);
router.post('/category', BudgetController.setCategory);
router.post('/:id/delete', BudgetController.delete);

module.exports = router;

const BudgetService = require('../services/budgetService');

class BudgetController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const yearMonth = req.query.month || currentYearMonth;

      const [budgetComparison, categories] = await Promise.all([
        BudgetService.getMonthlyBudgets(userId, yearMonth),
        BudgetService.getAvailableCategories(userId)
      ]);

      res.render('budget/index', {
        pageTitle: '예산 관리 | SpendWise',
        yearMonth,
        budgetComparison,
        categories,
        message: req.query.message || null
      });
    } catch (err) {
      next(err);
    }
  }

  static async setTotal(req, res, next) {
    try {
      const userId = req.session.user.id;
      let { yearMonth, amount } = req.body;
      if (!yearMonth) {
        const now = new Date();
        yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
      await BudgetService.setTotalBudget(userId, yearMonth, amount);
      res.redirect(`/budget?month=${yearMonth}&message=total_saved`);
    } catch (err) {
      next(err);
    }
  }

  static async setCategory(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { yearMonth, categoryId, amount } = req.body;
      await BudgetService.setCategoryBudget(userId, categoryId, yearMonth, amount);
      res.redirect(`/budget?month=${yearMonth}&message=cat_saved`);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      const yearMonth = req.body.yearMonth || '';
      await BudgetService.deleteBudget(id, userId);
      res.redirect(`/budget?month=${yearMonth}&message=deleted`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BudgetController;

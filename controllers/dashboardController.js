const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const AnalysisService = require('../services/analysisService');
const Category = require('../models/Category');

class DashboardController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const yearMonth = req.query.month || currentYearMonth;

      // Fetch dashboard metrics and user categories in parallel
      const [
        summary,
        budgetComparison,
        categoryExpenses,
        monthlyTrends,
        recentTransactions,
        report,
        categories
      ] = await Promise.all([
        Transaction.getMonthlySummary(userId, yearMonth),
        Budget.getComparison(userId, yearMonth),
        Transaction.getCategoryExpenses(userId, yearMonth),
        Transaction.getMonthlyTrends(userId, 6),
        Transaction.getRecent(userId, 6),
        AnalysisService.diagnoseMonth(userId, yearMonth),
        Category.findForUser(userId)
      ]);

      // Expected month-end expense prediction
      const expectedData = AnalysisService.calculateExpectedMonthEndExpense(yearMonth, summary.totalExpense);

      res.render('dashboard/index', {
        pageTitle: '대시보드 | SpendWise',
        yearMonth,
        summary,
        budgetComparison,
        expectedData,
        categoryExpenses,
        monthlyTrends,
        recentTransactions,
        report,
        categories
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;

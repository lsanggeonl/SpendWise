const Budget = require('../models/Budget');
const Category = require('../models/Category');

class BudgetService {
  static async getMonthlyBudgets(userId, yearMonth) {
    return await Budget.getComparison(userId, yearMonth);
  }

  static async setTotalBudget(userId, yearMonth, amount) {
    const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '').trim() : amount;
    const numAmount = Math.max(0, Number(cleanAmount) || 0);
    return await Budget.upsertTotalBudget(userId, yearMonth, numAmount);
  }

  static async setCategoryBudget(userId, categoryId, yearMonth, amount) {
    const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '').trim() : amount;
    const numAmount = Math.max(0, Number(cleanAmount) || 0);
    return await Budget.upsertCategoryBudget(userId, categoryId, yearMonth, numAmount);
  }

  static async deleteBudget(id, userId) {
    return await Budget.delete(id, userId);
  }

  static async getAvailableCategories(userId) {
    return await Category.findForUser(userId, 'expense');
  }
}

module.exports = BudgetService;

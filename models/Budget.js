const pool = require('../config/db');

class Budget {
  static async findTotalBudget(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT * FROM budgets
       WHERE user_id = ? AND \`year_month\` = ? AND category_id IS NULL
       ORDER BY updated_at DESC, id DESC`,
      [userId, yearMonth]
    );
    return rows[0] || null;
  }

  static async findAllForMonth(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.\`year_month\` = ?
       ORDER BY (b.category_id IS NULL) DESC, c.name ASC`,
      [userId, yearMonth]
    );
    return rows;
  }

  static async upsertTotalBudget(userId, yearMonth, amount) {
    const existing = await this.findTotalBudget(userId, yearMonth);
    if (existing) {
      const [result] = await pool.execute(
        `UPDATE budgets SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [amount, existing.id]
      );
      await pool.execute(
        `DELETE FROM budgets
         WHERE user_id = ? AND \`year_month\` = ? AND category_id IS NULL AND id != ?`,
        [userId, yearMonth, existing.id]
      );
      return result;
    } else {
      const [result] = await pool.execute(
        `INSERT INTO budgets (user_id, category_id, \`year_month\`, amount)
         VALUES (?, NULL, ?, ?)`,
        [userId, yearMonth, amount]
      );
      return result;
    }
  }

  static async upsertCategoryBudget(userId, categoryId, yearMonth, amount) {
    const [result] = await pool.execute(
      `INSERT INTO budgets (user_id, category_id, \`year_month\`, amount)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), updated_at = CURRENT_TIMESTAMP`,
      [userId, categoryId, yearMonth, amount]
    );
    return result;
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getComparison(userId, yearMonth) {
    // 1. Total monthly budget vs Total actual expenses
    const totalBudgetRow = await this.findTotalBudget(userId, yearMonth);
    const totalBudgetAmount = totalBudgetRow ? Number(totalBudgetRow.amount) : 0;

    // Actual total expense for the month
    const [totalSpentRows] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total_expense
       FROM transactions
       WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`,
      [userId, yearMonth]
    );
    const totalExpense = Number(totalSpentRows[0].total_expense || 0);

    const totalUsageRate = totalBudgetAmount > 0
      ? Number(((totalExpense / totalBudgetAmount) * 100).toFixed(1))
      : 0;

    const totalWarningTier = this.calculateWarningTier(totalUsageRate, totalBudgetAmount > 0);

    // 2. Category budgets vs Category actual expenses
    const [categoryBudgets] = await pool.execute(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.color AS category_color,
         c.icon AS category_icon,
         b.id AS budget_id,
         COALESCE(b.amount, 0) AS budget_amount,
         COALESCE(spent.total_spent, 0) AS spent_amount
       FROM categories c
       LEFT JOIN budgets b ON b.category_id = c.id AND b.user_id = ? AND b.\`year_month\` = ?
       LEFT JOIN (
         SELECT category_id, SUM(amount) AS total_spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
         GROUP BY category_id
       ) spent ON spent.category_id = c.id
       WHERE (c.user_id IS NULL OR c.user_id = ?)
         AND (b.id IS NOT NULL OR spent.total_spent > 0)
       ORDER BY (b.id IS NOT NULL) DESC, spent_amount DESC`,
      [userId, yearMonth, userId, yearMonth, userId]
    );

    const categoryComparisons = categoryBudgets.map(item => {
      const budgetAmt = Number(item.budget_amount || 0);
      const spentAmt = Number(item.spent_amount || 0);
      const remaining = budgetAmt > 0 ? budgetAmt - spentAmt : 0;
      const usageRate = budgetAmt > 0 ? Number(((spentAmt / budgetAmt) * 100).toFixed(1)) : 0;
      const tier = this.calculateWarningTier(usageRate, budgetAmt > 0);

      return {
        ...item,
        budget_amount: budgetAmt,
        spent_amount: spentAmt,
        remaining,
        usage_rate: usageRate,
        tier
      };
    });

    return {
      totalBudget: totalBudgetAmount,
      hasTotalBudget: !!totalBudgetRow,
      totalExpense,
      remaining: totalBudgetAmount > 0 ? totalBudgetAmount - totalExpense : 0,
      usageRate: totalUsageRate,
      warningTier: totalWarningTier,
      categories: categoryComparisons
    };
  }

  static calculateWarningTier(rate, hasBudget = true) {
    if (!hasBudget) {
      return {
        level: 'none',
        label: '예산 미설정',
        class: 'neutral',
        color: '#6B7280',
        badge: 'secondary',
        icon: 'info',
        message: '설정된 예산이 없습니다. 예산을 설정하여 지출을 체계적으로 관리하세요.'
      };
    }

    if (rate >= 100) {
      return {
        level: 'danger_100',
        label: '초과 위험 (100% 초과)',
        class: 'danger',
        color: '#EF4444',
        badge: 'danger',
        icon: 'alert-triangle',
        message: `예산을 ${rate}% 소진하여 초과 지출이 발생했습니다. 즉각적인 소비 차단이 필요합니다.`
      };
    } else if (rate >= 90) {
      return {
        level: 'warning_90',
        label: '경고 단계 (90% 도달)',
        class: 'warning-high',
        color: '#F97316',
        badge: 'warning',
        icon: 'alert-circle',
        message: `예산의 ${rate}%를 사용했습니다. 한도 소진이 임박했으니 필수 지출 외 결제를 멈추세요.`
      };
    } else if (rate >= 70) {
      return {
        level: 'warning_70',
        label: '주의 단계 (70% 도달)',
        class: 'warning-low',
        color: '#F59E0B',
        badge: 'warning',
        icon: 'bell',
        message: `예산의 ${rate}%를 소진했습니다. 월말까지 지출 속도 조절이 권장됩니다.`
      };
    } else {
      return {
        level: 'safe',
        label: '안정 (70% 미만)',
        class: 'success',
        color: '#10B981',
        badge: 'success',
        icon: 'check-circle',
        message: `예산 대비 ${rate}% 사용하여 안정적으로 소비를 통제하고 있습니다.`
      };
    }
  }
}

module.exports = Budget;

const pool = require('../config/db');

class Analysis {
  static async getReport(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT * FROM analysis_reports
       WHERE user_id = ? AND \`year_month\` = ?`,
      [userId, yearMonth]
    );
    if (!rows[0]) return null;
    const report = rows[0];
    if (typeof report.score_breakdown === 'string') {
      try {
        report.score_breakdown = JSON.parse(report.score_breakdown);
      } catch (e) {
        report.score_breakdown = {};
      }
    }
    return report;
  }

  static async upsertReport(userId, yearMonth, data) {
    const {
      habitScore,
      grade,
      totalIncome,
      totalExpense,
      netSavings,
      expectedMonthEndExpense,
      budgetUsageRate,
      overspendingCount,
      overspendingTotal,
      microTransactionCount,
      microTransactionTotal,
      scoreBreakdown,
      feedbackSummary
    } = data;

    const breakdownJson = JSON.stringify(scoreBreakdown || {});

    const [result] = await pool.execute(
      `INSERT INTO analysis_reports
       (user_id, \`year_month\`, habit_score, grade, total_income, total_expense, net_savings,
        expected_month_end_expense, budget_usage_rate, overspending_count, overspending_total,
        micro_transaction_count, micro_transaction_total, score_breakdown, feedback_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         habit_score = VALUES(habit_score),
         grade = VALUES(grade),
         total_income = VALUES(total_income),
         total_expense = VALUES(total_expense),
         net_savings = VALUES(net_savings),
         expected_month_end_expense = VALUES(expected_month_end_expense),
         budget_usage_rate = VALUES(budget_usage_rate),
         overspending_count = VALUES(overspending_count),
         overspending_total = VALUES(overspending_total),
         micro_transaction_count = VALUES(micro_transaction_count),
         micro_transaction_total = VALUES(micro_transaction_total),
         score_breakdown = VALUES(score_breakdown),
         feedback_summary = VALUES(feedback_summary),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId, yearMonth, habitScore, grade, totalIncome, totalExpense, netSavings,
        expectedMonthEndExpense, budgetUsageRate, overspendingCount, overspendingTotal,
        microTransactionCount, microTransactionTotal, breakdownJson, feedbackSummary
      ]
    );
    return result;
  }

  static async getHistory(userId, limit = 6) {
    const [rows] = await pool.execute(
      `SELECT id, \`year_month\`, habit_score, grade, total_income, total_expense,
              expected_month_end_expense, budget_usage_rate, overspending_count, micro_transaction_count
       FROM analysis_reports
       WHERE user_id = ?
       ORDER BY \`year_month\` DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );
    return rows;
  }
}

module.exports = Analysis;

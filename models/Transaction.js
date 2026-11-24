const pool = require('../config/db');

class Transaction {
  static async create({ userId, categoryId, type, amount, title, description, transactionDate, paymentMethod = '신용카드', isFixed = 0 }) {
    const [result] = await pool.execute(
      `INSERT INTO transactions
       (user_id, category_id, type, amount, title, description, transaction_date, payment_method, is_fixed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, categoryId, type, amount, title, description || null, transactionDate, paymentMethod, isFixed ? 1 : 0]
    );
    return result.insertId;
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    return rows[0] || null;
  }

  static async update(id, userId, { categoryId, type, amount, title, description, transactionDate, paymentMethod, isFixed }) {
    const [result] = await pool.execute(
      `UPDATE transactions
       SET category_id = ?, type = ?, amount = ?, title = ?, description = ?,
           transaction_date = ?, payment_method = ?, is_fixed = ?
       WHERE id = ? AND user_id = ?`,
      [categoryId, type, amount, title, description || null, transactionDate, paymentMethod, isFixed ? 1 : 0, id, userId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async findWithFilters(userId, {
    yearMonth,
    type,
    categoryId,
    keyword,
    startDate,
    endDate,
    limit = 20,
    offset = 0,
    sortBy = 'transaction_date',
    sortOrder = 'DESC'
  } = {}) {
    let sql = `
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (yearMonth) {
      sql += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?';
      params.push(yearMonth);
    }
    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }
    if (categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(categoryId);
    }
    if (startDate) {
      sql += ' AND t.transaction_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND t.transaction_date <= ?';
      params.push(endDate);
    }
    if (keyword) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const allowedSortFields = ['transaction_date', 'amount', 'title', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.transaction_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${order}, t.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  static async countWithFilters(userId, { yearMonth, type, categoryId, keyword, startDate, endDate } = {}) {
    let sql = 'SELECT COUNT(*) AS total FROM transactions t WHERE t.user_id = ?';
    const params = [userId];

    if (yearMonth) {
      sql += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?';
      params.push(yearMonth);
    }
    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }
    if (categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(categoryId);
    }
    if (startDate) {
      sql += ' AND t.transaction_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND t.transaction_date <= ?';
      params.push(endDate);
    }
    if (keyword) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [rows] = await pool.execute(sql, params);
    return rows[0].total;
  }

  static async getMonthlySummary(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
         COALESCE(SUM(CASE WHEN type = 'expense' AND is_fixed = 1 THEN amount ELSE 0 END), 0) AS fixed_expense,
         COUNT(*) AS total_count
       FROM transactions
       WHERE user_id = ? AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`,
      [userId, yearMonth]
    );

    const row = rows[0] || {};
    const totalIncome = Number(row.total_income || 0);
    const totalExpense = Number(row.total_expense || 0);
    const fixedExpense = Number(row.fixed_expense || 0);
    const netSavings = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      fixedExpense,
      netSavings,
      totalCount: Number(row.total_count || 0)
    };
  }

  static async getCategoryExpenses(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.color AS category_color,
         c.icon AS category_icon,
         COALESCE(SUM(t.amount), 0) AS total_amount,
         COUNT(t.id) AS transaction_count
       FROM categories c
       JOIN transactions t ON t.category_id = c.id
       WHERE t.user_id = ?
         AND t.type = 'expense'
         AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total_amount DESC`,
      [userId, yearMonth]
    );

    const totalExpense = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);
    return rows.map(r => ({
      ...r,
      total_amount: Number(r.total_amount),
      percentage: totalExpense > 0 ? Number(((Number(r.total_amount) / totalExpense) * 100).toFixed(1)) : 0
    }));
  }

  static async getRecent(userId, limit = 5) {
    const [rows] = await pool.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );
    return rows;
  }

  static async getMonthlyTrends(userId, monthsCount = 6) {
    const [rows] = await pool.execute(
      `SELECT
         DATE_FORMAT(transaction_date, '%Y-%m') AS \`year_month\`,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?
         AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY \`year_month\` ASC`,
      [userId, Number(monthsCount)]
    );
    return rows.map(r => ({
      year_month: r.year_month,
      total_income: Number(r.total_income),
      total_expense: Number(r.total_expense)
    }));
  }

  static async getOverspending(userId, yearMonth, threshold) {
    const [rows] = await pool.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
         AND t.type = 'expense'
         AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
         AND t.amount >= ?
       ORDER BY t.amount DESC`,
      [userId, yearMonth, Number(threshold)]
    );
    return rows;
  }

  static async getMicroTransactions(userId, yearMonth, threshold) {
    const [rows] = await pool.execute(
      `SELECT
         t.title,
         c.name AS category_name,
         c.color AS category_color,
         COUNT(*) AS count,
         SUM(t.amount) AS total_amount,
         AVG(t.amount) AS avg_amount,
         MAX(t.transaction_date) AS last_date
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
         AND t.type = 'expense'
         AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
         AND t.amount <= ?
       GROUP BY t.title, c.name, c.color
       ORDER BY count DESC, total_amount DESC`,
      [userId, yearMonth, Number(threshold)]
    );
    return rows.map(r => ({
      ...r,
      count: Number(r.count),
      total_amount: Number(r.total_amount),
      avg_amount: Number(r.avg_amount)
    }));
  }

  static async getDailyExpenseTrend(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT
         DATE_FORMAT(transaction_date, '%d') AS day_num,
         transaction_date,
         COALESCE(SUM(amount), 0) AS daily_amount
       FROM transactions
       WHERE user_id = ?
         AND type = 'expense'
         AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
       GROUP BY transaction_date
       ORDER BY transaction_date ASC`,
      [userId, yearMonth]
    );
    return rows.map(r => ({
      day: Number(r.day_num),
      date: r.transaction_date,
      amount: Number(r.daily_amount)
    }));
  }
}

module.exports = Transaction;

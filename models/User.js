const pool = require('../config/db');

class User {
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, monthly_income_target, overspending_threshold, micro_tx_threshold, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async create({ email, password, name, monthlyIncomeTarget = 3500000, overspendingThreshold = 100000, microTxThreshold = 10000 }) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, name, monthly_income_target, overspending_threshold, micro_tx_threshold)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password, name, monthlyIncomeTarget, overspendingThreshold, microTxThreshold]
    );
    return result.insertId;
  }

  static async updateProfile(id, { name, monthlyIncomeTarget, overspendingThreshold, microTxThreshold }) {
    await pool.execute(
      `UPDATE users
       SET name = ?, monthly_income_target = ?, overspending_threshold = ?, micro_tx_threshold = ?
       WHERE id = ?`,
      [name, monthlyIncomeTarget, overspendingThreshold, microTxThreshold, id]
    );
    return true;
  }

  static async updatePassword(id, hashedPassword) {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return true;
  }
}

module.exports = User;

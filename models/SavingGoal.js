const pool = require('../config/db');

class SavingGoal {
  static async findForUser(userId, status = null) {
    let sql = 'SELECT * FROM saving_goals WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY status ASC, end_date ASC';
    const [rows] = await pool.execute(sql, params);
    
    return rows.map(r => {
      const target = Number(r.target_amount);
      const current = Number(r.current_amount);
      const progress = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;
      
      const now = new Date();
      const end = new Date(r.end_date);
      const diffTime = end - now;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...r,
        target_amount: target,
        current_amount: current,
        progress,
        daysLeft: daysLeft >= 0 ? daysLeft : 0,
        isExpired: daysLeft < 0 && r.status === 'ongoing'
      };
    });
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM saving_goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    const target = Number(r.target_amount);
    const current = Number(r.current_amount);
    const progress = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;

    return {
      ...r,
      target_amount: target,
      current_amount: current,
      progress
    };
  }

  static async create({ userId, title, targetAmount, currentAmount = 0, startDate, endDate, category = '일반 저축', icon = 'target' }) {
    const [result] = await pool.execute(
      `INSERT INTO saving_goals (user_id, title, target_amount, current_amount, start_date, end_date, category, icon, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ongoing')`,
      [userId, title, targetAmount, currentAmount, startDate, endDate, category, icon]
    );
    return result.insertId;
  }

  static async update(id, userId, { title, targetAmount, currentAmount, startDate, endDate, category, icon, status }) {
    const [result] = await pool.execute(
      `UPDATE saving_goals
       SET title = ?, target_amount = ?, current_amount = ?, start_date = ?, end_date = ?, category = ?, icon = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [title, targetAmount, currentAmount, startDate, endDate, category, icon, status, id, userId]
    );
    return result.affectedRows > 0;
  }

  static async addProgress(id, userId, amount) {
    const goal = await this.findById(id, userId);
    if (!goal) return false;

    const newAmount = Number(goal.current_amount) + Number(amount);
    const newStatus = newAmount >= Number(goal.target_amount) ? 'completed' : goal.status;

    await pool.execute(
      `UPDATE saving_goals
       SET current_amount = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [newAmount, newStatus, id, userId]
    );
    return true;
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM saving_goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = SavingGoal;

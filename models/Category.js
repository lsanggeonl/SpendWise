const pool = require('../config/db');

class Category {
  static async findForUser(userId, type = null) {
    let sql = `
      SELECT id, user_id, name, type, icon, color, is_system, created_at
      FROM categories
      WHERE (user_id IS NULL OR user_id = ?)
    `;
    const params = [userId];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY is_system DESC, name ASC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ userId, name, type, icon = 'tag', color = '#6366F1' }) {
    const [result] = await pool.execute(
      `INSERT INTO categories (user_id, name, type, icon, color, is_system)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, name, type, icon, color]
    );
    return result.insertId;
  }

  static async delete(id, userId) {
    // Only non-system categories owned by the user can be deleted
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_system = 0',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Category;

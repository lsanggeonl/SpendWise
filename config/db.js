const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'webuser',
  password: process.env.DB_PASSWORD || 'WebPassword!',
  database: process.env.DB_NAME || 'spendwise_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  decimalNumbers: true
});

module.exports = pool;

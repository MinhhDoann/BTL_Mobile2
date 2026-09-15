const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '352001',
  database: process.env.DB_NAME || 'mobile2',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

module.exports = db;

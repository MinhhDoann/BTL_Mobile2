// Set a password for an existing account; never changes its role.
const mysql = require('mysql2/promise');

async function main() {
  const email = process.argv[2];
  const password = process.env.ACCOUNT_PASSWORD;
  if (!email || !password || password.length > 255) {
    throw new Error('Usage: set ACCOUNT_PASSWORD (1–255 characters), then node set-password.js user@example.com');
  }
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'mobile2',
  });
  try {
    const [result] = await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [password, email]);
    if (!result.affectedRows) throw new Error('Không tìm thấy email trong bảng users.');
    console.log('Đã cập nhật mật khẩu. Role của tài khoản được giữ nguyên.');
  } finally {
    await db.end();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });

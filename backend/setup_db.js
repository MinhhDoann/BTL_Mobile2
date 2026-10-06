const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost', 
  user: 'root', 
  password: process.env.DB_PASSWORD || '1234', 
  database: 'mobile2'
}).then(async c => {
  try {
    await c.query(`
      CREATE TABLE IF NOT EXISTS payout_requests (
        request_id INT AUTO_INCREMENT PRIMARY KEY, 
        artist_id INT NOT NULL, 
        amount DECIMAL(15,2) NOT NULL, 
        bank_name VARCHAR(100), 
        account_number VARCHAR(100), 
        account_holder VARCHAR(100), 
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
      )
    `);
    console.log('Tạo bảng payout_requests thành công!');
    try {
      await c.query('ALTER TABLE artists ADD COLUMN banner_clicks INT DEFAULT 0');
      console.log('Đã thêm cột banner_clicks vào bảng artists!');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột banner_clicks đã có sẵn.');
      } else {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    c.end();
  }
});

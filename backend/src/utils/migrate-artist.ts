import mysql from 'mysql2/promise';

async function migrate() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '352001';
  const database = process.env.DB_NAME || 'mobile2';

  console.log(`Kết nối cơ sở dữ liệu ${database} tại ${host}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
    });
  } catch (err: any) {
    console.warn('Không thể kết nối trực tiếp MySQL (có thể dịch vụ chưa bật):', err.message);
    return;
  }

  try {
    console.log('1. Cập nhật cột role trong bảng users...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'artist') DEFAULT 'user'
    `);
    console.log('-> Đã cập nhật role ENUM thành công.');

    console.log('2. Kiểm tra và thêm cột user_id vào bảng artists...');
    const [cols]: [any[], any] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'artists' AND COLUMN_NAME = 'user_id'
    `, [database]);

    if (!cols.length) {
      await connection.execute(`
        ALTER TABLE artists 
        ADD COLUMN user_id INT NULL UNIQUE,
        ADD CONSTRAINT fk_artists_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      `);
      console.log('-> Đã thêm cột user_id và khóa ngoại vào bảng artists.');
    } else {
      console.log('-> Cột user_id đã tồn tại trong artists.');
    }

    console.log('3. Tạo tài khoản mẫu nghệ sĩ (nếu chưa có)...');
    const [existingUsers]: [any[], any] = await connection.query(
      'SELECT user_id, email FROM users WHERE email = ?',
      ['artist@spotify.com']
    );

    let artistUserId: number;
    if (!existingUsers.length) {
      const [insertResult]: [any, any] = await connection.execute(
        `INSERT INTO users (username, email, password_hash, role, is_premium)
         VALUES ('Sơn Tùng M-TP', 'artist@spotify.com', '123456', 'artist', TRUE)`
      );
      artistUserId = insertResult.insertId;
      console.log('-> Đã tạo tài khoản artist@spotify.com (mật khẩu: 123456)');
    } else {
      artistUserId = existingUsers[0].user_id;
      await connection.execute(
        `UPDATE users SET role = 'artist' WHERE user_id = ?`,
        [artistUserId]
      );
      console.log('-> Đã cập nhật role artist cho tài khoản artist@spotify.com');
    }

    // Liên kết với nghệ sĩ Sơn Tùng (artist_id = 1) nếu có
    const [artists]: [any[], any] = await connection.query(
      'SELECT artist_id FROM artists WHERE artist_id = 1'
    );
    if (artists.length) {
      await connection.execute(
        'UPDATE artists SET user_id = ? WHERE artist_id = 1',
        [artistUserId]
      );
      console.log('-> Đã liên kết artist_id 1 (Sơn Tùng M-TP) với user_id', artistUserId);
    }

    console.log('✅ Hoàn tất migration nghệ sĩ!');
  } catch (err: any) {
    console.error('Lỗi trong quá trình migration:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();

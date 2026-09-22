import mysql from 'mysql2/promise';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function syncArtistsWithUsers() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '352001';
  const database = process.env.DB_NAME || 'mobile2';

  console.log(`Kết nối MySQL: ${database} tại ${host}...`);
  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, database });
  } catch (err: any) {
    console.error('Không thể kết nối cơ sở dữ liệu:', err.message);
    return;
  }

  try {
    const [artists]: [any[], any] = await connection.query('SELECT artist_id, name, avatar_url, user_id FROM artists');
    console.log(`Tìm thấy ${artists.length} nghệ sĩ trong bảng artists.`);

    for (const artist of artists) {
      const slug = slugify(artist.name) || `artist${artist.artist_id}`;
      const email = `${slug}@artist.com`;

      // 1. Kiểm tra xem artist đã có user_id hợp lệ chưa
      if (artist.user_id) {
        const [userRows]: [any[], any] = await connection.query(
          'SELECT user_id, username, email, role FROM users WHERE user_id = ?',
          [artist.user_id]
        );
        if (userRows.length > 0) {
          if (userRows[0].role !== 'artist') {
            await connection.execute('UPDATE users SET role = "artist" WHERE user_id = ?', [artist.user_id]);
            console.log(`-> Cập nhật role = 'artist' cho user_id ${artist.user_id} (${userRows[0].username})`);
          }
          console.log(`Nghệ sĩ "${artist.name}" (ID: ${artist.artist_id}) đã liên kết với user_id ${artist.user_id} (${userRows[0].email}).`);
          continue;
        }
      }

      // 2. Tìm xem đã có user nào trùng email chưa
      const [existingUsers]: [any[], any] = await connection.query(
        'SELECT user_id, username, email, role FROM users WHERE email = ?',
        [email]
      );

      let targetUserId: number;
      if (existingUsers.length > 0) {
        targetUserId = existingUsers[0].user_id;
        await connection.execute(
          'UPDATE users SET role = "artist", username = ? WHERE user_id = ?',
          [artist.name, targetUserId]
        );
        console.log(`-> Đã gắn role = 'artist' cho user có sẵn: ${email} (user_id: ${targetUserId})`);
      } else {
        // Tạo mới user trong bảng users
        const [insertResult]: [any, any] = await connection.execute(
          `INSERT INTO users (username, email, password_hash, avatar_url, role, is_premium)
           VALUES (?, ?, '123456', ?, 'artist', TRUE)`,
          [artist.name, email, artist.avatar_url || null]
        );
        targetUserId = insertResult.insertId;
        console.log(`-> Đã tạo tài khoản mới: ${email} | Pass: 123456 | Role: artist (user_id: ${targetUserId})`);
      }

      // 3. Liên kết artist với targetUserId
      await connection.execute('UPDATE artists SET user_id = ? WHERE artist_id = ?', [targetUserId, artist.artist_id]);
      console.log(`-> Đã liên kết nghệ sĩ "${artist.name}" (ID: ${artist.artist_id}) với user_id: ${targetUserId}`);
    }

    console.log('\n--- DANH SÁCH TÀI KHOẢN NGHỆ SĨ SAU KHI ĐỒNG BỘ ---');
    const [finalUsers]: [any[], any] = await connection.query(
      `SELECT u.user_id, u.username, u.email, u.role, a.artist_id 
       FROM users u 
       JOIN artists a ON a.user_id = u.user_id 
       WHERE u.role = 'artist'`
    );
    console.table(finalUsers);

    console.log('✅ Hoàn tất thêm role artist và tạo tài khoản cho tất cả các nghệ sĩ!');
  } catch (err: any) {
    console.error('Lỗi khi đồng bộ:', err.message);
  } finally {
    await connection.end();
  }
}

syncArtistsWithUsers();

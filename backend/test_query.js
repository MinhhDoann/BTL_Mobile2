const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createPool({host:'localhost',user:'root',password:'1234',database:'mobile2'});
  
  const [playlists] = await db.query(`
    SELECT
      p.playlist_id AS id,
      p.title,
      CONCAT(COUNT(ps.song_id), ' bài hát') AS subtitle,
      'playlist' AS type,
      p.cover_url
    FROM playlists p
    LEFT JOIN playlist_songs ps ON ps.playlist_id = p.playlist_id
    GROUP BY p.playlist_id, p.title, p.cover_url
    ORDER BY p.created_at DESC
  `);
  
  const [albums] = await db.query(`
    SELECT
      al.album_id AS id,
      al.title,
      COALESCE(ar.name, 'Album') AS subtitle,
      'album' AS type,
      al.cover_url
    FROM albums al
    LEFT JOIN artists ar ON ar.artist_id = al.artist_id
    ORDER BY al.release_date DESC
  `);
  
  const [artists] = await db.query(`
    SELECT
      ar.artist_id AS id,
      ar.name AS title,
      'Nghệ sĩ' AS subtitle,
      'artist' AS type,
      ar.avatar_url AS cover_url
    FROM artists ar
    ORDER BY ar.name ASC
  `);
  
  const items = [...playlists, ...albums, ...artists];
  console.log('Items length:', items.length);
  console.log(JSON.stringify(items, null, 2));
  
  await db.end();
}

run().catch(console.error);

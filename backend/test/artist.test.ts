import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { AddressInfo } from 'node:net';
import { createArtistRouter } from '../src/routes/artist.routes';

test('artist router authorization, song publishing, and revenue calculation', async (t) => {
  let user: any = { user_id: 10, username: 'CaSiTest', email: 'artist@test.com', role: 'artist' };

  const mockArtists = [
    { artist_id: 99, name: 'CaSiTest', bio: 'Nghệ sĩ trẻ', avatar_url: 'http://example.com/avatar.jpg', user_id: 10 },
    { artist_id: 100, name: 'CaSiKhac', bio: 'Nghệ sĩ khác', avatar_url: 'http://example.com/other.jpg', user_id: 20 },
  ];

  const mockSongs: any[] = [
    { song_id: 1, title: 'Hit Mùa Hè', duration: 200, audio_url: 'http://audio.mp3', cover_url: 'http://cover.jpg', lyrics: '', play_count: 500, artist_id: 99, album_id: null, created_at: new Date() },
    { song_id: 2, title: 'Bài Ca Mùa Thu', duration: 180, audio_url: 'http://audio2.mp3', cover_url: 'http://cover2.jpg', lyrics: '', play_count: 1000, artist_id: 99, album_id: null, created_at: new Date() },
    { song_id: 3, title: 'Nhạc người khác', duration: 210, audio_url: 'http://audio3.mp3', cover_url: 'http://cover3.jpg', lyrics: '', play_count: 300, artist_id: 100, album_id: null, created_at: new Date() },
  ];

  const mockDb = {
    query: async (sql: string, args: any[] = []) => {
      if (sql.includes('SELECT artist_id') && sql.includes('WHERE user_id = ?')) {
        return [mockArtists.filter((a) => a.user_id === args[0])];
      }
      if (sql.includes('SELECT') && sql.includes('FROM songs s') && sql.includes('WHERE s.artist_id = ?')) {
        return [mockSongs.filter((s) => s.artist_id === args[0])];
      }
      if (sql.includes('SELECT') && sql.includes('COUNT(song_id) AS total_songs')) {
        const artistSongs = mockSongs.filter((s) => s.artist_id === args[0]);
        const total_plays = artistSongs.reduce((sum, s) => sum + s.play_count, 0);
        return [[{ total_songs: artistSongs.length, total_plays }]];
      }
      if (sql.includes('SELECT') && sql.includes('(play_count * ?)') && sql.includes('FROM songs')) {
        const rate = args[0];
        const artistId = args[1];
        const artistSongs = mockSongs
          .filter((s) => s.artist_id === artistId)
          .map((s) => ({ ...s, song_revenue: s.play_count * rate, created_date: '22/09/2026' }));
        return [artistSongs];
      }
      if (sql.includes('INSERT INTO songs')) {
        const [title, duration, audio_url, cover_url, lyrics, artist_id, album_id] = args;
        const newId = mockSongs.length + 1;
        mockSongs.push({
          song_id: newId,
          title,
          duration,
          audio_url,
          cover_url,
          lyrics,
          play_count: 0,
          artist_id,
          album_id,
          created_at: new Date(),
        });
        return [{ insertId: newId }];
      }
      if (sql.includes('SELECT song_id, artist_id FROM songs WHERE song_id = ?')) {
        return [mockSongs.filter((s) => s.song_id === args[0])];
      }
      if (sql.includes('DELETE FROM songs WHERE song_id = ?')) {
        const idx = mockSongs.findIndex((s) => s.song_id === args[0]);
        if (idx !== -1) mockSongs.splice(idx, 1);
        return [{ affectedRows: 1 }];
      }
      if (sql.includes('UPDATE users SET role = "artist" WHERE user_id = ?')) {
        user.role = 'artist';
        return [{ affectedRows: 1 }];
      }
      if (sql.includes('SELECT COALESCE(SUM(play_count), 0) * ? AS total_revenue')) {
        const artistSongs = mockSongs.filter((s) => s.artist_id === args[1]);
        const total = artistSongs.reduce((sum, s) => sum + s.play_count * args[0], 0);
        return [[{ total_revenue: total }]];
      }
      return [[]];
    },
  };

  const app = express();
  app.use(express.json());
  // Fake auth middleware
  app.use((req: any, _res, next) => {
    req.user = user;
    next();
  });
  app.use('/api/artist', createArtistRouter(mockDb));

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });

  const address = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, method = 'GET', body?: any) =>
    fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  // 1. Regular user gets 403 when trying to access artist profile
  user = { user_id: 5, username: 'NormalUser', email: 'user@test.com', role: 'user' };
  const resForbidden = await request('/api/artist/profile');
  assert.equal(resForbidden.status, 403);

  // 2. Regular user can upgrade to artist via /register
  const resUpgrade = await request('/api/artist/register', 'POST');
  assert.equal(resUpgrade.status, 200);
  assert.equal(user.role, 'artist');

  // 3. Artist user can get profile
  user = { user_id: 10, username: 'CaSiTest', email: 'artist@test.com', role: 'artist' };
  const resProfile = await request('/api/artist/profile');
  assert.equal(resProfile.status, 200);
  const profileData = (await resProfile.json()) as any;
  assert.equal(profileData.artist.artist_id, 99);
  assert.equal(profileData.artist.name, 'CaSiTest');

  // 4. Artist can list songs with revenue
  const resSongs = await request('/api/artist/songs');
  assert.equal(resSongs.status, 200);
  const songsData = (await resSongs.json()) as any;
  assert.equal(songsData.songs.length, 2);
  // Song 1: 500 plays * 100 VND = 50,000 VND
  assert.equal(songsData.songs[0].revenue, 50000);
  // Song 2: 1000 plays * 100 VND = 100,000 VND
  assert.equal(songsData.songs[1].revenue, 100000);

  // 5. Artist can publish a new song
  const resPublish = await request('/api/artist/songs', 'POST', {
    title: 'Bài Hát Mới 2026',
    duration: 215,
    audio_url: 'https://example.com/new.mp3',
    cover_url: 'https://example.com/new.jpg',
  });
  assert.equal(resPublish.status, 201);
  const publishData = (await resPublish.json()) as any;
  assert.equal(publishData.ok, true);
  assert.equal(mockSongs.length, 4);

  // 6. Revenue endpoint calculates total plays and VND
  const resRevenue = await request('/api/artist/revenue');
  assert.equal(resRevenue.status, 200);
  const revData = (await resRevenue.json()) as any;
  // Total plays for artist 99: 500 + 1000 + 0 = 1500 plays
  assert.equal(revData.total_plays, 1500);
  // 1500 plays * 100 VND = 150,000 VND
  assert.equal(revData.total_revenue, 150000);
  assert.equal(revData.currency, 'VNĐ');

  // 7. Requesting payout within balance succeeds
  const resPayoutOk = await request('/api/artist/payout-request', 'POST', {
    amount: 100000,
    bank_name: 'MB Bank',
    account_number: '0123456789',
    account_holder: 'NGUYEN VAN A',
  });
  assert.equal(resPayoutOk.status, 200);
  const payoutData = (await resPayoutOk.json()) as any;
  assert.equal(payoutData.ok, true);

  // 8. Requesting payout exceeding balance is rejected
  const resPayoutOver = await request('/api/artist/payout-request', 'POST', {
    amount: 9999999,
    bank_name: 'MB Bank',
    account_number: '0123456789',
    account_holder: 'NGUYEN VAN A',
  });
  assert.equal(resPayoutOver.status, 400);

  // 9. Artist cannot delete another artist's song
  const resDeleteOther = await request('/api/artist/songs/3', 'DELETE');
  assert.equal(resDeleteOther.status, 403);

  // 10. Artist can delete their own song
  const resDeleteOwn = await request('/api/artist/songs/1', 'DELETE');
  assert.equal(resDeleteOwn.status, 200);
  assert.equal(mockSongs.find((s) => s.song_id === 1), undefined);
});

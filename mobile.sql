Create database Mobile2;
Use Mobile2;

-- 2. Bảng Người dùng (users)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_premium BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Nghệ sĩ (artists)
CREATE TABLE artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Album (albums)
CREATE TABLE albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    cover_url VARCHAR(255),
    release_date DATE,
    artist_id INT,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

-- 5. Bảng Thể loại (genres)
CREATE TABLE genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 6. Bảng Bài hát (songs)
CREATE TABLE songs (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    duration INT NOT NULL, -- Thời lượng tính bằng giây (vd: 210 = 3 phút 30 giây)
    audio_url VARCHAR(255) NOT NULL,
    cover_url VARCHAR(255),
    lyrics TEXT,
    play_count BIGINT DEFAULT 0,
    artist_id INT NOT NULL,
    album_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE SET NULL
);

-- 7. Bảng trung gian: Thể loại của bài hát (song_genres)
CREATE TABLE song_genres (
    song_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (song_id, genre_id),
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

-- 8. Bảng Danh sách phát (playlists)
CREATE TABLE playlists (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    cover_url VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Bảng trung gian: Bài hát trong Playlist (playlist_songs)
CREATE TABLE playlist_songs (
    playlist_id INT NOT NULL,
    song_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_index INT DEFAULT 0,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);

-- 10. Bảng Bài hát yêu thích (user_favorite_songs)
CREATE TABLE user_favorite_songs (
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);

-- 11. Bảng Lịch sử nghe nhạc (listening_history)
CREATE TABLE listening_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);


USE Mobile2;

-- Chèn dữ liệu Thể loại (Đã thêm dấu phẩy bị thiếu ở 'Ballad')
INSERT INTO genres (name) VALUES 
('Pop'), ('R&B'), ('Hip-Hop/Rap'), ('Indie'), ('Ballad'), 
('Rock'), ('EDM'), ('Jazz'), ('Classical'), ('Lofi');

-- Chèn dữ liệu Người dùng (Đã thêm dấu phẩy bị thiếu ở dòng nguyenvana)
INSERT INTO users (username, email, password_hash, role, is_premium) VALUES 
('admin', 'admin@spotify.com', 'hashed_password_123', 'admin', TRUE),
('nguyenvana', 'ana@gmail.com', 'hashed_password_456', 'user', FALSE),
('tranthib', 'bt thi@gmail.com', 'hashed_password_789', 'user', TRUE),
('levanc', 'levanc@gmail.com', 'hashed_password_abc', 'user', FALSE),
('hoangphuong', 'phuonghn@gmail.com', 'hashed_password_xyz', 'user', TRUE);

-- Chèn dữ liệu Nghệ sĩ
INSERT INTO artists (name, bio, avatar_url) VALUES 
('Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ người Việt Nam.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
('Đen Vâu', 'Rapper người Việt Nam.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
('Bích Phương', 'Nữ ca sĩ với nhiều bản hit Pop Ballad.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'),
('Hà Anh Tuấn', 'Nam ca sĩ nổi tiếng với các live concert chất lượng.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'),
('W/n', 'Nhà sản xuất âm nhạc trẻ với các ca khúc Lofi triệu view.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'),
('Phương Ly', 'Nữ ca sĩ vạn người mê với các bản hit ngọt ngào.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80'),
('Olew', 'Ca sĩ, nhạc sĩ trẻ tài năng với siêu hit Pháo Hoa.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80');

-- Chèn dữ liệu Album
INSERT INTO albums (title, cover_url, release_date, artist_id) VALUES 
('Chúng Ta', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', '2020-12-20', 1);

-- Chèn dữ liệu Bài hát
INSERT INTO songs (title, duration, audio_url, cover_url, play_count, artist_id, album_id) VALUES 
('Anh Là Ai', 210, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_jukysan.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80', 3200, 6, NULL),
('Rồi Ta Sẽ Ngắm Pháo Hoa Cùng Nhau', 278, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_emxinhsayhi.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', 4500, 7, NULL),
('Chúng Ta Của Hiện Tại', 302, 'https://zingmp3.vn/bai-hat/Chung-Ta-Cua-Hien-Tai-Son-Tung-M-TP/sGk6Iot5IvCZ.html', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 1500, 1, 1),
('Nấu Ăn Cho Em', 245, 'https://example.com/audio/nau-an-cho-em.mp3', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80', 2300, 2, NULL),
('Dramatic', 210, 'https://example.com/audio/dramatic.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80', 500, 3, NULL),
('Truyện Ngắn', 250, 'https://example.com/audio/truyen-ngan.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80', 800, 4, NULL),
('Người đầu tiên', 232, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_emxinhsayhi.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 1500, 1, 1),
('Người đầu tiên (Acoustic)', 215, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_jukysan.mp3', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80', 1200, 1, 1);

-- Chèn Thể loại cho bài hát
INSERT INTO song_genres (song_id, genre_id) VALUES 
(1, 1), 
(2, 3), 
(3, 1), 
(3, 2), 
(4, 5);

-- Chèn Playlist mẫu (Đã sửa lỗi dấu chấm phẩy giữa chừng)
INSERT INTO playlists (user_id, title, description, is_public) VALUES 
(2, 'Nhạc Chill Cuối Tuần', 'Danh sách bài hát thư giãn', TRUE),
(2, 'Nhạc Trẻ Gây Nghiện', 'Tổng hợp những bài hát Pop và Ballad hay nhất', TRUE),
(3, 'Lofi Study & Chill', 'Nghe để tập trung học tập và làm việc', TRUE);

-- Chèn Bài hát vào Playlist
INSERT INTO playlist_songs (playlist_id, song_id, order_index) VALUES 
(1, 1, 1),
(1, 2, 2),
(2, 3, 1), 
(2, 4, 2), 
(3, 4, 1);

INSERT INTO user_favorite_songs (user_id, song_id) VALUES 
(2, 3),
(3, 1),
(4, 4);

INSERT INTO listening_history (user_id, song_id) VALUES 
(2, 3),
(3, 1),
(4, 4),
(2, 2);



USE Mobile2;
ALTER TABLE listening_history AUTO_INCREMENT = 1;
-- Xóa dữ liệu cũ (nếu chạy lại script) theo thứ tự khóa ngoại
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE listening_history;
TRUNCATE TABLE user_favorite_songs;
TRUNCATE TABLE playlist_songs;
TRUNCATE TABLE playlists;
TRUNCATE TABLE song_genres;
TRUNCATE TABLE songs;
TRUNCATE TABLE albums;
TRUNCATE TABLE artists;
TRUNCATE TABLE users;
TRUNCATE TABLE genres;
SET FOREIGN_KEY_CHECKS = 1;

SELECT * FROM genres;
SHOW TABLES;
SELECT 
    g.genre_id, 
    g.name AS genre_name, 
    s.song_id, 
    s.title, 
    s.cover_url, 
    s.audio_url, 
    a.name AS artist_name
FROM genres g
JOIN song_genres sg ON g.genre_id = sg.genre_id
JOIN songs s ON sg.song_id = s.song_id
JOIN artists a ON s.artist_id = a.artist_id;


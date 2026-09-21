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

-- Xóa dữ liệu cũ theo thứ tự khóa ngoại
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

ALTER TABLE listening_history AUTO_INCREMENT = 1;

-- 1. Chèn dữ liệu Thể loại
INSERT INTO genres (name) VALUES 
('Pop'), ('R&B'), ('Hip-Hop/Rap'), ('Indie'), ('Ballad'), 
('Rock'), ('EDM'), ('Jazz'), ('Classical'), ('Lofi');

-- 2. Chèn dữ liệu Người dùng
INSERT INTO users (username, email, password_hash, role, is_premium) VALUES 
('admin', 'admin@spotify.com', 'hashed_password_123', 'admin', TRUE),
('nguyenvana', 'ana@gmail.com', 'hashed_password_456', 'user', FALSE),
('tranthib', 'bt thi@gmail.com', 'hashed_password_789', 'user', TRUE),
('levanc', 'levanc@gmail.com', 'hashed_password_abc', 'user', FALSE),
('hoangphuong', 'phuonghn@gmail.com', 'hashed_password_xyz', 'user', TRUE);

-- 3. Chèn dữ liệu Nghệ sĩ (Đã bổ sung đủ các nghệ sĩ có trong danh sách bài hát)
INSERT INTO artists (artist_id, name, bio, avatar_url) VALUES 
(1, 'Masew', 'Nhà sản xuất âm nhạc, DJ nổi tiếng với các bản phối triệu view.', 'https://example.com/avatars/masew.jpg'),
(2, 'Phan Mạnh Quỳnh', 'Nam ca sĩ, nhạc sĩ nổi tiếng với chất giọng và ca từ tự sự đặc trưng.', 'https://example.com/avatars/phanmanhquynh.jpg'),
(3, 'Juky San', 'Nữ ca sĩ trẻ sở hữu giọng hát trong trẻo.', 'https://example.com/avatars/jukysan.jpg'),
(4, 'Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ hàng đầu Việt Nam.', 'https://example.com/avatars/sontung.jpg'),
(5, 'HOYO-MiX', 'Nhóm sản xuất âm nhạc chính thức của miHoYo/HoYoverse.', 'https://example.com/avatars/hoyomix.jpg'),
(6, 'Hứa Kim Tuyền', 'Nhạc sĩ, nhà sản xuất âm nhạc sở hữu nhiều bản hit Pop/Ballad.', 'https://example.com/avatars/huakimtuyen.jpg'),
(7, 'Đen Vâu', 'Rapper người Việt Nam.', 'https://example.com/avatars/denvau.jpg'),
(8, 'Bích Phương', 'Nữ ca sĩ với nhiều bản hit Pop Ballad.', 'https://example.com/avatars/bichphuong.jpg');

-- 4. Chèn dữ liệu Album
INSERT INTO albums (album_id, title, cover_url, release_date, artist_id) VALUES 
(1, 'Chúng Ta', 'https://example.com/covers/chungta.jpg', '2020-12-20', 4),
(2, 'Genshin Impact OST', 'https://example.com/covers/hoyomix.jpg', '2021-09-01', 5);

-- 5. Chèn dữ liệu Bài hát (Khóa ngoại artist_id chuẩn xác theo từng bài)
INSERT INTO songs (title, duration, audio_url, cover_url, play_count, artist_id, album_id) VALUES 
('Túy Âm', 302, '', 'https://example.com/covers/chungta.jpg', 1500, 1, NULL),
('Vợ Người Ta', 405, '', 'https://example.com/covers/vonguota.jpg', 1500, 2, NULL),
('Người đầu tiên', 232, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_emxinhsayhi.mp3', '', 1500, 3, NULL),
('Người đầu tiên', 215, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_jukysan.mp3', 'https://example.com/covers/nguoidautien2.jpg', 1500, 3, NULL),
('Song of the Tidal Algae', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/HOYO-MiX_SongoftheTidalAlgae%20.mp3', 'https://github.com/MinhhDoann/BTL_Mobile2/blob/SongLink/HOYO-MiX.jpg?raw=true', 0, 5, 2),
('I Loved You (Orchestral Version)', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/HOYO-MiX_ILovedYou-Orchestral%20Version.mp3', 'https://github.com/MinhhDoann/BTL_Mobile2/blob/SongLink/HOYO-MiX.jpg?raw=true', 0, 5, 2),
('Where the Moon Kisses the Water', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/HOYO-MiX_WheretheMoonKisses%20theWater.mp3', 'https://github.com/MinhhDoann/BTL_Mobile2/blob/SongLink/HOYO-MiX.jpg?raw=true', 0, 5, 2),
('I Loved You', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/HOYO-MiX-I%20LovedYou.mp3', 'https://github.com/MinhhDoann/BTL_Mobile2/blob/SongLink/HOYO-MiX.jpg?raw=true', 0, 5, 2),
('The World at Bay Beyond the Pillow', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/TheWorldatBayBeyondthePillow_HOYO-MiX.mp3', 'https://github.com/MinhhDoann/BTL_Mobile2/blob/SongLink/HOYO-MiX.jpg?raw=true', 0, 5, 2),
('Người gieo mầm xanh', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/HuaKimTuye-HoangDung_Nguoigieomamxanh.mp3', 'https://example.com/covers/nguoidautien2.jpg', 0, 6, NULL),
('Và Thế Giới Đã Mất Đi Một Người Cô Đơn', 300, 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/marzuz-Changg_VaTheGioiDaMatDiMotNguoiCoDon.mp3', 'https://example.com/covers/nguoidautien2.jpg', 0, 6, NULL),
('Người đầu tiên TEST', 232, '', '', 0, 3, NULL);

-- 6. Chèn Thể loại cho bài hát
INSERT INTO song_genres (song_id, genre_id) VALUES 
(1, 7), 
(2, 1), 
(3, 5), 
(4, 5), 
(5, 9);

-- 7. Chèn Playlist mẫu
INSERT INTO playlists (user_id, title, description, is_public) VALUES 
(2, 'Nhạc Chill Cuối Tuần', 'Danh sách bài hát thư giãn', TRUE),
(2, 'Nhạc Trẻ Gây Nghiện', 'Tổng hợp những bài hát Pop và Ballad hay nhất', TRUE),
(3, 'Lofi Study & Chill', 'Nghe để tập trung học tập và làm việc', TRUE);

-- 8. Chèn Bài hát vào Playlist
INSERT INTO playlist_songs (playlist_id, song_id, order_index) VALUES 
(1, 1, 1),
(1, 2, 2),
(2, 3, 1), 
(2, 4, 2);

-- 9. Chèn Bài hát yêu thích
INSERT INTO user_favorite_songs (user_id, song_id) VALUES 
(2, 3),
(3, 1),
(4, 4);

-- 10. Chèn Lịch sử nghe nhạc
INSERT INTO listening_history (user_id, song_id) VALUES 
(2, 3),
(3, 1),
(4, 4),
(2, 2);

-- Truy vấn kiểm tra liên kết Nghệ sĩ - Bài hát
SELECT 
    s.song_id, 
    s.title AS song_title, 
    a.name AS artist_name,
    s.duration
FROM songs s
JOIN artists a ON s.artist_id = a.artist_id;
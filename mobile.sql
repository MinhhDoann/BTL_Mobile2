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

-- 1. Thể loại
INSERT INTO genres (genre_id, name) VALUES 
(1, 'Pop'), (2, 'R&B'), (3, 'Hip-Hop/Rap'), (4, 'Indie'), (5, 'Ballad'), 
(6, 'Rock'), (7, 'EDM'), (8, 'Jazz'), (9, 'Soundtrack / Game Music'), (10, 'Lofi');

-- 2. Người dùng
INSERT INTO users (user_id, username, email, password_hash, role, is_premium) VALUES 
(1, 'admin', 'admin@spotify.com', 'hashed_password_123', 'admin', TRUE),
(2, 'nguyenvana', 'ana@gmail.com', 'hashed_password_456', 'user', FALSE),
(3, 'tranthib', 'bthi@gmail.com', 'hashed_password_789', 'user', TRUE),
(4, 'levanc', 'levanc@gmail.com', 'hashed_password_abc', 'user', FALSE),
(5, 'hoangphuong', 'phuonghn@gmail.com', 'hashed_password_xyz', 'user', TRUE);

-- 3. Nghệ sĩ
INSERT INTO artists (artist_id, name, bio, avatar_url) VALUES 
(1, 'HOYO-MiX', 'Studio âm nhạc chính thức của miHoYo', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'),
(2, 'Hứa Kim Tuyền & Hoàng Dũng', 'Nghệ sĩ, Nhạc sĩ V-Pop hàng đầu', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
(3, 'Project SEKAI', 'Project SEKAI COLORFUL STAGE! Original Soundtrack', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'),
(4, 'marzuz & Changg', 'Nghệ sĩ Indie Việt Nam', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
(5, 'Em Xinh Say Hi', 'Dàn nghệ sĩ Em Xinh Say Hi', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80'),
(6, 'Jukysan', 'Ca sĩ V-Pop sở hữu giọng hát ngọt ngào', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'),
(7, 'Phương Ly', 'Nữ ca sĩ vạn người mê', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80'),
(8, 'Olew', 'Ca sĩ, nhạc sĩ trẻ tài năng với hit Pháo Hoa', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80');

-- 4. Album
INSERT INTO albums (album_id, title, cover_url, release_date, artist_id) VALUES 
(1, 'Genshin Impact OST', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', '2023-01-01', 1),
(2, 'V-Pop Hits Collection', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', '2024-02-14', 2);

-- 5. Bài hát (Toàn bộ 10 bài hát dùng đường dẫn raw.githubusercontent.com trực tiếp)
INSERT INTO songs (song_id, title, duration, audio_url, cover_url, play_count, artist_id, album_id) VALUES 
(1, 'ILovedYou (Orchestral Version)', 210, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/HOYO-Mix_ILovedYou-Orchestral_Version.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 1200, 1, 1),
(2, 'I Loved You', 200, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/HOYO-MiX-I%20LovedYou.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 950, 1, 1),
(3, 'Song of the Tidal Algae', 195, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/HOYO-MiX_SangoftheTidalAlgae%20.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 1500, 1, 1),
(4, 'Where the Moon Kisses the Water', 220, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/HOYO-MiX_WheretheMoonKisses%20theWater.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 2100, 1, 1),
(5, 'Người Gieo Mầm Xanh', 240, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/HuaKimTuyen%2CHoangDung_Nguoigieomamxanh.mp3', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 3100, 2, 2),
(6, 'The World at Bay Beyond the Pillow', 205, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/TheWorldatBayBeyondthePillow_HOYO-MiX.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', 800, 1, 1),
(7, 'Under the Wish Tree', 215, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/UndertheWishTree_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%82%BB%E3%82%AB%E3%82%A4.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', 1750, 3, NULL),
(8, 'Và Thế Giới Đã Mất Đi Một Người Cô Đơn', 230, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/marzuz_Changg_VaTheGioiDaMatDiMotNguoiCoDon.mp3', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 4500, 4, NULL),
(9, 'Người Đầu Tiên (Em Xinh Say Hi)', 210, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/nguoidautien_emxinhsayhi.mp3', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', 5000, 5, NULL),
(10, 'Người Đầu Tiên (Jukysan)', 225, 'https://raw.githubusercontent.com/MinhhDoann/BTL_Mobile2/SongLink/nguoidautien_jukysan.mp3', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 2900, 6, NULL);

-- 6. Liên kết Bài hát - Thể loại
INSERT INTO song_genres (song_id, genre_id) VALUES 
(1, 9), (2, 9), (3, 9), (4, 9), (6, 9), -- HOYO-MiX (Soundtrack / Game Music)
(5, 1), (5, 5),                        -- Người Gieo Mầm Xanh (Pop, Ballad)
(7, 9), (7, 1),                        -- Under the Wish Tree (Game Music, Pop)
(8, 4), (8, 1),                        -- Và Thế Giới Đã Mất Đi... (Indie, Pop)
(9, 1), (10, 1), (10, 5);              -- Người Đầu Tiên (Pop, Ballad)

-- 7. Danh sách phát (Playlists)
INSERT INTO playlists (playlist_id, user_id, title, description, is_public) VALUES 
(1, 2, 'Nhạc Game Chill & Study', 'Tổng hợp nhạc HOYO-MiX không lời', TRUE),
(2, 2, 'V-Pop Hits Mới Nhất', 'Những bài hát V-Pop cực chill', TRUE),
(3, 3, 'Lofi & Indie Việt', 'Nghe để thư giãn cuối tuần', TRUE);

-- 8. Bài hát trong Playlist
INSERT INTO playlist_songs (playlist_id, song_id, order_index) VALUES 
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4),
(2, 5, 1), (2, 9, 2), (2, 10, 3),
(3, 8, 1), (3, 5, 2);

-- 9. Bài hát Yêu thích
INSERT INTO user_favorite_songs (user_id, song_id) VALUES 
(2, 1), (2, 9), (3, 8), (4, 5);

-- 10. Lịch sử Nghe Nhạc
INSERT INTO listening_history (user_id, song_id) VALUES 
(2, 9), (2, 1), (3, 8), (4, 5), (2, 3);



# Biểu đồ Tuần tự (Sequence Diagrams) cho 3 Use Case Cốt lõi

Tài liệu này tổng hợp **Biểu đồ Tuần tự (Sequence Diagrams)** sử dụng cú pháp [Mermaid](https://mermaid.js.org/) cho 3 Use Case chính được xây dựng trong hệ thống ứng dụng **BTL_Mobile2 (Ứng dụng Âm nhạc & Admin Studio)**.

---

## 1. Use Case 1: Đăng bài hát mới (Artist Studio - Song Upload)

### Mô tả
Nghệ sĩ đăng tải bài hát mới vào hệ thống thông qua giao diện **Artist Studio**. Hệ thống kiểm tra quyền hạn, ghi nhận thông tin file âm thanh, ảnh bìa, lời bài hát, và liên kết bài hát với thể loại tương ứng vào MySQL Database.

### Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Artist as Nghệ sĩ (Artist)
    participant Client as Frontend (Artist Studio)
    participant Server as Backend API (/api/artist)
    participant DB as MySQL Database

    Artist->>Client: 1. Nhập thông tin bài hát (Tiêu đề, Audio URL, Cover URL, Lời bài hát, Thể loại)
    Client->>Client: 2. Validate thông tin nhập hợp lệ
    Client->>Server: 3. POST /api/artist/songs (Bearer Token + Body JSON)
    
    activate Server
    Server->>Server: 4. Xác minh Token & Kiểm tra vai trò ('artist' / 'admin')
    alt Không đủ quyền / Chưa đăng nhập
        Server-->>Client: 4a. HTTP 401/403 (Unauthorized / Forbidden)
        Client-->>Artist: Hiển thị lỗi phân quyền
    else Quyền hạn hợp lệ
        Server->>DB: 5. INSERT INTO songs (title, duration, audio_url, cover_url, lyrics, play_count=0, artist_id)
        activate DB
        DB-->>Server: 6. Trả về kết quả thành công & insertId (song_id mới)
        deactivate DB
        
        opt Có chọn thể loại bài hát
            Server->>DB: 7. INSERT INTO song_genres (song_id, genre_id)
            activate DB
            DB-->>Server: 8. Trả về kết quả lưu thể loại
            deactivate DB
        end
        
        Server-->>Client: 9. HTTP 201 Created { ok: true, message: 'Đăng bài thành công!', songId }
        deactivate Server
        Client-->>Artist: 10. Thông báo "Đăng bài hát thành công!" & Tải lại danh sách bài hát
    end
```

### Thành phần & Luồng xử lý chi tiết
- **Actor**: Nghệ sĩ (Artist).
- **API Endpoint**: `POST /api/artist/songs`.
- **Dữ liệu truyền vào**: `title`, `duration`, `audio_url`, `cover_url`, `lyrics`, `genres`, `album_id`.
- **Bảng DB liên quan**: `artists`, `songs`, `song_genres`.

---

## 2. Use Case 2: Gửi và Xử lý Khiếu nại Bài hát (Song Complaint System)

### Mô tả
Người dùng báo cáo/khiếu nại vi phạm bản quyền hoặc nội dung không phù hợp của một bài hát từ trang chi tiết bài hát (`song-detail`). Quản trị viên (Admin) xem danh sách khiếu nại trên **Admin Dashboard** và thực hiện **Duyệt (Accept)** hoặc **Từ chối (Reject)** khiếu nại.

### Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (User)
    actor Admin as Quản trị viên (Admin)
    participant App as Mobile App (song-detail)
    participant AdminUI as Admin Dashboard Web
    participant Server as Backend API
    participant DB as MySQL Database

    rect rgb(240, 248, 255)
    note right of User: Giai đoạn 1: Người dùng gửi khiếu nại bài hát
    User->>App: 1. Mở bài hát & Chọn "Báo cáo / Khiếu nại bài hát"
    App->>User: 2. Hiển thị Form báo cáo (Lý do khiếu nại, Chi tiết)
    User->>App: 3. Nhập lý do & Nhấn nút "Gửi khiếu nại"
    App->>Server: 4. POST /api/songs/:songId/complaint { userId, reason_type, description }
    activate Server
    Server->>DB: 5. SELECT song_id FROM songs WHERE song_id = ?
    DB-->>Server: 6. Xác nhận bài hát tồn tại
    Server->>DB: 7. INSERT INTO complaints (user_id, song_id, reason_type, description, status='pending')
    DB-->>Server: 8. Trả về complaint_id vừa tạo
    Server-->>App: 9. HTTP 201 Created { ok: true, message: 'Gửi khiếu nại thành công.' }
    deactivate Server
    App-->>User: 10. Thông báo "Gửi khiếu nại thành công!"
    end

    rect rgb(255, 245, 238)
    note right of Admin: Giai đoạn 2: Admin tiếp nhận & xử lý khiếu nại
    Admin->>AdminUI: 11. Mở tab "Quản lý Khiếu nại"
    AdminUI->>Server: 12. GET /api/admin/complaints (Bearer Token Admin)
    activate Server
    Server->>DB: 13. Query JOIN complaints, songs, artists, users
    DB-->>Server: 14. Trả về danh sách bản ghi khiếu nại
    Server-->>AdminUI: 15. HTTP 200 OK { complaints: [...] }
    deactivate Server
    AdminUI-->>Admin: 16. Hiển thị danh sách các khiếu nại dạng bảng
    Admin->>AdminUI: 17. Chọn "Duyệt" (accepted) hoặc "Từ chối" (rejected)
    AdminUI->>Server: 18. PUT /api/admin/complaints/:id/status { status: 'accepted' }
    activate Server
    Server->>DB: 19. UPDATE complaints SET status = 'accepted' WHERE complaint_id = ?
    DB-->>Server: 20. Cập nhật số dòng bị ảnh hưởng (affectedRows)
    Server-->>AdminUI: 21. HTTP 200 OK { ok: true, message: 'Đã tiếp nhận khiếu nại thành công.' }
    deactivate Server
    AdminUI-->>Admin: 22. Cập nhật giao diện (Trạng thái chuyển sang 'accepted')
    end
```

### Thành phần & Luồng xử lý chi tiết
- **Actors**: Người dùng (User), Quản trị viên (Admin).
- **API Endpoints**: 
  - `POST /api/songs/:songId/complaint` (Người dùng gửi)
  - `GET /api/admin/complaints` (Admin lấy danh sách)
  - `PUT /api/admin/complaints/:id/status` (Admin cập nhật trạng thái)
- **Bảng DB liên quan**: `complaints`, `songs`, `artists`, `users`.

---

## 3. Use Case 3: Xem Thống kê & Báo cáo Doanh thu Hệ thống (Admin Revenue Reporting)

### Mô tả
Quản trị viên (Admin) truy cập **Báo cáo Doanh thu** trên **Admin Dashboard** để xem tổng hợp thu nhập của toàn bộ hệ thống (doanh thu từ lượt nghe nhạc, lượt click banner quảng cáo), doanh thu chia sẻ 70/30 với Nghệ sĩ, khấu trừ thuế TNCN (10%), và quản lý các yêu cầu rút tiền.

### Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên (Admin)
    participant AdminUI as Admin Web Dashboard
    participant Server as Backend API (/api/admin)
    participant DB as MySQL Database

    Admin->>AdminUI: 1. Chọn tab "Báo cáo Doanh thu System"
    AdminUI->>Server: 2. GET /api/admin/revenue/report (Bearer Token Admin)
    
    activate Server
    Server->>Server: 3. Kiểm tra Session & Vai trò Admin
    alt Không phải Admin
        Server-->>AdminUI: 3a. HTTP 403 Forbidden
        AdminUI-->>Admin: Hiển thị thông báo Từ chối truy cập
    else Xác thực Admin thành công
        Server->>DB: 4. Query tổng hợp (COUNT users, artists, songs, SUM play_count, SUM banner_clicks)
        activate DB
        DB-->>Server: 5. Trả về các chỉ số tổng quan hệ thống
        deactivate DB

        Server->>DB: 6. Query danh sách & trạng thái rút tiền (payout_requests)
        activate DB
        DB-->>Server: 7. Trả về tổng tiền đã duyệt, chờ duyệt, bị từ chối
        deactivate DB

        Server->>DB: 8. Query danh sách chi tiết doanh thu theo từng Nghệ sĩ & Top bài hát
        activate DB
        DB-->>Server: 9. Trả về danh sách nghệ sĩ & lượt nghe/click
        deactivate DB

        Server->>Server: 10. Tính toán các chỉ số Doanh thu:
        note over Server: - Doanh thu lượt nghe = Total Plays * 100 VNĐ<br/>- Doanh thu QC = Banner Clicks * 3,000 VNĐ<br/>- Chia sẻ QC: Nghệ sĩ 70%, Hệ thống 30%<br/>- Thuế TNCN khấu trừ = 10% * QC Nghệ sĩ<br/>- Thu nhập thực nhận Nghệ sĩ & Lợi nhuận hệ thống

        Server-->>AdminUI: 11. HTTP 200 OK (Data JSON: summary, payout_summary, artist_breakdown, top_songs)
        deactivate Server

        AdminUI-->>Admin: 12. Renders Thống kê Cards, Biểu đồ Doanh thu & Bảng chi tiết từng nghệ sĩ
    end
```

### Thành phần & Luồng xử lý chi tiết
- **Actor**: Quản trị viên (Admin).
- **API Endpoint**: `GET /api/admin/revenue/report`.
- **Thuật toán tính toán chính**:
  - `Song Play Revenue = Total Plays * 100 VNĐ`
  - `Ad Banner Revenue = Banner Clicks * 3,000 VNĐ`
  - `Artist Ad Share (Gross) = Ad Revenue * 70%`
  - `Platform Ad Share = Ad Revenue * 30%`
  - `PIT Tax Withheld = Artist Ad Share * 10%`
  - `Artist Net Earnings = (Artist Ad Share - PIT Tax) + Song Play Revenue`
- **Bảng DB liên quan**: `users`, `artists`, `songs`, `payout_requests`.

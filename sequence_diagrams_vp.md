# Biểu đồ Tuần tự (Sequence Diagrams) Chuẩn Visual Paradigm (1 Actor / 1 Use Case)

Đặc tả các Use Case theo kiến trúc 3 lớp **Boundary - Control - Entity** và đánh số thông điệp chuẩn Visual Paradigm (1, 1.1, 1.1.1, 1.1.2: return...).

---

## 1. Use Case: Gửi khiếu nại bài hát (Người dùng)

- **Actor**: `Người dùng`
- **Boundaries**: 
  - `GiaoDienChiTietBaiHat` (Trang chi tiết bài hát - Song Detail)
  - `FormKhieuNai` (Modal / Form nhập nội dung khiếu nại)
- **Control**: `GuiKhieuNaiControl`
- **Entities**: `BaiHat`, `KhieuNai`

```mermaid
sequenceDiagram
    autonumber
    actor UserActor as Người dùng
    participant UI_SongDetail as «Boundary»<br/>GiaoDienChiTietBaiHat
    participant Form as «Boundary»<br/>FormKhieuNai
    participant Ctrl as «Control»<br/>GuiKhieuNaiControl
    participant E_BaiHat as «Entity»<br/>BaiHat
    participant E_KhieuNai as «Entity»<br/>KhieuNai

    UserActor->>UI_SongDetail: 1: Click chọn bài hát
    UI_SongDetail->>Ctrl: 1.1: Yêu cầu xem chi tiết bài hát (maBaiHat)
    Ctrl->>E_BaiHat: 1.1.1: Lấy thông tin bài hát (maBaiHat)
    E_BaiHat-->>Ctrl: 1.1.2: return(thongTinBaiHat)
    Ctrl-->>UI_SongDetail: 1.1.3: return(thongTinBaiHat)
    UI_SongDetail-->>UserActor: 1.1.4: Hiển thị trang Chi tiết bài hát (Song Detail)

    UserActor->>UI_SongDetail: 2: Click nút "Khiếu nại"
    UI_SongDetail->>Form: 2.1: Mở Form khiếu nại
    Form-->>UserActor: 2.2: Hiển thị Form khiếu nại

    UserActor->>Form: 3: Nhập thông tin & Click nút "Gửi khiếu nại"
    Form->>Ctrl: 3.1: Yêu cầu gửi khiếu nại (maBaiHat, maNguoiDung, lyDo, moTa)
    Ctrl->>Ctrl: 3.1.1: Kiểm tra dữ liệu nhập (validate)

    alt [Form trống / Chưa điền thông tin]
        Ctrl-->>Form: 3.1.2: return(Dữ liệu trống)
        Form-->>UserActor: 3.1.2.1: Hiển thị thông báo "Không thể gửi form trống"
    else [Đã điền đầy đủ thông tin]
        Ctrl->>E_KhieuNai: 3.1.3: Tạo bản ghi khiếu nại (maBaiHat, maNguoiDung, lyDo, moTa, status='pending')
        E_KhieuNai-->>Ctrl: 3.1.4: return(maKhieuNai)
        Ctrl-->>Form: 3.1.5: return(Gửi khiếu nại thành công)
        Form-->>UserActor: 3.1.5.1: Đóng form & Hiển thị thông báo "Gửi khiếu nại thành công"
    end
```

---

## 2. Use Case: Xử lý khiếu nại bài hát (Quản trị viên)

- **Actor**: `Quản trị viên` (Admin)
- **Boundary**: `GiaoDienQuanLyKhieuNai`
- **Control**: `XuLyKhieuNaiControl`
- **Entities**: `KhieuNai`, `BaiHat`

```mermaid
sequenceDiagram
    autonumber
    actor AdminActor as Quản trị viên
    participant UI_Admin as «Boundary»<br/>GiaoDienQuanLyKhieuNai
    participant Ctrl as «Control»<br/>XuLyKhieuNaiControl
    participant E_KhieuNai as «Entity»<br/>KhieuNai
    participant E_BaiHat as «Entity»<br/>BaiHat

    AdminActor->>UI_Admin: 1: Chọn danh mục "Quản lý Khiếu nại"
    UI_Admin->>Ctrl: 1.1: Yêu cầu tải danh sách khiếu nại
    Ctrl->>E_KhieuNai: 1.1.1: Lấy danh sách khiếu nại
    E_KhieuNai-->>Ctrl: 1.1.2: return(dsKhieuNai)
    Ctrl-->>UI_Admin: 1.1.3: return(dsKhieuNai)
    UI_Admin-->>AdminActor: 1.1.4: Hiển thị danh sách khiếu nại
    
    AdminActor->>UI_Admin: 2: Chọn khiếu nại & Nhấn "Duyệt" (Accepted) / "Từ chối" (Rejected)
    UI_Admin->>Ctrl: 2.1: Cập nhật trạng thái khiếu nại (maKhieuNai, trangThaiMoi)
    Ctrl->>E_KhieuNai: 2.1.1: Cập nhật trạng thái (maKhieuNai, trangThaiMoi)
    E_KhieuNai-->>Ctrl: 2.1.2: return(OK)
    
    opt [Trạng thái = Accepted]
        Ctrl->>E_BaiHat: 2.1.3: Xử lý gỡ / ẩn bài hát vi phạm (maBaiHat)
        E_BaiHat-->>Ctrl: 2.1.4: return(OK)
    end
    
    Ctrl-->>UI_Admin: 2.1.5: return(Xử lý thành công)
    UI_Admin-->>AdminActor: 2.1.5.1: Hiển thị thông báo & cập nhật bảng danh sách
```

---

## 3. Use Case: Đăng bài hát mới (Nghệ sĩ)

- **Actor**: `Nghệ sĩ`
- **Boundary**: `FormDangBaiHat`
- **Control**: `QuanLyBaiHatControl`
- **Entities**: `NgheSi`, `BaiHat`, `TheLoai`

```mermaid
sequenceDiagram
    autonumber
    actor NgheSiActor as Nghệ sĩ
    participant Form as «Boundary»<br/>FormDangBaiHat
    participant Ctrl as «Control»<br/>QuanLyBaiHatControl
    participant E_NgheSi as «Entity»<br/>NgheSi
    participant E_BaiHat as «Entity»<br/>BaiHat
    participant E_TheLoai as «Entity»<br/>TheLoai

    NgheSiActor->>Form: 1: Nhập thông tin bài hát (tiêu đề, audio_url, cover_url, lyrics, dsTheLoai)
    Form->>Ctrl: 1.1: Yêu cầu đăng bài hát (info)
    Ctrl->>Ctrl: 1.1.1: Kiểm tra dữ liệu đầu vào (validate)
    
    alt [Thông tin không hợp lệ]
        Ctrl-->>Form: 1.1.2: return(Lỗi dữ liệu)
        Form-->>NgheSiActor: 1.1.2.1: Hiển thị thông báo lỗi nhập liệu
    else [Thông tin hợp lệ]
        Ctrl->>E_NgheSi: 1.1.3: Kiểm tra quyền Nghệ sĩ (user_id)
        E_NgheSi-->>Ctrl: 1.1.4: return(thongTinNgheSi)
        
        alt [Chưa nâng cấp Nghệ sĩ / Không đủ quyền]
            Ctrl-->>Form: 1.1.5: return(Không đủ quyền)
            Form-->>NgheSiActor: 1.1.5.1: Hiển thị thông báo từ chối
        else [Quyền Nghệ sĩ hợp lệ]
            Ctrl->>E_BaiHat: 1.1.6: Tạo bài hát mới (title, duration, audio_url, cover_url, lyrics, artist_id)
            E_BaiHat-->>Ctrl: 1.1.7: return(maBaiHat)
            
            loop [Cho từng thể loại được chọn]
                Ctrl->>E_TheLoai: 1.1.8: Lưu thể loại bài hát (maBaiHat, maTheLoai)
                E_TheLoai-->>Ctrl: 1.1.9: return(OK)
            end
            
            Ctrl-->>Form: 1.1.10: return(Đăng bài thành công)
            Form-->>NgheSiActor: 1.1.10.1: Hiển thị thông báo thành công & Tải lại danh sách
        end
    end
```

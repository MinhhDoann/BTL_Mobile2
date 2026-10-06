# Biểu đồ Tuần tự (Sequence Diagrams) Chuẩn Visual Paradigm có Bước Xác Nhận (Confirmation Modal)

Đặc tả các Use Case **Rút tiền** và **Phê duyệt chuyển tiền** bổ sung **bước xác nhận (Confirmation Dialog)** trước khi chính thức gửi hoặc duyệt giao dịch.

---

## 1. Use Case: Gửi yêu cầu rút tiền (Actor: Artist)

Bổ sung **Dialog Xác nhận rút tiền** (hiển thị số tiền & thông tin tài khoản ngân hàng thụ hưởng trước khi tạo yêu cầu).

- **Actor**: `Artist`
- **Boundaries**: 
  - `FormRutTien` (Form rút tiền trong Artist Studio)
  - `DialogXacNhan` (Hộp thoại xác nhận thông tin rút tiền)
- **Control**: `ArtistStudioControl`
- **Entities**: `NgheSi`, `BaiHat`, `YeuCauRutTien`

```mermaid
sequenceDiagram
    autonumber
    actor ArtistActor as Artist
    participant Form as «Boundary»<br/>FormRutTien
    participant ConfirmDlg as «Boundary»<br/>DialogXacNhan
    participant Ctrl as «Control»<br/>ArtistStudioControl
    participant E_NgheSi as «Entity»<br/>NgheSi
    participant E_BaiHat as «Entity»<br/>BaiHat
    participant E_RutTien as «Entity»<br/>YeuCauRutTien

    ArtistActor->>Form: 1: Nhập số tiền rút & Thông tin ngân hàng (Tên NH, STK, Chủ TK)
    ArtistActor->>Form: 2: Click "Rút tiền"
    Form->>Form: 2.1: Validate cơ bản (amount > 0 & đầy đủ thông tin NH)
    
    alt [Chưa điền đủ thông tin]
        Form-->>ArtistActor: 2.2: Hiển thị thông báo "Vui lòng điền đầy đủ thông tin"
    else [Thông tin hợp lệ]
        Form->>ConfirmDlg: 2.3: Mở Hộp thoại xác nhận rút tiền
        ConfirmDlg-->>ArtistActor: 2.4: Hiển thị thông tin xác nhận (Số tiền, Ngân hàng, STK, Chủ TK)
        
        ArtistActor->>ConfirmDlg: 3: Chọn "Hủy" hoặc "Xác nhận gửi"
        
        alt [Artist chọn "Hủy"]
            ConfirmDlg-->>Form: 3.1: Đóng hộp thoại & Giữ nguyên thông tin form
        else [Artist chọn "Xác nhận gửi"]
            ConfirmDlg->>Ctrl: 3.2: POST /api/artist/payout-request { amount, bank_name, account_number, account_holder }
            
            activate Ctrl
            Ctrl->>E_NgheSi: 3.2.1: SELECT banner_clicks FROM artists WHERE artist_id = ?
            E_NgheSi-->>Ctrl: 3.2.2: return(bannerClicks)
            
            Ctrl->>E_BaiHat: 3.2.3: SELECT SUM(play_count) FROM songs WHERE artist_id = ?
            E_BaiHat-->>Ctrl: 3.2.4: return(totalPlays)
            
            Ctrl->>E_RutTien: 3.2.5: SELECT SUM(amount) FROM payout_requests WHERE artist_id = ? AND status != 'rejected'
            E_RutTien-->>Ctrl: 3.2.6: return(totalWithdrawn)
            
            Ctrl->>Ctrl: 3.2.7: Tính withdrawableBalance = totalRevenue - totalWithdrawn
            
            alt [payoutAmount > withdrawableBalance]
                Ctrl-->>ConfirmDlg: 3.2.8: HTTP 400 Bad Request { message: 'Số tiền vượt quá số dư khả dụng.' }
                ConfirmDlg-->>ArtistActor: 3.2.8.1: Thông báo lỗi "Số tiền vượt quá số dư khả dụng"
            else [payoutAmount <= withdrawableBalance]
                Ctrl->>E_RutTien: 3.2.9: INSERT INTO payout_requests (artist_id, amount, bank_info, status='pending')
                E_RutTien-->>Ctrl: 3.2.10: return(insertId)
                
                Ctrl-->>ConfirmDlg: 3.2.11: HTTP 200 OK { ok: true, message: 'Yêu cầu rút tiền thành công.' }
                deactivate Ctrl
                ConfirmDlg-->>Form: 3.2.12: Đóng Dialog
                Form-->>ArtistActor: 3.2.13: Thông báo "Yêu cầu rút tiền thành công, chờ phê duyệt" & Tải lại danh sách
            end
        end
    end
```

---

## 2. Use Case: Xử lý / Phê duyệt chuyển tiền (Actor: Admin)

Bổ sung **Dialog Xác nhận phê duyệt thanh toán chuyển tiền** (Hiển thị chi tiết Tên chủ tài khoản, Số tài khoản, Ngân hàng thụ hưởng & Số tiền trước khi Admin phê duyệt).

- **Actor**: `Admin` (Quản trị viên)
- **Boundaries**: 
  - `GiaoDienQuanLyGiaoDich` (Trang quản lý giao dịch Admin Web)
  - `DialogXacNhanChuyenTien` (Popup xác nhận phê duyệt chuyển tiền)
- **Control**: `AdminDataControl`
- **Entities**: `NguoiDung`, `YeuCauRutTien`

```mermaid
sequenceDiagram
    autonumber
    actor AdminActor as Admin
    participant UI_Admin as «Boundary»<br/>GiaoDienQuanLyGiaoDich
    participant ConfirmDlg as «Boundary»<br/>DialogXacNhanChuyenTien
    participant Ctrl as «Control»<br/>AdminDataControl
    participant E_User as «Entity»<br/>NguoiDung
    participant E_RutTien as «Entity»<br/>YeuCauRutTien

    AdminActor->>UI_Admin: 1: Xem danh sách giao dịch & Click "Phê duyệt chuyển tiền"
    UI_Admin->>ConfirmDlg: 1.1: Mở Hộp thoại xác nhận chuyển tiền
    ConfirmDlg-->>AdminActor: 1.2: Hiển thị thông tin thụ hưởng (Nghệ sĩ, Số tiền, Ngân hàng, STK, Chủ TK)

    AdminActor->>ConfirmDlg: 2: Nhấn "Hủy" hoặc "Đồng ý chuyển tiền"

    alt [Admin chọn "Hủy"]
        ConfirmDlg-->>UI_Admin: 2.1: Đóng Hộp thoại xác nhận & Giữ nguyên giao dịch
    else [Admin chọn "Đồng ý chuyển tiền"]
        ConfirmDlg->>Ctrl: 2.2: PUT /api/admin/data/payout_requests/:id { status: 'approved' }
        
        activate Ctrl
        Ctrl->>E_User: 2.2.1: Kiểm tra quyền Admin (req.user.role === 'admin')
        alt [Không phải Admin]
            Ctrl-->>ConfirmDlg: 2.2.2: HTTP 403 Forbidden { message: 'Chỉ quản trị viên được truy cập.' }
            ConfirmDlg-->>AdminActor: 2.2.2.1: Thông báo lỗi phân quyền
        else [Quyền Admin hợp lệ]
            Ctrl->>E_RutTien: 2.2.3: BEGIN TRANSACTION & SELECT request_id FROM payout_requests WHERE request_id = ? FOR UPDATE
            E_RutTien-->>Ctrl: 2.2.4: return(thongTinRutTien)
            
            Ctrl->>E_RutTien: 2.2.5: UPDATE payout_requests SET status = 'approved' WHERE request_id = ?
            E_RutTien-->>Ctrl: 2.2.6: COMMIT TRANSACTION & return(OK)
            
            Ctrl-->>ConfirmDlg: 2.2.7: HTTP 200 OK { message: 'Đã lưu thay đổi.' }
            deactivate Ctrl
            ConfirmDlg-->>UI_Admin: 2.2.8: Đóng Hộp thoại xác nhận
            UI_Admin-->>AdminActor: 2.2.9: Hiển thị thông báo "Phê duyệt chuyển tiền thành công!" & Tải lại bảng giao dịch
        end
    end
```

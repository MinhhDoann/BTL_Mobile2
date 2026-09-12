# BÀI LUYỆN TẬP 5: KIẾN TRÚC ĐA LUỒNG, CƠ CHẾ RENDER VÀ TRIỂN KHAI THIẾT BỊ THẬT

Thư mục này chứa đầy đủ tài liệu lý thuyết, sơ đồ kiến trúc 3 luồng, mã nguồn component mẫu và checklist triển khai ứng dụng trên điện thoại Android thật cho **Bài Luyện Tập 5**.

---

## 📁 Cấu trúc thư mục

```text
Bài Luyện Tập 5/
├── 📁 Ảnh/
│   ├── so_do_3_luong.png         # Sơ đồ phối hợp 3 luồng (JS Thread, Shadow Thread, Native Thread)
│   └── hello_react_native.png    # Mockup giao diện điện thoại chạy ứng dụng "Hello React Native"
├── 📄 App.js                     # Mã nguồn component React Native mẫu (View, Text, StyleSheet)
├── 📄 Ly_Thuyet.md               # Lời giải chi tiết cho 5 câu hỏi ôn tập Phần A
├── 📄 Thuc_Hanh.md               # Lời giải chi tiết, giải thích mã nguồn & checklist thiết bị thật Phần B
└── 📄 README.md                  # Tóm tắt nội dung và mục lục tra cứu nhanh
```

---

## 📌 Tóm tắt nội dung chính

### Phần A: Câu hỏi ôn tập lý thuyết ([Ly_Thuyet.md](./Ly_Thuyet.md))
1. **Câu 1:** Ba luồng chính khi chạy ứng dụng React Native: **JavaScript Thread** (chạy code JS/React, xử lý state), **Shadow Thread** (Yoga Layout Engine tính tọa độ Flexbox), và **Native/UI Thread** (vẽ widget gốc lên màn hình).
2. **Câu 2:** Phân tích luồng render từ `<View>`, `<Text>` đến widget bản địa (`ViewGroup`/`TextView` trên Android, `UIView`/`UILabel` trên iOS); Lý giải vì sao trải nghiệm mượt mà không dùng WebView.
3. **Câu 3:** Vai trò mang tính cách mạng của **JSI** (gọi C++ đồng bộ không cần JSON) và **Yoga** (Flexbox engine C++ đa nền tảng); Mối liên hệ nhịp nhàng giữa 3 luồng.
4. **Câu 4:** Các bước chuẩn bị thiết bị Android thật; Giải thích lý do bắt buộc của *Developer Mode, USB Debugging, `adb devices` và mở khóa màn hình*.
5. **Câu 5:** Bảng so sánh điều kiện build giữa Android và iOS (Android Studio, SDK, AVD vs Xcode, CocoaPods, Apple ID); Giới hạn độc quyền hệ sinh thái của Apple trên macOS.

### Phần B: Bài tập luyện tập thực hành ([Thuc_Hanh.md](./Thuc_Hanh.md))
1. **Bài tập 1 (Mức dễ):** Đoạn văn mô tả sống động quy trình khởi động ứng dụng với sự phối hợp của 3 luồng (kèm ảnh minh họa [Ảnh/so_do_3_luong.png](./Ảnh/so_do_3_luong.png)).
2. **Bài tập 2 (Mức dễ - trung bình):** Mã nguồn [App.js](./App.js) hiển thị "Hello React Native"; Phân tích vai trò của thẻ `View`, thẻ `Text`, đối tượng `StyleSheet` và cơ chế chuyển đổi thành Native widget (kèm ảnh mockup [Ảnh/hello_react_native.png](./Ảnh/hello_react_native.png)).
3. **Bài tập 3 (Mức trung bình):** Bảng **Checklist 8 bước** chuẩn bị thiết bị Android thật từ A đến Z và bài phân tích các lỗi thường gặp (`unauthorized`, `device offline`, lỗi khóa màn hình, chuyển tiếp cổng `adb reverse`).

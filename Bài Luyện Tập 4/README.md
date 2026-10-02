# BÀI LUYỆN TẬP 4: QUY TRÌNH HOẠT ĐỘNG VÀ THIẾT LẬP MÔI TRƯỜNG REACT NATIVE

Thư mục này chứa đầy đủ tài liệu lý thuyết, sơ đồ kiến trúc và kế hoạch thực hành thiết lập môi trường chuẩn cho **Bài Luyện Tập 4**.

---

## 📁 Cấu trúc thư mục

```text
Bài Luyện Tập 4/
├── 📁 Ảnh/
│   └── so_do_react_native.png   # Sơ đồ trực quan kiến trúc & quy trình hoạt động
├── 📄 Ly_Thuyet.md              # Lời giải chi tiết cho 5 câu hỏi lý thuyết (Phần A)
├── 📄 Thuc_Hanh.md              # Sơ đồ hoạt động và kế hoạch cài đặt môi trường (Phần B)
└── 📄 README.md                 # Mục lục và hướng dẫn tổng quan
```

---

## 📌 Tóm tắt nội dung chính

### Phần A: Câu hỏi ôn tập lý thuyết ([Ly_Thuyet.md](./Ly_Thuyet.md))
1. **Câu 1:** Quy trình hoạt động 5 bước của React Native (từ viết mã JS $\rightarrow$ JS Runtime $\rightarrow$ đóng gói JSON qua Bridge $\rightarrow$ Native xử lý UI/Module $\rightarrow$ gửi ngược kết quả sự kiện về JS).
2. **Câu 2:** Vai trò sống còn của **Bridge**: Phiên dịch dữ liệu giữa JS và Native, điều phối giao tiếp bất đồng bộ, không chặn luồng UI và quản lý Remote Procedure Calls.
3. **Câu 3:** So sánh môi trường Windows vs macOS; Phân tích rào cản độc quyền của Apple (Xcode, iOS SDK, Signing Identity) khiến Windows chỉ build được Android, trong khi macOS làm được cả hai.
4. **Câu 4:** Các bước khởi tạo dự án đầu tiên và ý nghĩa chi tiết của các lệnh `react-native init`, `cd`, `react-native run-android`, `react-native run-ios`.
5. **Câu 5:** Mô tả vai trò của từng thư mục và tệp cốt lõi: `android/`, `ios/`, `node_modules/`, `package.json`, `index.js`, `app.json`, `App.js`.

### Phần B: Bài tập luyện tập thực hành ([Thuc_Hanh.md](./Thuc_Hanh.md))
1. **Bài tập 1 (Mức dễ):** Sơ đồ quy trình hoạt động (dạng Mermaid & dạng hình ảnh `Ảnh/so_do_react_native.png`) kèm đoạn văn lý giải vì sao giao diện React Native mượt mà và chân thực như Native.
2. **Bài tập 2 (Mức dễ - trung bình):** Lập bảng danh mục các công cụ cài đặt trên Windows (Chocolatey, Node.js, JDK 17, Python, Android Studio, SDK, VS Code) và phân tích nguyên nhân kỹ thuật không build được iOS trên Windows.
3. **Bài tập 3 (Mức trung bình):** Kế hoạch chi tiết 5 bước thiết lập môi trường trên macOS (Homebrew, Node.js, Watchman, CocoaPods, Xcode) và các công cụ bổ sung để chạy song song Android trên máy Mac.

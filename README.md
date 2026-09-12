# BT_Mobile - Bài Tập Lập Trình Di Động Đa Nền Tảng (React Native)

Kho lưu trữ bài tập và tài liệu học tập môn **Lập trình Di động Đa nền tảng với React Native**.

---

## 📚 Danh mục bài tập

| Thư mục | Tên bài | Nội dung chính |
| :--- | :--- | :--- |
| 📁 **[Bài Luyện Tập 1](./Bài%20Luyện%20Tập%201)** | Tổng quan React Native & Ứng dụng di động | - Khái niệm Cross-Platform, ưu thế Codebase dùng chung.<br>- Bối cảnh thị trường di động, kiến trúc React Native (JS Engine, Bridge, Native Views).<br>- So sánh Native vs React Native, tư duy React (JSX, Props, State).<br>- Bài tập tình huống thực tế & Kế hoạch chuẩn bị môi trường. |
| 📁 **[Bài Luyện Tập 2](./Bài%20Luyện%20Tập%202)** | Đặc tính ứng dụng di động & Xu hướng Đa nền tảng | - Khái niệm Mobile App, vai trò trong các ngành nghề.<br>- Đặc tính: Mobility, Interactivity, Multimedia, Connectivity.<br>- Lịch sử phát triển nền tảng, bài học HTML5 của Facebook.<br>- Phân tích ứng dụng (Banking, TikTok, Duolingo, Shopee) & Đề xuất dự án EduTrack. |
| 📁 **[Bài Luyện Tập 3](./Bài%20Luyện%20Tập%203)** | Ôn tập JavaScript ES6+ cho React Native | - Lý thuyết nền tảng JS: Scope, Closure, Arrow functions, Destructuring, Rest/Spread, Array methods.<br>- **Bài 1 (`basic.js`):** Arrow functions (tổng, bình phương, kiểm tra số > 10).<br>- **Bài 2 (`student.js`, `app.js`):** Modules & Destructuring thông tin sinh viên.<br>- **Bài 3 (`products.js`):** Xử lý mảng nâng cao (`map`, `filter`, `reduce`).<br>- Thư mục **`Ảnh/`**: Chứa ảnh chụp minh chứng chạy Console thực tế. |
| 📁 **[Bài Luyện Tập 4](./Bài%20Luyện%20Tập%204)** | Quy trình hoạt động & Thiết lập môi trường | - Quy trình hoạt động 5 bước của React Native, vai trò của The Bridge.<br>- So sánh môi trường Windows vs macOS, phân tích nguyên nhân Windows không build trực tiếp được iOS.<br>- Ý nghĩa các lệnh khởi tạo (`init`, `run-android`, `run-ios`) & cấu trúc thư mục dự án.<br>- Sơ đồ kiến trúc trực quan (Mermaid & hình ảnh `Ảnh/so_do_react_native.png`). |
| 📁 **[Bài Luyện Tập 5](./Bài%20Luyện%20Tập%205)** | Kiến trúc 3 luồng, Cơ chế Render & Thiết bị thật | - Chi tiết 3 luồng: JS Thread, Shadow Thread (Yoga Engine), Native UI Thread.<br>- Cơ chế render từ thẻ JSX `<View>`, `<Text>` thành widget gốc.<br>- Kiến trúc JSI & Yoga Layout; Điều kiện build Android vs iOS.<br>- Code component mẫu `App.js` ("Hello React Native"), Checklist kết nối điện thoại Android thật & ảnh minh họa trực quan. |

---

## 🚀 Hướng dẫn chạy thử mã nguồn (Bài Luyện Tập 3)

Yêu cầu môi trường: **Node.js (v18+)**

```bash
# Di chuyển vào thư mục Bài Luyện Tập 3
cd "Bài Luyện Tập 3"

# Chạy từng bài:
node basic.js      # Bài 1
node app.js        # Bài 2
node products.js   # Bài 3

# Hoặc chạy kiểm thử tự động toàn bộ:
node run_all.js
```

# BÀI LUYỆN TẬP 3: ÔN TẬP JAVASCRIPT ES6+ CHO REACT NATIVE

Thư mục này chứa đầy đủ lý thuyết, mã nguồn thực hành và ảnh chụp màn hình console minh chứng cho **Bài Luyện Tập 3**.

---

## 📁 Cấu trúc thư mục

```text
Bài Luyện Tập 3/
├── Ảnh/
│   ├── console_bai1.png       # Ảnh chụp console Bài 1 (Arrow Functions)
│   ├── console_bai2.png       # Ảnh chụp console Bài 2 (Import/Export & Destructuring)
│   ├── console_bai3.png       # Ảnh chụp console Bài 3 (map, filter, reduce)
│   └── console_tong_hop.png   # Ảnh chụp console chạy toàn bộ
├── basic.js                   # Mã nguồn Bài tập 1
├── student.js                 # Dữ liệu sinh viên Bài tập 2 (Export)
├── app.js                     # Thực thi Bài tập 2 (Import & Destructuring)
├── products.js                # Mã nguồn Bài tập 3 (Array methods)
├── run_all.js                 # Script chạy kiểm thử tự động cả 3 bài
├── package.json               # Cấu hình ES Module (type: module)
├── Ly_Thuyet.md               # Câu hỏi và câu trả lời chi tiết cho Phần A
├── Thuc_Hanh.md               # Đề bài, code và hình ảnh console cho Phần B
└── README.md                  # Hướng dẫn tổng quan
```

---

## 📌 Tóm tắt nội dung

### Phần A: Câu hỏi ôn tập lý thuyết ([Ly_Thuyet.md](./Ly_Thuyet.md))
1. **Câu 1:** Vai trò của các kiến thức JavaScript nền tảng (`let`, `const`, `scope`, `closure`, `arrow function`, `destructuring`, `rest/spread`, xử lý mảng) trong React Native và những khó khăn khi người học chưa nắm vững (lỗi state mutation, stale closure, rò rỉ dữ liệu).
2. **Câu 2:** Phân biệt `named export` và `default export`; Chiến lược lựa chọn cho component chính (default) và utility/constants (named).
3. **Câu 3:** Ý nghĩa của `arrow function`, so sánh với hàm thông thường; Lý do thống trị trong React Native (xử lý sự kiện `onPress`, inline callbacks, functional components).
4. **Câu 4:** Phân biệt `rest parameters` (gom lại thành mảng trong khai báo hàm) và `spread syntax` (trải phẳng các phần tử trong lời gọi hàm/object mới) qua ví dụ `sum(...numbers)` và `Math.max(...scores)`.
5. **Câu 5:** Khái niệm React Native, các ưu điểm vượt trội và giải thích vì sao dùng chung một codebase giúp tiết kiệm 70-90% thời gian phát triển và bảo trì.

### Phần B: Bài tập thực hành ([Thuc_Hanh.md](./Thuc_Hanh.md))
1. **Bài tập 1 (`basic.js`):** Xây dựng các hàm arrow function: tính tổng 2 số, bình phương một số, kiểm tra lớn hơn 10.
2. **Bài tập 2 (`student.js`, `app.js`):** Khởi tạo dữ liệu sinh viên, export ra ngoài (cả default và named export), import và áp dụng Object Destructuring hiển thị ra console dạng bảng.
3. **Bài tập 3 (`products.js`):** Danh sách 6 sản phẩm; Áp dụng `map()` lấy danh sách tên sản phẩm; `filter()` lọc sản phẩm còn hàng; `reduce()` tính tổng giá trị kho hàng.

---

## ⚡ Lệnh chạy nhanh từ Terminal

```bash
# Di chuyển vào thư mục
cd "Bài Luyện Tập 3"

# Chạy từng bài
node basic.js
node app.js
node products.js

# Hoặc chạy toàn bộ 1 lúc
node run_all.js
```

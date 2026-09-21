# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Đăng nhập và quản trị web

- Nút **Đăng nhập** sử dụng email và mật khẩu trong bảng `users`. Chỉ role `admin` thấy mục **Quản lý**.
- Trên app Android/iOS, **Quản lý** mở trình duyệt bên ngoài. Trang `/admin` chỉ chạy trên web; truy cập bằng deep link trong app sẽ quay về trang chủ.
- Trên web, `/admin` yêu cầu đăng nhập và role `admin`. Backend kiểm tra role hiện tại trong database cho mọi API `/api/admin`, kể cả khi gọi trực tiếp.
- Cấu hình `EXPO_PUBLIC_API_URL` và `EXPO_PUBLIC_ADMIN_WEB_URL` theo `.env.example` trong `.env.local`, rồi khởi động lại Expo. Dùng IP LAN truy cập được từ điện thoại, không dùng `localhost` cho điện thoại thật.
- Chạy backend với `npm start` trong `backend`, chạy web với `npm run web` ở thư mục gốc. Khi triển khai, dùng HTTPS và đặt URL trang web thực tế vào cấu hình.
- Trình duyệt đăng nhập riêng với app. Phiên web được lưu trong `sessionStorage`; app giữ phiên trong bộ nhớ và cần đăng nhập lại khi khởi động lại. Phiên hết hạn sau 8 giờ hoặc khi backend khởi động lại; đăng xuất thu hồi phiên phía server.

### Bảng dữ liệu quản trị

Menu **Đăng bài hát** giữ nguyên form đăng bài. Các mục **Người dùng**, **Bài hát**, **Nghệ sĩ**, **Album**, **Thể loại**, **Playlist** có danh sách riêng, tìm kiếm phía server và phân trang 20 dòng. Nút thêm ở bảng bài hát mở form Đăng bài hát; các bảng khác mở form thêm. Nút Sửa tải dữ liệu hiện tại và cho lưu hoặc hủy.

API mới nằm tại `/api/admin/data/:entity` (GET/POST), `/api/admin/data/:entity/:id` (GET/PUT/DELETE) và `/api/admin/data/:entity/:id/delete-preview` (GET). Tất cả yêu cầu quyền admin. Bảng và API đọc người dùng không trả mật khẩu; để trống mật khẩu trong form sửa sẽ giữ nguyên mật khẩu hiện tại.

Trước khi xóa, hộp xác nhận hiển thị số bản ghi liên quan bị ảnh hưởng theo khóa ngoại hiện có. Nếu số lượng thay đổi, cần mở lại xác nhận. Không thể tự xóa tài khoản đang đăng nhập hoặc xóa/hạ quyền admin cuối cùng. Ghi dữ liệu và cập nhật liên kết thể loại dùng transaction. Chức năng này không yêu cầu thay đổi schema hoặc chạy lại `mobile.sql`.

Sau khi cập nhật code, khởi động lại backend và tải lại trang web. `npm test` trong thư mục `backend` chạy test xác thực và CRUD với database giả lập, không thay đổi database đang dùng.

### Đặt mật khẩu cho tài khoản có sẵn

Theo cấu hình demo hiện tại, cột `password_hash` lưu mật khẩu trực tiếp, ví dụ `mk123@`, và backend so sánh chính xác với mật khẩu nhập vào. Tên cột được giữ nguyên để không phải đổi schema. Cách lưu này chỉ dùng cho demo vì người đọc database có thể thấy mật khẩu. Các chuỗi `scrypt:...` cũ cần được thay bằng mật khẩu mới bằng lệnh UPDATE; không chạy lại toàn bộ file SQL để đặt mật khẩu (cuối file có các lệnh `TRUNCATE`).

Trong PowerShell tại thư mục `backend`, đặt `$env:DB_PASSWORD` bằng mật khẩu MySQL, `$env:ACCOUNT_PASSWORD` bằng mật khẩu mới (1–255 ký tự), rồi chạy:

```powershell
npm run set-password -- admin@spotify.com
Remove-Item Env:ACCOUNT_PASSWORD
```

Script chỉ cập nhật mật khẩu của email đã tồn tại; không tạo tài khoản hoặc cấp role admin. Hỗ trợ `DB_HOST`, `DB_USER`, `DB_NAME` nếu database không dùng cấu hình mặc định. Không lưu mật khẩu trong Git.

Chạy `npm test` trong `backend` để kiểm tra xác thực và phân quyền bằng database giả lập.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

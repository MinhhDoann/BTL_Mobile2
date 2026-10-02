# BÀI LUYỆN TẬP 1 - PHẦN B: BÀI TẬP LUYỆN TẬP THỰC HÀNH

---

## BÀI TẬP 1 – MỨC DỄ
> **Đề bài:**  
> Em hãy chọn một ứng dụng di động quen thuộc trong thực tế như ứng dụng bán hàng, ứng dụng tin tức, ứng dụng học tập hoặc ứng dụng mạng xã hội. Hãy mô tả ngắn gọn các chức năng chính của ứng dụng đó và nhận xét ứng dụng này có phù hợp để phát triển bằng React Native hay không. Khi giải thích, cần liên hệ đến các yếu tố như phát triển nhanh, dùng chung mã nguồn, giao diện nhất quán và khả năng chạy trên cả Android và iOS.

### 1. Lựa chọn ứng dụng: Ứng dụng Thương mại điện tử (E-Commerce) - Ví dụ: Shopee / Tiki
#### Các chức năng chính của ứng dụng:
1. **Duyệt và tìm kiếm sản phẩm:** Xem danh mục hàng hóa, banner quảng cáo khuyến mãi, bộ lọc theo giá/đánh giá, tìm kiếm thông minh bằng từ khóa.
2. **Chi tiết sản phẩm:** Xem thư viện ảnh/video, thông số kỹ thuật, giá bán, chọn phân loại (màu sắc, kích cỡ), đọc đánh giá và bình luận.
3. **Giỏ hàng & Thanh toán:** Thêm/sửa/xóa sản phẩm trong giỏ, áp mã giảm giá (voucher), chọn địa chỉ giao hàng và phương thức thanh toán.
4. **Quản lý tài khoản & Đơn hàng:** Đăng nhập/đăng ký (OTP, Google, Apple ID), theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Đã nhận).
5. **Thông báo & Tương tác:** Nhận thông báo đẩy (Push Notifications) về đơn hàng và mã giảm giá, tính năng chat hỗ trợ khách hàng.

---

### 2. Đánh giá mức độ phù hợp khi phát triển bằng React Native
**Kết luận:** Ứng dụng thương mại điện tử **CỰC KỲ PHÙ HỢP (Hoàn hảo)** để phát triển bằng React Native.

#### Phân tích các yếu tố then chốt:
1. **Phát triển nhanh (Fast Development & Time-to-Market):**
   - Lĩnh vực thương mại điện tử có tính cạnh tranh khốc liệt và biến động theo từng đợt khuyến mãi (Mega Sale 11/11, 12/12, Tết).
   - React Native giúp đưa ứng dụng ra thị trường nhanh chóng nhờ tính năng **Fast Refresh**, hệ sinh thái thư viện khổng lồ có sẵn cho UI, thanh toán và xử lý form.
2. **Dùng chung mã nguồn (Code Sharing):**
   - Toàn bộ logic kiểm tra giỏ hàng, tính giá tiền sau khi giảm giá, validation form thanh toán và xử lý API đều viết bằng JavaScript/TypeScript và dùng chung 100% cho cả Android và iOS.
   - Doanh nghiệp không cần phải đồng bộ thuật toán tính tiền trên hai nền tảng riêng biệt, loại bỏ hoàn toàn nguy cơ sai lệch logic giữa 2 bản build.
3. **Giao diện nhất quán (Consistent UI/UX):**
   - Với các thương hiệu lớn, tính nhất quán về nhận diện thương hiệu (màu sắc thương hiệu, typography, bố cục thẻ sản phẩm) là yếu tố sống còn.
   - React Native giúp định dạng kiểu dáng (Styling bằng Flexbox tương tự CSS) đồng nhất, mang lại cảm giác trải nghiệm quen thuộc cho khách hàng dù họ đổi từ điện thoại Samsung sang iPhone.
4. **Khả năng chạy mượt mà trên cả Android và iOS:**
   - Ứng dụng bán hàng thiên về việc cuộn danh sách (List), tải ảnh và tương tác nút bấm — đây chính là thế mạnh của React Native (sử dụng `FlatList` tối ưu bộ nhớ).
   - React Native chuyển đổi trực tiếp thành Native Views nên trải nghiệm cuộn, lướt và hiệu ứng chuyển trang mượt mà như ứng dụng gốc, hoàn toàn đáp ứng kỳ vọng của hàng triệu người dùng.

---

## BÀI TẬP 2 – MỨC DỄ ĐẾN TRUNG BÌNH
> **Đề bài:**  
> Em hãy viết một đoạn phân tích so sánh giữa phát triển ứng dụng Native và phát triển ứng dụng bằng React Native. Nội dung cần làm rõ điểm mạnh và hạn chế của mỗi hướng phát triển, đặc biệt trong các trường hợp cần tối ưu hiệu năng, cần ra mắt sản phẩm nhanh, cần tiết kiệm chi phí hoặc cần bảo trì ứng dụng trên nhiều nền tảng.

### Bài phân tích chuyên sâu:

Trong xu hướng phát triển ứng dụng di động hiện đại, việc lựa chọn giữa **Native Development** (Swift/Kotlin) và **Cross-platform bằng React Native** là một trong những quyết định kiến trúc chiến lược ảnh hưởng trực tiếp đến sự thành bại của dự án. Mỗi phương pháp đều sở hữu những thế mạnh vượt trội đi kèm các giới hạn kỹ thuật đặc thù:

#### 1. Xét về điểm mạnh và hạn chế tổng quan:
- **Phát triển Native:**
  - *Điểm mạnh:* Cung cấp hiệu năng tính toán và xử lý đồ họa đạt mức cực đại; tận dụng 100% các API phần cứng và tính năng bảo mật mới nhất của hệ điều hành ngay trong ngày đầu phát hành mà không cần phụ thuộc bên thứ ba.
  - *Hạn chế:* Chi phí đầu tư cao gấp đôi do phải tuyển hai nhóm kỹ sư riêng biệt; thời gian phát triển kéo dài; khó khăn trong việc đảm bảo tính đồng bộ tính năng giữa hai hệ điều hành.
- **Phát triển bằng React Native:**
  - *Điểm mạnh:* Tái sử dụng từ 70% – 90% mã nguồn; tốc độ phát triển và kiểm thử giao diện cực nhanh nhờ cơ chế Fast Refresh; cộng đồng mã nguồn mở khổng lồ; dễ dàng huy động nguồn lực lập trình viên sẵn có từ mảng Web/React.
  - *Hạn chế:* Hiệu năng có thể suy giảm ở các tác vụ nặng cần tính toán liên tục qua tầng Bridge/JSI; kích thước file cài đặt ban đầu (APK/IPA) lớn hơn Native; việc tích hợp các thư viện chuyên sâu đôi khi đòi hỏi phải can thiệp mã nguồn gốc (Java/Objective-C).

#### 2. Phân tích cụ thể theo từng trường hợp chiến lược:
1. **Khi cần tối ưu hiệu năng (Performance Optimization):**
   - **Lựa chọn tối ưu: NATIVE.**
   - Đối với các ứng dụng như: Game 3D tốc độ cao, xử lý luồng âm thanh/video thời gian thực, thuật toán AI chạy trực tiếp trên thiết bị (On-device ML), hoặc ứng dụng thực tế ảo tăng cường (AR/VR). Ở phân khúc này, Native vượt trội tuyệt đối vì có thể tận dụng trực tiếp tập lệnh CPU/GPU và các framework đồ họa tầng thấp như Metal (iOS) hay Vulkan (Android) mà không chịu độ trễ từ lớp trung gian.
2. **Khi cần ra mắt sản phẩm nhanh (Time-to-Market):**
   - **Lựa chọn tối ưu: REACT NATIVE.**
   - Các startup hoặc doanh nghiệp đang chạy đua với thời gian để kiểm chứng nhu cầu thị trường (MVP) sẽ hưởng lợi lớn nhất từ React Native. Việc phát triển song song cho cả hai chợ ứng dụng chỉ bằng một lần viết mã giúp rút ngắn chu kỳ phát triển từ hàng năm xuống còn vài tháng hoặc vài tuần.
3. **Khi cần tiết kiệm ngân sách và chi phí đầu tư (Cost-Efficiency):**
   - **Lựa chọn tối ưu: REACT NATIVE.**
   - Doanh nghiệp chỉ cần đầu tư cho một đội ngũ phát triển tinh gọn, cùng chia sẻ công cụ và quy trình làm việc. Tiết kiệm từ 30% đến 50% tổng chi phí đầu tư ban đầu so với việc đồng thời thuê hai nhóm phát triển Native riêng biệt.
4. **Khi cần bảo trì và nâng cấp lâu dài trên nhiều nền tảng (Multi-platform Maintenance):**
   - **Lựa chọn tối ưu: REACT NATIVE.**
   - Khi có sự cố (bug) nghiệp vụ hoặc cần thay đổi chiến lược giao diện, việc vá lỗi chỉ cần thực hiện trên một codebase duy nhất. Điều này loại bỏ hoàn toàn hiện tượng "phiên bản Android đã sửa nhưng phiên bản iOS vẫn còn lỗi", giúp đội ngũ vận hành tập trung nguồn lực nâng cấp tính năng thay vì dàn trải sửa lỗi trùng lặp.

---

## BÀI TẬP 3 – MỨC TRUNG BÌNH
> **Đề bài:**  
> Em hãy mô tả bằng sơ đồ hoặc đoạn thuyết minh quy trình hoạt động cơ bản của React Native, bắt đầu từ mã JavaScript, đi qua JavaScript engine, bridge, native module hoặc native views, sau đó hiển thị giao diện trên thiết bị di động. Sau khi vẽ hoặc mô tả sơ đồ, em cần giải thích vì sao React Native có thể tạo ra trải nghiệm gần giống ứng dụng native nhưng vẫn cho phép dùng chung nhiều phần mã nguồn.

### 1. Sơ đồ quy trình hoạt động cơ bản của React Native

```
+-----------------------------------------------------------------------------+
|                          1. MÃ NGUỒN JAVASCRIPT / REACT                     |
|  - Khai báo giao diện bằng JSX (<View>, <Text>, <Image>,...)               |
|  - Quản lý logic, trạng thái (State, Props, Hooks)                          |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                     2. JAVASCRIPT ENGINE (Hermes / JSCore)                  |
|  - Biên dịch và thực thi logic mã JS trên JavaScript Thread                 |
|  - Tính toán cây giao diện (Virtual DOM / Component Tree)                   |
|  - Chuẩn bị danh sách lệnh thay đổi giao diện                               |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                    3. THE BRIDGE (CẦU NỐI TRUNG GIAN)                       |
|  - Đóng gói các lệnh thành định dạng chuỗi JSON tuần tự hóa                 |
|  - Truyền thông điệp bất đồng bộ (Asynchronous) giữa JS Thread và UI Thread |
+-----------------------------------------------------------------------------+
                   |                                       |
                   v (Yêu cầu vẽ UI)                       v (Yêu cầu phần cứng)
+---------------------------------------+   +---------------------------------+
|      4. NATIVE VIEWS (UI THREAD)      |   |        5. NATIVE MODULES        |
|  - Android: ViewGroup, TextView,...   |   |  - Camera, GPS, Lưu trữ SQLite  |
|  - iOS: UIView, UILabel,...           |   |  - Cảm biến gia tốc, Bluetooth  |
+---------------------------------------+   +---------------------------------+
                   |
                   v
+-----------------------------------------------------------------------------+
|                  6. HIỂN THỊ TRÊN MÀN HÌNH THIẾT BỊ DI ĐỘNG                 |
|  - Hệ điều hành vẽ trực tiếp các widget gốc (Native UI Components)           |
|  - Tiếp nhận sự kiện chạm (Touch) và gửi ngược lại về JS Thread qua Bridge |
+-----------------------------------------------------------------------------+
```

### 2. Thuyết minh chi tiết quy trình 5 bước:
1. **Khởi tạo và biên dịch:** Lập trình viên viết mã bằng JavaScript/TypeScript và JSX. Khi ứng dụng khởi chạy, mã này được nạp vào **JavaScript Engine** (thường là engine Hermes siêu nhẹ).
2. **Xử lý logic trên JS Thread:** JS Engine thông dịch mã, giải quyết các phép tính toán, lấy dữ liệu mạng và tạo ra cấu trúc giao diện ảo.
3. **Đóng gói và truyền tải qua Bridge:** Mọi chỉ thị hiển thị (ví dụ: *"vẽ một khối màu xanh kích thước 100x100 có chữ 'Chào mừng'"*) được chuyển thành các chuỗi JSON và gửi qua **Bridge**.
4. **Xử lý tại tầng Native:**
   - Nếu là lệnh hiển thị giao diện: Bộ giải mã phía Native tiếp nhận và gọi các hàm tạo view gốc tương ứng của hệ điều hành (**Native Views**).
   - Nếu là lệnh phần cứng (chụp ảnh, lấy vị trí): Gửi đến các **Native Modules** viết bằng Java/Kotlin hoặc Obj-C/Swift để kích hoạt phần cứng.
5. **Phản hồi sự kiện:** Khi người dùng chạm ngón tay vào màn hình, Native UI bắt được sự kiện touch, đóng gói dữ liệu tọa độ vào JSON và gửi ngược qua Bridge về JS Thread để hàm `onPress` được kích hoạt.

---

### 3. Giải thích: Vì sao React Native tạo ra trải nghiệm gần giống Native nhưng vẫn dùng chung nhiều mã nguồn?

1. **Giao diện thực sự là Native 100% (Không phải Web hay WebView):**
   - Các công nghệ lai cũ (Hybrid) tạo cảm giác giật lag vì toàn bộ ứng dụng bị nhét vào một trình duyệt web ảo (WebView).
   - React Native hoàn toàn khác biệt: Giao diện cuối cùng hiển thị trên màn hình người dùng là **chính xác các widget gốc của Android (`android.widget.*`) và iOS (`UIKit.*`)**. Do đó, cảm giác cuộn trang, độ nảy quán tính, hiệu ứng bóng mờ hay phản hồi xúc giác đều là của hệ điều hành gốc.
2. **Tách biệt rạch ròi giữa "Logic" và "Hiển thị":**
   - **Phần dùng chung (Shared Code - 80-90%):** Nằm ở tầng Logic (gọi API, tính toán giảm giá, xác thực form, quản lý State). Tầng này không phụ thuộc vào hệ điều hành nên dùng chung hoàn toàn bằng JavaScript.
   - **Phần riêng biệt (Native Renderer):** Tầng Native phụ trách việc ánh xạ: Thẻ `<View>` tự động chuyển thành `UIView` trên iPhone và `ViewGroup` trên điện thoại Android. Nhờ cơ chế tách lớp này, lập trình viên chỉ cần viết một cấu trúc thống nhất nhưng nhận lại thành phẩm chuẩn theo phong cách của từng hệ điều hành.

---

## BÀI TẬP 4 – MỨC TRUNG BÌNH ĐẾN KHÓ
> **Đề bài:**  
> Một cửa hàng thời trang muốn xây dựng ứng dụng bán hàng chạy trên cả Android và iOS. Ứng dụng cần có giao diện đẹp, danh sách sản phẩm, giỏ hàng, đăng nhập người dùng và thông báo khuyến mãi. Thời gian triển khai ngắn, kinh phí giới hạn và nhóm phát triển chỉ có kinh nghiệm JavaScript/React. Em hãy đề xuất nên sử dụng React Native hay phát triển Native riêng cho từng nền tảng. Bài làm cần giải thích rõ lý do lựa chọn, ưu điểm đạt được và các rủi ro có thể gặp phải.

### 1. Đề xuất phương án
👉 **ĐỀ XUẤT LỰA CHỌN:** **SỬ DỤNG REACT NATIVE (Kết hợp Expo hoặc React Native CLI).**

---

### 2. Giải thích lý do lựa chọn (Căn cứ trên điều kiện thực tế)

1. **Phù hợp hoàn hảo với nhân lực hiện có:**
   - Nhóm phát triển đã có nền tảng vững chắc về **JavaScript/React**. Việc học cú pháp và tư duy component của React Native diễn ra cực kỳ tự nhiên, loại bỏ hoàn toàn chi phí và thời gian đào tạo học Swift hay Kotlin từ đầu.
2. **Đáp ứng nghiêm ngặt giới hạn về thời gian (Deadline gấp):**
   - Viết một lần – chạy hai nền tảng giúp tiến độ dự án rút ngắn ít nhất 40% – 50% so với phương án làm hai ứng dụng Native riêng rẽ.
3. **Phù hợp với ngân sách hạn hẹp:**
   - Cửa hàng không cần thuê thêm kỹ sư iOS/Android đắt đỏ, tối ưu hóa tối đa chi phí nhân công và chi phí kiểm thử.
4. **Bản chất tính năng của ứng dụng thời trang:**
   - Các chức năng: *Danh sách sản phẩm, Giỏ hàng, Đăng nhập, Giao diện đẹp, Thông báo khuyến mãi (Push Notification)* hoàn toàn là các tính năng tiêu chuẩn dạng CRUD/E-commerce mà React Native hỗ trợ cực kỳ mạnh mẽ và mượt mà.

---

### 3. Các ưu điểm đạt được khi áp dụng React Native
- **Đạt hiệu quả kinh tế cao nhất:** 1 codebase, 1 đội ngũ, phát hành đồng thời trên cả Google Play Store và Apple App Store.
- **Giao diện thời trang bắt mắt:** Hỗ trợ Flexbox mạnh mẽ giúp các nhà thiết kế dễ dàng tạo các giao diện Lookbook, banner trượt, lưới sản phẩm 2 cột mượt mà, đồng nhất trên mọi kích thước màn hình.
- **Dễ dàng cập nhật khuyến mãi nóng (Over-The-Air Update):** Có thể sử dụng các dịch vụ như Expo Updates hoặc Microsoft CodePush để đẩy ngay các banner giảm giá, sửa lỗi giao diện tới máy khách hàng mà không cần chờ duyệt ứng dụng hàng tuần từ Apple/Google.
- **Tận dụng kho thư viện phong phú:** Có sẵn các thư viện hoàn thiện cho:
  - Thông báo đẩy: Firebase Cloud Messaging (`@react-native-firebase/messaging`) hoặc Expo Notifications.
  - Quản lý trạng thái giỏ hàng: Redux Toolkit hoặc Zustand.
  - Thanh toán: Tích hợp SDK VNPay, ZaloPay, MoMo, Stripe cho React Native.

---

### 4. Các rủi ro tiềm ẩn và giải pháp khắc phục

| Rủi ro có thể gặp | Phân tích ảnh hưởng | Giải pháp khắc phục |
| :--- | :--- | :--- |
| **1. Khó khăn khi cấu hình môi trường Native** | Nhóm chỉ biết React/Web, dễ bị lúng túng khi gặp lỗi build Gradle (Android) hoặc CocoaPods/Xcode (iOS). | **Giải pháp:** Sử dụng **Expo (Managed Workflow)** ngay từ đầu. Expo giúp ẩn đi toàn bộ các cấu hình native phức tạp, hỗ trợ build trên mây (EAS Build) mà không cần máy Mac đắt tiền cho iOS. |
| **2. Hiệu năng cuộn ảnh sản phẩm** | Danh sách thời trang có nhiều ảnh chất lượng cao, dễ gây tràn RAM hoặc lag khi cuộn nhanh trên máy Android yếu. | **Giải pháp:** Sử dụng thư viện `react-native-fast-image` để cache ảnh; dùng `FlashList` (của Shopify) thay cho `FlatList` thông thường để tối ưu hóa việc tái sử dụng ô hiển thị. |
| **3. Cấp quyền và cấu hình Thông báo đẩy** | Chính sách cấp quyền Push Notification trên iOS (APNs) và Android 13+ khá nghiêm ngặt. | **Giải pháp:** Sử dụng nền tảng thông báo chuyên nghiệp như OneSignal hoặc Firebase kết hợp cấu hình chuẩn chỉ theo tài liệu chính thức. |
| **4. Rủi ro cập nhật phiên bản OS mới** | Khi Apple hoặc Google cập nhật phiên bản hệ điều hành mới, một số thư viện bên thứ ba có thể bị xung đột. | **Giải pháp:** Hạn chế cài đặt các thư viện không rõ nguồn gốc; chỉ sử dụng các thư viện chính thống được cộng đồng bảo trì thường xuyên. |

---

## BÀI TẬP 5 – MỨC KHÓ
> **Đề bài:**  
> Em hãy lập kế hoạch chuẩn bị môi trường phát triển React Native cho một máy tính cá nhân. Trong bài làm, cần trình bày vai trò của các công cụ như Node.js, npm hoặc Yarn, Java JDK, Android Studio, Android SDK, AVD Emulator, Visual Studio Code, React Native CLI hoặc Expo CLI. Sau đó, hãy đề xuất trường hợp nên chọn React Native CLI và trường hợp nên chọn Expo CLI khi bắt đầu một dự án mới.

### 1. Kế hoạch chuẩn bị môi trường phát triển React Native (cho hệ điều hành Windows)

#### Bảng tổng hợp vai trò của các công cụ:

| STT | Tên công cụ | Vai trò cốt lõi trong hệ thống |
| :---: | :--- | :--- |
| **1** | **Node.js** | Môi trường runtime JavaScript phía máy chủ, đóng vai trò nền tảng để chạy Metro Bundler (công cụ đóng gói mã JavaScript cho React Native) và thực thi các script tự động hóa. |
| **2** | **npm / Yarn** | Trình quản lý gói thư viện (Package Manager). Dùng để tải, cài đặt, quản lý phiên bản và chia sẻ các thư viện phụ thuộc (dependencies) trong dự án React Native. |
| **3** | **Java JDK (Azul Zulu / OpenJDK 17)** | Bộ công cụ phát triển Java. Cần thiết để biên dịch mã nguồn Android và chạy công cụ tự động hóa build Gradle của hệ sinh thái Android. |
| **4** | **Android Studio** | Môi trường phát triển tích hợp (IDE) chính thức của Google dành cho Android. Cung cấp bộ công cụ giao diện trực quan để quản lý SDK, máy ảo và gỡ lỗi Native. |
| **5** | **Android SDK (Software Development Kit)** | Bộ thư viện, công cụ biên dịch (`build-tools`, `platform-tools` như `adb`) và các file ảnh hệ điều hành Android (System Images) để xây dựng file APK/AAB. |
| **6** | **AVD Emulator (Android Virtual Device)** | Máy ảo Android chạy trực tiếp trên máy tính, cho phép chạy thử nghiệm, tương tác cảm ứng và kiểm tra ứng dụng trên nhiều kích thước màn hình mà không cần cắm điện thoại thật. |
| **7** | **Visual Studio Code (VS Code)** | Trình soạn thảo mã nguồn chính (Editor). Nhẹ, tốc độ cao, hỗ trợ nhiều extension quan trọng cho React Native (ESLint, Prettier, React Native Tools, Tailwind/Style IntelliSense). |
| **8** | **React Native CLI / Expo CLI** | Công cụ giao diện dòng lệnh (Command Line Interface) để khởi tạo template dự án, khởi chạy máy chủ phát triển (dev server) và kích hoạt lệnh build ứng dụng. |

---

#### Các bước triển khai thiết lập môi trường chi tiết:

```
[Bước 1: Cài đặt Node.js LTS & Yarn] 
       |
       v
[Bước 2: Cài đặt Java JDK 17 (Zulu)]
       |
       v
[Bước 3: Cài đặt Android Studio & Android SDK (Android 14 - API 34)]
       |
       v
[Bước 4: Cấu hình biến môi trường hệ thống (ANDROID_HOME, JAVA_HOME, Path)]
       |
       v
[Bước 5: Tạo máy ảo AVD Emulator trong Android Studio]
       |
       v
[Bước 6: Cài đặt VS Code và các Extension hỗ trợ]
       |
       v
[Bước 7: Khởi tạo dự án đầu tiên và chạy thử nghiệm (Run App)]
```

1. **Bước 1: Cài đặt Node.js & Trình quản lý gói:**
   - Tải và cài đặt phiên bản **Node.js LTS** (khuyên dùng Node 18 hoặc Node 20) từ trang chủ `nodejs.org`.
   - Cài đặt Yarn (tùy chọn nhưng khuyến nghị): `npm install -g yarn`.
2. **Bước 2: Cài đặt Java Development Kit (JDK 17):**
   - Cài đặt OpenJDK 17 (khuyến nghị bản **Azul Zulu JDK 17**).
   - Thiết lập biến môi trường `JAVA_HOME` trỏ tới thư mục cài đặt JDK (ví dụ: `C:\Program Files\Zulu\zulu-17`).
3. **Bước 3: Cài đặt Android Studio & SDK Components:**
   - Tải và cài đặt Android Studio từ `developer.android.com`.
   - Mở SDK Manager, tích chọn:
     - `Android SDK Platform 34` (hoặc phiên bản mới nhất được React Native chỉ định).
     - `Android SDK Build-Tools`.
     - `Android SDK Command-line Tools`.
     - `Android Emulator`.
4. **Bước 4: Thiết lập biến môi trường Android (Bắt buộc):**
   - Thêm biến hệ thống: `ANDROID_HOME = C:\Users\<Tên_User>\AppData\Local\Android\Sdk`.
   - Thêm vào biến `Path`:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%ANDROID_HOME%\tools`
5. **Bước 5: Cấu hình máy ảo Android (AVD Emulator):**
   - Mở Device Manager trong Android Studio $\rightarrow$ Tạo mới máy ảo (ví dụ: Pixel 7, tải System Image Google APIs x86_64).
6. **Bước 6: Cài đặt VS Code:**
   - Cài đặt các extension: *React Native Tools, ES7+ React/Redux/React-Native snippets, Prettier, Error Lens*.

---

### 2. Đề xuất: Khi nào nên chọn Expo CLI và khi nào nên chọn React Native CLI?

#### Bảng so sánh đặc tính:

| Đặc điểm | Expo CLI (Managed Workflow) | React Native CLI (Bare Workflow) |
| :--- | :--- | :--- |
| **Độ phức tạp ban đầu** | Rất thấp. Bắt đầu trong 5 phút. Không bắt buộc phải cài đặt Android Studio/Xcode ngay. | Trung bình - Cao. Phải cấu hình đầy đủ JDK, SDK, biến môi trường trước khi chạy được dòng code đầu tiên. |
| **Khả năng kiểm soát mã Native** | Tự động sinh mã native (Prebuild). Ít can thiệp trực tiếp vào thư mục `android/` và `ios/`. | Kiểm soát 100%. Lập trình viên có toàn quyền chỉnh sửa trực tiếp mã Java/Kotlin/Swift. |
| **Thư viện bên thứ ba** | Hỗ trợ hầu hết các thư viện phổ biến thông qua Expo Config Plugins. | Hỗ trợ mọi thư viện Native trên thế giới. |
| **Quy trình Build & Test** | Test trực tiếp trên điện thoại thật qua app Expo Go bằng mã QR. Hỗ trợ build Cloud miễn phí (EAS Build). | Phải build qua máy ảo AVD hoặc cắm cáp kết nối điện thoại có bật chế độ USB Debugging. Cần máy Mac để build cho iOS. |

---

#### Đề xuất lựa chọn cụ thể cho từng trường hợp:

#### Trường hợp 1: NÊN CHỌN EXPO CLI khi:
1. **Người mới bắt đầu học lập trình di động:**
   - Giúp học viên tập trung 100% vào tư duy React, JavaScript, JSX, State và Props mà không bị quá tải bởi các lỗi biên dịch Gradle hay môi trường hệ điều hành.
2. **Lập trình viên dùng máy Windows nhưng muốn làm ứng dụng cho cả iOS:**
   - Nhờ công cụ **Expo Go** và dịch vụ **EAS Build (Expo Application Services)**, bạn có thể kiểm thử trực tiếp trên chiếc iPhone cá nhân và build file cài đặt iOS trên máy chủ ảo của Expo mà không cần sở hữu máy Mac đắt đỏ.
3. **Phát triển ứng dụng tiêu chuẩn, MVP nhanh:**
   - Các ứng dụng thương mại điện tử, app tin tức, mạng xã hội thông thường, app quản lý công việc nội bộ.
   - Khi cần tính năng **OTA Updates** (cập nhật ứng dụng tức thì không cần qua App Store/Google Play kiểm duyệt).

#### Trường hợp 2: NÊN CHỌN REACT NATIVE CLI khi:
1. **Dự án doanh nghiệp lớn (Enterprise) cần tích hợp sâu:**
   - Ứng dụng cần tích hợp vào một hệ thống ứng dụng Native đã có sẵn từ trước (*Brownfield integration*).
2. **Cần can thiệp sâu vào phần cứng hoặc thư viện C++/Native chuyên biệt:**
   - Sử dụng các thiết bị ngoại vi chuyên dụng (máy in nhiệt Bluetooth đặc thù, đầu đọc thẻ quẹt POS, cảm biến chuyên ngành y tế/quân sự).
   - Các tác vụ xử lý đồ họa, âm thanh tần số thấp, thư viện mã hóa nội bộ của ngân hàng không có sẵn plugin trên hệ sinh thái Expo.
3. **Đội ngũ phát triển đã am hiểu sâu về Android (Java/Kotlin) và iOS (Swift/Obj-C):**
   - Khi nhóm muốn toàn quyền kiểm soát quá trình tối ưu hóa kích thước ứng dụng (Proguard, R8), cấu hình build variants chuyên sâu và chủ động tinh chỉnh file `build.gradle` / `Podfile`.

# BÀI LUYỆN TẬP 5 - PHẦN A: CÂU HỎI ÔN TẬP LÝ THUYẾT

---

## CÂU 1
> **Đề bài:**  
> Trình bày ba luồng chính khi một ứng dụng React Native được khởi chạy, gồm Native thread, JavaScript thread và Shadow thread. Hãy giải thích vai trò của từng luồng trong quá trình ứng dụng xử lý logic, tiếp nhận thao tác người dùng và hiển thị giao diện lên màn hình.

### 1. Giới thiệu ba luồng chính trong kiến trúc React Native

Khi một ứng dụng React Native khởi chạy, hệ thống không chạy đơn luồng mà phân bổ công việc trên **ba luồng thực thi (threads) cốt lõi** hoạt động song song và độc lập:

```
+-----------------------------------------------------------------------------+
|                      3 LUỒNG CỐT LÕI CỦA REACT NATIVE                       |
+-----------------------------------------------------------------------------+
|  1. JAVASCRIPT THREAD      2. SHADOW THREAD            3. NATIVE / UI THREAD |
|  - Chạy mã JS/React        - Layout Engine (Yoga)      - Main Thread hệ thống|
|  - Xử lý logic nghiệp vụ   - Tính toán tọa độ x, y     - Vẽ Pixel lên màn hình|
|  - Tính toán Virtual DOM   - Tính kích thước w, h      - Tiếp nhận Touch event|
+-----------------------------------------------------------------------------+
```

---

### 2. Vai trò chi tiết của từng luồng

#### a. JavaScript Thread (Luồng thực thi JavaScript)
- **Nhiệm vụ:** Là nơi chạy toàn bộ mã nguồn JavaScript/TypeScript do lập trình viên viết, được vận hành bởi JavaScript Engine (Hermes hoặc JavaScriptCore).
- **Trách nhiệm cụ thể:**
  - Thực thi logic nghiệp vụ (business logic), gọi API lấy dữ liệu mạng, xử lý thuật toán.
  - Quản lý trạng thái ứng dụng (State, Props, Context, Redux).
  - Khởi tạo và cập nhật cây giao diện ảo (**Virtual DOM / React Element Tree**).
  - Tiếp nhận các sự kiện người dùng (sau khi được Native gửi sang) để kích hoạt các hàm xử lý như `onPress`, `onChangeText`.

#### b. Shadow Thread (Luồng tính toán bố cục layout)
- **Nhiệm vụ:** Là luồng trung gian chạy ngầm phụ trách việc chuyển đổi các thuộc tính định kiểu Flexbox (vốn rất quen thuộc trong CSS/Web) thành các tọa độ hình học thực tế mà hệ điều hành di động hiểu được.
- **Trách nhiệm cụ thể:**
  - Vận hành thư viện **Yoga Layout Engine** (được Meta viết bằng C++ siêu nhanh và tối ưu).
  - Đọc các thuộc tính bố cục Flexbox (`flexDirection`, `justifyContent`, `alignItems`, `padding`, `margin`) từ JS Thread.
  - Tính toán ra tọa độ chính xác từng pixel: vị trí tuyệt đối $(x, y)$, chiều rộng $(width)$ và chiều cao $(height)$ của từng phần tử giao diện.
  - Đóng gói cây bố cục đã tính toán xong sang cho Native Thread để chuẩn bị vẽ.

#### c. Native Thread (Main UI Thread - Luồng giao diện chính)
- **Nhiệm vụ:** Là luồng chính của hệ điều hành (Android Main Thread hoặc iOS UI Thread), nơi duy nhất có quyền tương tác trực tiếp với phần cứng hiển thị của thiết bị.
- **Trách nhiệm cụ thể:**
  - Tiếp nhận các thông số tọa độ và kích thước từ Shadow Thread để **vẽ trực tiếp các widget gốc (Native Views)** như `ViewGroup`, `TextView`, `ImageView` (trên Android) hoặc `UIView`, `UILabel`, `UIImageView` (trên iOS) lên màn hình.
  - Duy trì tốc độ khung hình mượt mà (chuẩn 60 FPS – 120 FPS).
  - Lắng nghe và tiếp nhận tức thì mọi tương tác cảm ứng của người dùng (chạm, vuốt, cuộn) từ màn hình và chuyển thông tin sự kiện này sang JS Thread để xử lý logic.

---

## CÂU 2
> **Đề bài:**  
> Phân tích luồng render giao diện trong React Native từ khi JavaScript tạo ra các thành phần như View và Text cho đến khi Native thread tạo ra các thành phần giao diện tương ứng trên Android hoặc iOS. Theo em, vì sao React Native có thể tạo giao diện gần giống ứng dụng native dù lập trình viên viết mã bằng JavaScript?

### 1. Phân tích luồng render giao diện từ JavaScript đến Native

Quá trình render giao diện từ mã lệnh `<View>` và `<Text>` trải qua 4 giai đoạn nối tiếp:

```
[Giai đoạn 1: JS Thread]
  Lập trình viên viết: <View style={{padding: 10}}><Text>Xin chào</Text></View>
  -> JS Engine tạo React Element Tree (Virtual DOM) chứa cấu trúc thẻ và thuộc tính.
                     |
                     v
[Giai đoạn 2: Gửi sang Shadow Thread]
  Thông tin về thẻ và style Flexbox được chuyển sang Shadow Thread.
                     |
                     v
[Giai đoạn 3: Shadow Thread (Yoga Engine)]
  Yoga Engine phân tích Flexbox và tính toán hình học:
  -> View ngoài: x=0, y=50, width=390, height=100
  -> Text trong: x=10, y=60, width=150, height=30
                     |
                     v
[Giai đoạn 4: Native UI Thread]
  Main Thread nhận bản vẽ tọa độ đã tính toán:
  - Trên Android: Tạo android.view.ViewGroup và android.widget.TextView
  - Trên iOS: Tạo UIView và UILabel
  -> Hệ điều hành vẽ trực tiếp các đối tượng này lên màn hình thiết bị!
```

---

### 2. Vì sao React Native tạo ra giao diện gần giống Native dù viết bằng JavaScript?

1. **Không dùng WebView (Trình duyệt nhúng):**
   - Các công nghệ lai cũ (Cordova, PhoneGap, Ionic thế hệ cũ) chạy mã HTML/CSS bên trong một WebView. WebView là một "hộp cát trình duyệt", có độ trễ lớn, không hỗ trợ gia tốc phần cứng hoàn chỉnh và cảm ứng thiếu tự nhiên.
   - React Native **hoàn toàn nói không với WebView cho giao diện chính**.
2. **Cơ chế ánh xạ thành phần gốc (Native Widget Mapping):**
   - Mã JavaScript chỉ đóng vai trò là "bản thiết kế kiến trúc" (Blueprint).
   - Sản phẩm cuối cùng xuất hiện trên màn hình điện thoại của người dùng chính là **100% các thành phần đồ họa bản địa** do chính Google (Android) và Apple (iOS) tạo ra trong hệ điều hành:
     - `<View>` biến thành `android.view.ViewGroup` / `UIView`.
     - `<Text>` biến thành `android.widget.TextView` / `UILabel`.
     - `<ScrollView>` biến thành `android.widget.ScrollView` / `UIScrollView`.
3. **Hiệu ứng đồ họa và quán tính cảm ứng tự nhiên:**
   - Vì là widget gốc nên thao tác lướt danh sách có độ nảy quán tính (Rubber-band scrolling trên iOS), hiệu ứng sóng nước khi chạm (Ripple effect trên Android), độ đổ bóng (Elevation/Shadow) và font chữ hệ thống đều phản hồi ở cấp độ phần cứng mượt mà 60 FPS.

---

## CÂU 3
> **Đề bài:**  
> Giải thích vai trò của JSI và Yoga trong quá trình ứng dụng React Native khởi chạy và hiển thị giao diện. Hãy làm rõ mối liên hệ giữa việc JavaScript thread gửi logic UI/UX, Shadow thread tính toán layout và Native thread hiển thị kết quả cuối cùng lên màn hình.

### 1. Vai trò của JSI và Yoga trong React Native

#### a. JSI (JavaScript Interface - Giao diện JavaScript)
- **Bản chất:** Là một tầng trung gian C++ hiện đại nằm trong kiến trúc mới (New Architecture) của React Native, thay thế cho cơ chế Bridge truyền thống.
- **Vai trò mang tính cách mạng:**
  - Cho phép mã JavaScript **nắm giữ tham chiếu trực tiếp (Direct Reference) tới các đối tượng C++/Native** và gọi hàm đồng bộ (Synchronous Execution) mà không cần phải chuyển đổi dữ liệu qua chuỗi JSON.
  - **Tối ưu tốc độ khởi động và truyền dữ liệu:** Loại bỏ hoàn toàn chi phí đóng gói/giải mã chuỗi JSON (Serialization / Deserialization), giúp tốc độ giao tiếp giữa JavaScript và Native nhanh gấp nhiều lần, hạn chế triệt để hiện tượng nghẽn cổ chai.

#### b. Yoga (Yoga Layout Engine)
- **Bản chất:** Là thư viện mã nguồn mở chuyên tính toán bố cục Flexbox được Meta viết hoàn toàn bằng **C++**, đa nền tảng và có hiệu năng cực cao.
- **Vai trò:**
  - Cung cấp cơ chế bố cục Flexbox quen thuộc của Web cho cả Android và iOS (vốn là hai hệ điều hành có cơ chế layout gốc hoàn toàn khác nhau: Android dùng XML/ConstraintLayout, iOS dùng AutoLayout).
  - Yoga nhận cấu trúc component và các quy tắc Flexbox từ JavaScript, sau đó tính toán ra kích thước và tọa độ chính xác của từng phần tử với tốc độ micro-giây.

---

### 2. Mối liên hệ nhịp nhàng giữa 3 Luồng trong chu trình hiển thị

```
+-------------------+           +-------------------+           +-------------------+
| JAVASCRIPT THREAD |           |   SHADOW THREAD   |           |    NATIVE THREAD  |
+-------------------+           +-------------------+           +-------------------+
| Lập trình viên    |           |                   |           |                   |
| định nghĩa:       |           |                   |           |                   |
| - Cấu trúc thẻ    |  Gửi qua  | Yoga Engine       |  Gửi tọa  | Tiếp nhận bản vẽ  |
| - Logic state/props--------->| tính toán vị trí, | độ pixel  | & vẽ widget gốc:  |
| - Thuộc tính      | (JSI/C++) | kích thước (x, y, |--------->| ViewGroup/UIView  |
|   style Flexbox   |           | width, height)    | (Direct)  | Hiển thị lên màn  |
|                   |           |                   |           | hình thiết bị     |
+-------------------+           +-------------------+           +-------------------+
```

- **Mối liên hệ tương hỗ:**
  1. **JS Thread khởi xướng:** Xác định *cần vẽ cái gì* và *mang kiểu dáng Flexbox như thế nào*.
  2. **Shadow Thread tính toán:** Đóng vai trò là "kỹ sư đo đạc", chuyển đổi ý muốn Flexbox trừu tượng của JS thành các con số tọa độ cụ thể.
  3. **Native Thread thực thi:** Đóng vai trò là "thợ xây", nhận các con số tọa độ đã đo đạc từ Shadow Thread để đắp các pixel đồ họa lên màn hình điện thoại.
  - Nhờ sự phân chia này, việc tính toán bố cục phức tạp không làm nặng luồng UI chính (không gây đơ màn hình), đồng thời JS Thread cũng rảnh tay để tiếp tục xử lý logic dữ liệu mạng.

---

## CÂU 4
> **Đề bài:**  
> Trình bày các bước chuẩn bị để build và chạy ứng dụng React Native trên thiết bị Android thật. Trong quá trình đó, vì sao cần bật Developer Mode, USB Debugging, kiểm tra kết nối bằng lệnh `adb devices` và giữ thiết bị mở khóa khi build ứng dụng?

### 1. Các bước chuẩn bị để build và chạy trên thiết bị Android thật

1. **Bước 1: Bật Chế độ nhà phát triển (Developer Mode) trên điện thoại:**
   - Vào **Cài đặt (Settings)** $\rightarrow$ **Thông tin điện thoại (About phone)** $\rightarrow$ **Thông tin phần mềm**.
   - Tìm mục **Số hiệu bản dựng (Build number)** và **chạm liên tục 7 lần** cho đến khi hệ thống báo *"Bạn đã là nhà phát triển"*.
2. **Bước 2: Kích hoạt Gỡ lỗi qua USB (USB Debugging):**
   - Quay lại Cài đặt $\rightarrow$ Vào mục mới xuất hiện: **Tùy chọn nhà phát triển (Developer options)**.
   - Gạt bật công tắc **Gỡ lỗi qua USB (USB Debugging)**.
3. **Bước 3: Kết nối cáp USB với máy tính và cấp quyền tin cậy:**
   - Cắm cáp USB kết nối điện thoại với máy tính (chọn chế độ truyền tệp - File Transfer/MTP).
   - Trên màn hình điện thoại sẽ hiện hộp thoại: *"Cho phép gỡ lỗi USB từ máy tính này?"* $\rightarrow$ Tích chọn **"Luôn cho phép từ máy tính này"** và bấm **Cho phép (OK)**.
4. **Bước 4: Kiểm tra nhận diện thiết bị bằng lệnh `adb`:**
   - Mở Terminal/Command Prompt trên máy tính và gõ:
     ```bash
     adb devices
     ```
   - Nếu danh sách hiện mã thiết bị kèm chữ `device` (ví dụ: `RFCW10ABCDE device`), kết nối đã sẵn sàng.
5. **Bước 5: Thiết lập chuyển tiếp cổng kết nối Metro Bundler:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
6. **Bước 6: Khởi chạy ứng dụng:**
   - Giữ màn hình điện thoại luôn mở khóa và chạy lệnh:
     ```bash
     npx react-native run-android
     ```

---

### 2. Giải thích lý do bắt buộc của 4 yêu cầu kỹ thuật:

| Yêu cầu kỹ thuật | Vì sao bắt buộc phải thực hiện? |
| :--- | :--- |
| **Bật Developer Mode** | Đây là cơ chế bảo vệ an toàn của hệ điều hành Android. Mặc định Android khóa kín các cổng can thiệp hệ thống để bảo vệ người dùng phổ thông khỏi mã độc. Bật Developer Mode là điều kiện tiên quyết để mở quyền truy cập sâu cho lập trình viên. |
| **Bật USB Debugging** | Cho phép máy tính thông qua công cụ `adb` (*Android Debug Bridge*) gửi các lệnh cấp hệ thống xuống điện thoại: tự động đẩy file `.apk` vào bộ nhớ trong, cấp quyền truy cập, cài đặt ứng dụng âm thầm và thu thập log lỗi hệ thống (*Logcat*). Nếu không bật, máy tính chỉ coi điện thoại là một ổ cứng USB đọc dữ liệu đơn thuần. |
| **Kiểm tra bằng `adb devices`** | Để xác nhận chắc chắn điện thoại và máy tính đã thiết lập phiên giao tiếp tin cậy (qua chìa khóa mã hóa RSA). Nếu hiển thị `unauthorized`, nghĩa là người dùng chưa bấm đồng ý trên điện thoại; nếu trống trơn, nghĩa là dây cáp hỏng hoặc thiếu Driver USB Android (OEM USB Driver). |
| **Giữ thiết bị mở khóa khi build** | Trong quá trình build, sau khi cài đặt xong APK, máy tính sẽ gửi lệnh kích hoạt tự động mở ứng dụng (`am start`). Nếu điện thoại đang khóa màn hình hoặc tắt màn hình, hệ điều hành Android sẽ chặn lệnh khởi chạy ứng dụng chạy ngầm, dẫn đến lỗi build thất bại hoặc ứng dụng không thể kết nối tới máy chủ Metro Bundler (báo lỗi màn hình đỏ / không tải được bundle). |

---

## CÂU 5
> **Đề bài:**  
> So sánh việc build và chạy ứng dụng React Native trên Android và iOS. Hãy nêu rõ điều kiện cần có đối với từng nền tảng, đặc biệt là vai trò của Android Studio, SDK, thiết bị Android, Xcode, Apple ID và giới hạn khi chạy iOS chỉ khả dụng trên macOS.

### Bảng so sánh toàn diện giữa quy trình Build trên Android và iOS

| Tiêu chí so sánh | Quy trình Build trên ANDROID | Quy trình Build trên iOS |
| :--- | :--- | :--- |
| **Hệ điều hành máy tính phát triển** | Linh hoạt tuyệt đối: Hỗ trợ **Windows, macOS, Linux**. | Nghiêm ngặt: **Bắt buộc phải là macOS** (MacBook, Mac mini, iMac). |
| **Môi trường IDE chính thức** | **Android Studio** (của Google). | **Xcode** (của Apple). |
| **Bộ công cụ phát triển (SDK)** | **Android SDK** (Platforms, Build-Tools, Platform-Tools `adb`). | **iOS SDK** (tích hợp sẵn bên trong Xcode). |
| **Môi trường biên dịch mã Native** | **Java JDK 17** kết hợp công cụ tự động hóa **Gradle**. | Bộ công cụ **Apple Clang / LLVM** và **CocoaPods** (`Podfile`). |
| **Thiết bị giả lập (Simulator/Emulator)** | **AVD Emulator** (Android Virtual Device) - Ảo hóa nhân phần cứng. | **iOS Simulator** - Giả lập hành vi giao diện người dùng, tốc độ cực nhanh và nhẹ RAM. |
| **Yêu cầu tài khoản lập trình viên** | Không bắt buộc tài khoản khi test trên máy thật/máy ảo. Chỉ cần tài khoản Google Play Console ($25 một lần) khi muốn phát hành app. | **Bắt buộc phải có Apple ID**: Tài khoản miễn phí cho phép cài test tối đa 3 app lên iPhone cá nhân trong 7 ngày; Tài khoản trả phí **Apple Developer Program** ($99/năm) để phát hành App Store và dùng TestFlight. |
| **Cơ chế nạp ứng dụng lên máy thật** | Cắm cáp USB $\rightarrow$ bật USB Debugging $\rightarrow$ gõ lệnh `npx react-native run-android` là ứng dụng tự cài đặt thẳng vào máy. | Cắm cáp iPhone $\rightarrow$ mở Xcode $\rightarrow$ chọn Team / Ký chứng chỉ cá nhân (*Personal Team Code Signing*) $\rightarrow$ tin cậy chứng chỉ trong Cài đặt iPhone $\rightarrow$ mới chạy được. |

---

### Phân tích chuyên sâu về giới hạn độc quyền của iOS trên macOS

1. **Bản quyền sở hữu trí tuệ của Apple:**
   - Apple kiểm soát khép kín toàn bộ chuỗi giá trị phần cứng lẫn phần mềm. Apple quy định phần mềm Xcode và các bộ thư viện iOS SDK chỉ được cấp phép chạy trên phần cứng máy Mac chính hãng.
2. **Không có giải pháp thay thế trực tiếp trên Windows:**
   - Không tồn tại phần mềm "Xcode for Windows". Do đó, một lập trình viên sử dụng máy tính Windows dù viết mã JavaScript/React Native rất giỏi cũng **hoàn toàn không thể biên dịch ra file `.ipa` hoặc mở máy ảo iPhone trên máy của mình**.
3. **Giải pháp khắc phục cho người dùng Windows:**
   - Để kiểm thử ứng dụng iOS khi không có máy Mac, lập trình viên Windows buộc phải:
     - Sử dụng nền tảng đám mây **Expo (Managed Workflow)** kết hợp dịch vụ **EAS Build** (biên dịch file iOS trên máy chủ Mac ảo của Expo).
     - Sử dụng dịch vụ thuê máy Mac đám mây (MacStadium, AWS EC2 Mac Instances).
     - Kiểm thử ứng dụng Android trước trên máy tính cá nhân, sau đó mượn máy Mac để hoàn thiện và xuất bản bản iOS sau cùng.

---
*Tài liệu ôn tập Bài Luyện Tập 5 - Lập trình Di động Đa nền tảng với React Native.*

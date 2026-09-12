# BÀI LUYỆN TẬP 4 - PHẦN A: CÂU HỎI ÔN TẬP LÝ THUYẾT

---

## CÂU 1
> **Đề bài:**  
> Em hãy trình bày quy trình hoạt động cơ bản của một ứng dụng React Native. Trong phần trả lời cần làm rõ các bước từ khi lập trình viên viết mã JavaScript, mã được xử lý trong JavaScript runtime, gửi yêu cầu qua Bridge, ứng dụng native xử lý yêu cầu và trả kết quả về cho JavaScript.

### Quy trình hoạt động cơ bản của ứng dụng React Native

Ứng dụng React Native vận hành dựa trên cơ chế tương tác đa luồng giữa hai môi trường độc lập: **Thế giới JavaScript (JS World)** và **Thế giới Gốc (Native World)** thông qua 5 bước tuần tự:

```
[1. Mã nguồn JavaScript/React]
            |
            v
[2. JavaScript Runtime (Hermes / JSCore)]
  - Thực thi logic, tính toán Virtual DOM
            |
            v
[3. Đóng gói & Gửi qua Bridge]
  - Chuỗi hóa JSON bất đồng bộ (Asynchronous JSON Batches)
            |
            v
[4. Tầng Native xử lý yêu cầu (UI / Background Thread)]
  - Vẽ Native Views (UIView / ViewGroup) hoặc gọi Native Modules (Camera, GPS)
            |
            v
[5. Trả kết quả / Sự kiện về cho JavaScript]
  - Đóng gói sự kiện Touch / Dữ liệu phần cứng gửi ngược qua Bridge
```

1. **Bước 1: Viết mã nguồn:**  
   Lập trình viên viết giao diện và logic ứng dụng bằng **JavaScript/TypeScript** kết hợp cú pháp **JSX** (sử dụng các thẻ cốt lõi như `<View>`, `<Text>`, `<Image>`, `<TouchableOpacity>`).
2. **Bước 2: Xử lý tại JavaScript Runtime (Engine):**  
   Khi ứng dụng khởi chạy, toàn bộ mã JavaScript được nạp vào **JavaScript Runtime** (phổ biến nhất là engine **Hermes** tối ưu của Meta hoặc **JavaScriptCore**). Luồng JS (*JS Thread*) thực thi logic nghiệp vụ, xử lý state, props, và tính toán cấu trúc cây giao diện (Virtual DOM).
3. **Bước 3: Gửi yêu cầu qua Bridge (Cầu nối):**  
   JavaScript không thể trực tiếp ra lệnh cho hệ điều hành vẽ giao diện. Do đó, các mệnh lệnh hiển thị UI (ví dụ: *"vẽ một ô chữ tại tọa độ (x, y) với màu nền xanh"*) hoặc lệnh gọi phần cứng được **đóng gói thành các chuỗi văn bản JSON tuần tự** và gửi bất đồng bộ qua **Bridge**.
4. **Bước 4: Ứng dụng Native tiếp nhận và xử lý:**  
   - Phía Native (Java/Kotlin trên Android, Swift/Obj-C trên iOS) nhận các chuỗi JSON từ Bridge và giải mã.
   - **Xử lý UI:** Luồng chính của hệ điều hành (*Main/UI Thread*) sẽ tạo hoặc cập nhật các thành phần giao diện gốc thực thụ (**Native Views** như `android.view.ViewGroup` trên Android hoặc `UIView` trên iOS).
   - **Xử lý phần cứng:** Nếu là yêu cầu truy cập thiết bị (mở Camera, lấy vị trí GPS, đọc bộ nhớ), các **Native Modules** tương ứng sẽ kích hoạt phần cứng thực tế.
5. **Bước 5: Trả kết quả về cho JavaScript:**  
   Khi người dùng tương tác lên màn hình (chạm tay, vuốt cuộn) hoặc phần cứng hoàn tất tác vụ (ảnh đã chụp xong, tọa độ GPS đã nhận), tầng Native sẽ bắt sự kiện này, đóng gói ngược lại thành chuỗi JSON và gửi qua Bridge về JS Thread. Tại đây, hàm callback (như `onPress`) được kích hoạt, cập nhật lại state của React và tiếp tục chu trình tiếp theo.

---

## CÂU 2
> **Đề bài:**  
> Em hãy giải thích vai trò của Bridge trong React Native. Vì sao Bridge được xem là thành phần quan trọng giúp mã JavaScript có thể tương tác với các thành phần native và API của hệ điều hành?

### 1. Vai trò của Bridge trong React Native
- **Khái niệm:** **Bridge (Cầu nối)** là tầng kiến trúc trung gian đóng vai trò là "kênh phiên dịch và vận chuyển dữ liệu hai chiều" giữa hai môi trường hoàn toàn khác biệt:
  - **Môi trường JavaScript:** Chạy trên JavaScript Engine (JS Thread).
  - **Môi trường Native:** Chạy trên hệ điều hành Android (Java/Kotlin) hoặc iOS (Swift/Objective-C) trên Main UI Thread.
- **Nhiệm vụ cốt lõi:**
  1. **Đóng gói thông điệp (Serialization):** Chuyển đổi các đối tượng và lệnh từ JavaScript thành định dạng chuỗi văn bản trung lập (**JSON**) để gửi sang Native, và ngược lại.
  2. **Điều phối truyền tải bất đồng bộ (Asynchronous Messaging):** Đảm bảo luồng JavaScript và luồng UI Native trao đổi dữ liệu mà không chặn (block) lẫn nhau, giữ cho giao diện luôn phản hồi mượt mà ở mức 60 FPS.
  3. **Quản lý lời gọi hàm từ xa (Remote Procedure Call - RPC):** Giúp mã JS có thể triệu gọi các phương thức hệ thống viết bằng Java/Swift thông qua bảng đăng ký module (*Module Registry*).

---

### 2. Vì sao Bridge là thành phần tối quan trọng?

1. **Giải quyết rào cản ngôn ngữ và kiến trúc bộ nhớ:**
   - Mã JavaScript không thể trực tiếp truy cập vào ô nhớ hay gọi thẳng các API viết bằng C++, Java hay Objective-C của hệ điều hành. Nếu không có Bridge, JavaScript sẽ bị "cô lập" hoàn toàn và không thể làm được gì ngoài việc tính toán trên bộ nhớ của chính nó.
2. **Biến ứng dụng thành Native thực sự thay vì Web nhúng:**
   - Nhờ có Bridge, React Native không cần dùng đến WebView. JavaScript chỉ giữ vai trò "bộ não chỉ huy", còn đôi tay thực hiện vẽ giao diện và bấm nút phần cứng chính là các API gốc của iOS và Android.
3. **Đảm bảo tính độc lập và an toàn đa luồng:**
   - Nếu JavaScript xử lý một phép tính nặng (như parse dữ liệu lớn), cơ chế bất đồng bộ của Bridge ngăn không cho phép tính đó làm đơ màn hình người dùng, bởi UI Thread vẫn có thể tiếp nhận thao tác chạm bình thường.

---

## CÂU 3
> **Đề bài:**  
> Em hãy phân tích sự khác nhau trong việc cài đặt môi trường React Native trên Windows và macOS. Trong câu trả lời cần chỉ ra vì sao Windows chỉ build được ứng dụng Android, còn macOS có thể dùng Xcode để build và chạy ứng dụng iOS.

### 1. Phân tích sự khác nhau về môi trường giữa Windows và macOS

| Tiêu chí | Cài đặt trên hệ điều hành Windows | Cài đặt trên hệ điều hành macOS |
| :--- | :--- | :--- |
| **Trình quản lý gói hệ thống** | Sử dụng **Chocolatey** (`choco`) hoặc **Winget**. | Sử dụng **Homebrew** (`brew`). |
| **Công cụ theo dõi file** | Không bắt buộc công cụ ngoài. | Sử dụng **Watchman** (công cụ giám sát thay đổi file do Meta phát triển). |
| **Hệ thống Build Android** | **Android Studio**, Android SDK, JDK 17, AVD Emulator. | **Android Studio**, Android SDK, JDK 17, AVD Emulator. |
| **Hệ thống Build iOS** | ❌ **Hoàn toàn KHÔNG hỗ trợ.** | ✅ **Xcode** (kèm Command Line Tools, iOS Simulator, CocoaPods). |
| **Khả năng biên dịch dự án** | **Chỉ build được ứng dụng Android.** | **Build được CẢ ứng dụng iOS VÀ Android.** |

---

### 2. Vì sao Windows chỉ build được Android, còn macOS build được cả iOS?

#### a. Lý do Windows KHÔNG THỂ build trực tiếp ứng dụng iOS:
1. **Chính sách đóng độc quyền của Apple:**
   - Toàn bộ chuỗi công cụ biên dịch mã nguồn iOS (bao gồm trình biên dịch Clang/LLVM cho Objective-C và Swift, bộ thư viện đồ họa Metal, hệ thống iOS SDK, và công cụ dòng lệnh `xcodebuild`) đều được Apple **thiết kế độc quyền và chỉ chạy trên hệ điều hành macOS**.
   - Apple không bao giờ phát hành Xcode hay iOS SDK cho Windows hoặc Linux.
2. **Cơ chế ký số và chứng chỉ bản quyền (Code Signing & Provisioning):**
   - Để tạo ra file cài đặt `.ipa` chạy trên iPhone thật hoặc đẩy lên App Store, dự án bắt buộc phải đi qua công cụ quản lý khóa Keychain và chữ ký số điện tử của Apple chỉ tích hợp bên trong macOS.
   - *Kết luận:* Trên máy tính Windows thuần túy, bạn không thể biên dịch và chạy file dự án trong thư mục `ios/` (trừ khi dùng dịch vụ Cloud Build như Expo EAS Build hoặc cài máy ảo Hackintosh/Mac mini).

#### b. Lý do macOS có thể build được cả hai nền tảng:
- **Với iOS:** macOS sở hữu môi trường bản địa hoàn hảo với **Xcode** và **iOS Simulator**.
- **Với Android:** Google theo đuổi triết lý **mã nguồn mở và đa nền tảng**. Google phát hành Android SDK, công cụ biên dịch Gradle và phần mềm Android Studio chạy tương thích hoàn toàn trên cả Windows, Linux và macOS. Do đó, người dùng máy Mac chỉ cần cài thêm Android Studio là có thể phát triển song song cho cả Android và iOS trên cùng một máy tính.

---

## CÂU 4
> **Đề bài:**  
> Em hãy trình bày các bước cơ bản để khởi tạo và chạy một dự án React Native đầu tiên. Cần nêu rõ ý nghĩa của các lệnh `react-native init ProjectName`, `cd ProjectName`, `react-native run-ios` và `react-native run-android`.

### 1. Các bước cơ bản để khởi tạo và chạy một dự án React Native đầu tiên

- **Bước 1: Chuẩn bị môi trường máy tính:** Đảm bảo máy đã cài đặt đầy đủ Node.js, Java JDK 17, Android Studio, cấu hình biến môi trường `ANDROID_HOME` và khởi tạo sẵn 1 máy ảo Android (AVD Emulator).
- **Bước 2: Khởi tạo dự án mới bằng CLI:**
  Mở terminal và gõ lệnh khởi tạo khung dự án:
  ```bash
  npx @react-native-community/cli init MyFirstApp
  ```
  *(hoặc `npx react-native init MyFirstApp` theo cú pháp truyền thống).*
- **Bước 3: Di chuyển vào thư mục dự án vừa tạo:**
  ```bash
  cd MyFirstApp
  ```
- **Bước 4: Khởi chạy máy chủ đóng gói mã nguồn (Metro Bundler):**
  ```bash
  npm start
  ```
- **Bước 5: Biên dịch và chạy ứng dụng lên thiết bị:**
  - Nếu chạy trên Android (Windows / Mac): `npm run android` hoặc `npx react-native run-android`.
  - Nếu chạy trên iOS (chỉ trên macOS): `npm run ios` hoặc `npx react-native run-ios`.

---

### 2. Ý nghĩa cụ thể của từng câu lệnh

| Câu lệnh | Ý nghĩa và cơ chế hoạt động kỹ thuật |
| :--- | :--- |
| **`react-native init ProjectName`** | **Lệnh khởi tạo toàn bộ bộ khung dự án (Scaffolding):**<br>- Tải về template React Native chuẩn mới nhất từ kho lưu trữ của Meta.<br>- Tự động tạo thư mục dự án với cấu trúc đầy đủ: thư mục `android/`, `ios/`, file cấu hình, cài đặt tự động hàng trăm package vào `node_modules`.<br>- Cấu hình sẵn liên kết mã nguồn gốc để sẵn sàng biên dịch. |
| **`cd ProjectName`** | **Lệnh chuyển đổi thư mục làm việc (*Change Directory*):**<br>- Di chuyển dấu nhắc lệnh của Terminal/Command Prompt từ thư mục cha vào đúng bên trong thư mục gốc của dự án `ProjectName`.<br>- Bắt buộc phải thực hiện lệnh này thì các lệnh biên dịch và npm mới có thể đọc được file `package.json` của dự án. |
| **`react-native run-android`** | **Lệnh tự động hóa quy trình build và chạy trên Android:**<br>1. Tự động kiểm tra và kết nối với thiết bị/máy ảo Android đang mở thông qua công cụ `adb`.<br>2. Kích hoạt trình biên dịch **Gradle** trong thư mục `android/` (`./gradlew assembleDebug`) để biên dịch mã nguồn Java/Kotlin và thư viện C++.<br>3. Tạo ra file cài đặt `app-debug.apk` và đẩy vào máy ảo.<br>4. Khởi động Metro Bundler và tự động mở ứng dụng trên màn hình điện thoại. |
| **`react-native run-ios`** | **Lệnh tự động hóa quy trình build và chạy trên iOS (Chỉ chạy trên macOS):**<br>1. Kích hoạt trình giả lập **iOS Simulator** mặc định (ví dụ: iPhone 15).<br>2. Sử dụng công cụ dòng lệnh **`xcodebuild`** của Apple để biên dịch toàn bộ mã nguồn Objective-C/Swift và các Pods dependencies trong thư mục `ios/`.<br>3. Cài đặt file ứng dụng `.app` vào Simulator và tự động kích hoạt app. |

---

## CÂU 5
> **Đề bài:**  
> Em hãy mô tả vai trò của một số thành phần cơ bản trong cấu trúc dự án React Native như thư mục `android`, thư mục `ios`, thư mục `node_modules`, file `package.json`, file `index.js`, file `app.json` và file `App.js`.

### Bảng mô tả chi tiết cấu trúc cốt lõi của một dự án React Native

```text
MyProject/
├── android/           <-- Dự án Native Android (Gradle, Java/Kotlin)
├── ios/               <-- Dự án Native iOS (Xcode, Swift/Obj-C, Pods)
├── node_modules/      <-- Thư viện bên thứ ba tải từ NPM
├── App.js             <-- Giao diện chính của ứng dụng
├── index.js           <-- Điểm vào đầu tiên (Entry Point)
├── app.json           <-- Tên và định danh ứng dụng
└── package.json       <-- Quản lý dependencies và scripts
```

| Tên thành phần | Vai trò kỹ thuật trong dự án React Native |
| :--- | :--- |
| **Thư mục `android/`** | **Dự án gốc Android thuần túy:**<br>- Chứa toàn bộ mã nguồn Java/Kotlin, file cấu hình cấp quyền phần cứng `AndroidManifest.xml`, tài nguyên hình ảnh (`res/mipmap`), và các kịch bản build Gradle (`build.gradle`, `settings.gradle`).<br>- Đây là nơi Android Studio mở ra để cấu hình Native Modules, tối ưu bộ nhớ hoặc xuất file phát hành APK/AAB. |
| **Thư mục `ios/`** | **Dự án gốc iOS thuần túy:**<br>- Chứa toàn bộ mã nguồn Objective-C/Swift, file cấu hình quyền bảo mật `Info.plist`, file khai báo thư viện `Podfile`, và file dự án Xcode (`.xcworkspace`).<br>- Đây là nơi Xcode mở ra để quản lý chứng chỉ ký số, cấu hình Push Notifications và xuất bản ứng dụng lên App Store. |
| **Thư mục `node_modules/`** | **Kho chứa mã nguồn thư viện phụ thuộc:**<br>- Nơi lưu trữ tất cả các thư viện của bên thứ ba (Third-party libraries) được cài đặt tự động qua lệnh `npm install` hoặc `yarn install` (bao gồm thư viện React, React Native, React Navigation, Axios,...). |
| **File `package.json`** | **Hồ sơ định danh và quản lý dự án Node.js:**<br>- Khai báo tên dự án, phiên bản, tác giả.<br>- Khai báo danh sách các gói phụ thuộc trực tiếp (`dependencies`) và phụ thuộc lúc phát triển (`devDependencies`).<br>- Định nghĩa các câu lệnh tắt (`scripts`) như `npm start`, `npm run android`, `npm run ios`. |
| **File `index.js`** | **Điểm nhập cảnh đầu tiên (Entry Point):**<br>- Là file đầu tiên mà JavaScript Engine thực thi khi ứng dụng bật lên.<br>- Có nhiệm vụ duy nhất nhưng tối quan trọng: sử dụng hàm `AppRegistry.registerComponent()` để đăng ký component gốc của bạn với hệ điều hành, giúp hệ điều hành biết cần render component nào lên màn hình thiết bị. |
| **File `app.json`** | **Tệp cấu hình định danh ứng dụng:**<br>- Chứa tên kỹ thuật nội bộ của ứng dụng (`name`) và tên hiển thị công khai trên màn hình điện thoại của người dùng (`displayName`). File này được cả Metro Bundler và hệ điều hành đọc khi khởi tạo. |
| **File `App.js`** | **Component gốc của giao diện người dùng (Root UI Component):**<br>- Là thành phần giao diện cấp cao nhất do lập trình viên trực tiếp xây dựng.<br>- Nơi thiết lập màn hình khởi động đầu tiên, cấu hình hệ thống điều hướng (Navigation Container), cài đặt bộ bọc trạng thái (Redux Provider, Theme Context) và hiển thị các khối giao diện người dùng. |

---
*Tài liệu ôn tập Bài Luyện Tập 4 - Lập trình Di động Đa nền tảng với React Native.*

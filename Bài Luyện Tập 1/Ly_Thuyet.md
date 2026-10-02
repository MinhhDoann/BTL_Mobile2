# BÀI LUYỆN TẬP 1 - PHẦN A: CÂU HỎI ÔN TẬP LÝ THUYẾT

---

## CÂU 1
> **Đề bài:**  
> Em hãy trình bày khái niệm phát triển ứng dụng mobile đa nền tảng. Từ đó, phân tích vì sao việc sử dụng một cơ sở mã duy nhất có thể giúp nhà phát triển rút ngắn thời gian xây dựng ứng dụng và giảm chi phí so với phát triển riêng cho từng nền tảng Android và iOS.

### 1. Khái niệm phát triển ứng dụng mobile đa nền tảng (Cross-Platform Mobile Development)
- **Định nghĩa:** Phát triển ứng dụng di động đa nền tảng là phương pháp tiếp cận kỹ thuật cho phép lập trình viên xây dựng ứng dụng có khả năng cài đặt và vận hành mượt mà trên nhiều hệ điều hành di động khác nhau (phổ biến nhất hiện nay là **iOS** và **Android**) từ **một cơ sở mã nguồn duy nhất** (*Single Codebase*) hoặc chia sẻ phần lớn mã nguồn chung.
- **Công nghệ tiêu biểu:** React Native, Flutter, Kotlin Multiplatform (KMP), .NET MAUI,...

---

### 2. Phân tích nguyên nhân rút ngắn thời gian và giảm chi phí

#### a. Rút ngắn thời gian phát triển (Faster Time-to-Market)
1. **Tái sử dụng mã nguồn ở mức độ cao (High Code Reusability):**
   - Thay vì phải viết mã hai lần bằng hai ngôn ngữ khác nhau (Swift cho iOS, Kotlin/Java cho Android), lập trình viên chỉ cần viết một lần logic nghiệp vụ, gọi API, xử lý dữ liệu và cấu trúc giao diện. Tỷ lệ tái sử dụng có thể đạt từ **70% - 90%**.
2. **Đồng bộ hóa phát hành tính năng (Simultaneous Feature Release):**
   - Khi có tính năng mới hoặc thay đổi về nghiệp vụ, nhà phát triển chỉ cần cập nhật mã nguồn một lần duy nhất. Tính năng sẽ có mặt đồng thời trên cả iOS và Android mà không gặp tình trạng nền tảng này phải chờ đợi nền tảng kia.
3. **Quy trình kiểm thử (Testing) và sửa lỗi (Debugging) nhanh hơn:**
   - Hầu hết các lỗi liên quan đến logic dữ liệu, thuật toán hay luồng người dùng chỉ cần kiểm tra và vá lỗi một lần trên codebase chung, thay vì phải tái hiện và viết lại mã sửa lỗi trên hai nền tảng riêng biệt.
4. **Tận dụng cơ chế phản hồi nhanh (Fast Refresh / Hot Reload):**
   - Các công nghệ đa nền tảng hiện đại như React Native hỗ trợ Fast Refresh, cho phép xem ngay lập tức các thay đổi trên giao diện mà không cần tốn thời gian biên dịch lại toàn bộ dự án như cách làm truyền thống của Native.

#### b. Giảm thiểu chi phí phát triển và vận hành (Cost Reduction)
1. **Tối ưu quy mô và cơ cấu nhân sự:**
   - **Với Native truyền thống:** Doanh nghiệp bắt buộc phải duy trì hai đội ngũ kỹ sư độc lập: 1 đội chuyên iOS (Swift/Objective-C) và 1 đội chuyên Android (Kotlin/Java).
   - **Với Cross-Platform:** Doanh nghiệp chỉ cần tuyển dụng và duy trì **một đội ngũ kỹ sư** thông thạo công nghệ đa nền tảng (ví dụ: lập trình viên Web đã biết JavaScript/React có thể nhanh chóng chuyển giao sang làm React Native). Điều này giúp cắt giảm đáng kể quỹ lương, chi phí tuyển dụng và đào tạo.
2. **Giảm chi phí quản lý dự án (Project Management):**
   - Quản lý một danh sách công việc (Backlog), một quy trình Sprint, một hệ thống CI/CD chung giúp giảm tải thời gian họp hành, tài liệu hóa và điều phối giữa các phòng ban.
3. **Tiết kiệm chi phí bảo trì và nâng cấp dài hạn (Maintenance):**
   - Trong vòng đời sản phẩm (Product Lifecycle), chi phí bảo trì thường chiếm từ 50% đến 70% tổng chi phí sở hữu. Việc duy trì một codebase duy nhất giúp việc nâng cấp thư viện, sửa đổi giao diện theo mùa và bảo mật trở nên tinh gọn, tiết kiệm ngân sách lớn cho tổ chức.

---

## CÂU 2
> **Đề bài:**  
> Em hãy phân tích sự cần thiết của việc phát triển ứng dụng di động đa nền tảng trong bối cảnh người dùng sử dụng nhiều thiết bị và nhiều hệ điều hành khác nhau. Khi nào một doanh nghiệp nên ưu tiên lựa chọn giải pháp đa nền tảng thay vì phát triển ứng dụng native riêng biệt?

### 1. Sự cần thiết của phát triển ứng dụng đa nền tảng trong bối cảnh hiện đại
1. **Thị trường bị phân mảnh sâu sắc giữa hai hệ điều hành:**
   - Hiện nay, **Android** chiếm khoảng 70% thị phần di động toàn cầu (phổ biến ở phân khúc phổ thông và trung cấp), trong khi **iOS** chiếm khoảng 28-30% nhưng tập trung ở nhóm người dùng có mức chi tiêu cao (phân khúc cao cấp). Bỏ qua một trong hai nền tảng đồng nghĩa với việc doanh nghiệp tự tước đi cơ hội tiếp cận một nửa thị trường tiềm năng.
2. **Kỳ vọng về trải nghiệm người dùng đa thiết bị (Omni-device Experience):**
   - Người dùng thường xuyên chuyển đổi thiết bị, sở hữu cả máy tính bảng và điện thoại, hoặc đổi từ Android sang iPhone và ngược lại. Họ kỳ vọng ứng dụng phải có tính năng tương đồng, giao diện nhận diện thương hiệu nhất quán và dữ liệu đồng bộ tức thì.
3. **Áp lực cạnh tranh và kiểm thử thị trường:**
   - Trong kỷ nguyên số, "tốc độ là sinh mệnh". Doanh nghiệp cần đưa sản phẩm đến tay toàn bộ người dùng càng sớm càng tốt để thu thập phản hồi, kiểm chứng mô hình kinh doanh (Product-Market Fit) trước khi đối thủ chiếm lĩnh thị phần.

---

### 2. Khi nào doanh nghiệp nên ưu tiên lựa chọn giải pháp đa nền tảng?

Doanh nghiệp nên ưu tiên lựa chọn giải pháp đa nền tảng khi rơi vào các tình huống sau:

| Tiêu chí | Bối cảnh doanh nghiệp nên chọn Cross-Platform |
| :--- | :--- |
| **Giai đoạn phát triển** | Startups, các dự án xây dựng sản phẩm mẫu (**MVP - Minimum Viable Product**) để gọi vốn hoặc khảo sát thị trường. |
| **Ngân sách & Nguồn lực** | Ngân sách giới hạn, không đủ kinh phí duy trì cùng lúc hai team iOS và Android riêng biệt; hoặc đã có sẵn đội ngũ lập trình viên Web (JavaScript/React/Dart). |
| **Thời gian triển khai (Time to Market)** | Cần ra mắt ứng dụng đồng thời trên cả hai chợ ứng dụng App Store và Google Play trong thời gian ngắn nhất (vài tuần đến vài tháng). |
| **Bản chất của ứng dụng** | Ứng dụng thiên về hiển thị thông tin, xử lý dữ liệu từ máy chủ (CRUD), biểu mẫu: Thương mại điện tử (E-commerce), Đọc báo/Tin tức, Mạng xã hội, Đặt đồ ăn, Quản trị nội bộ doanh nghiệp (CRM, ERP), Giáo dục trực tuyến. |
| **Yêu cầu phần cứng** | Ứng dụng chỉ sử dụng các API thiết bị tiêu chuẩn (Camera chụp ảnh thông thường, GPS định vị, Push Notifications, Lưu trữ cục bộ). |

> **Lưu ý ngoại lệ:** Nếu ứng dụng yêu cầu đồ họa 3D phức tạp (Game nặng), can thiệp chuyên sâu vào phần cứng tầng thấp (Bluetooth LE chuyên dụng, xử lý tín hiệu âm thanh/video thời gian thực), hoặc các giải pháp AR/VR hiệu năng cao thì giải pháp **Native** vẫn là lựa chọn bắt buộc.

---

## CÂU 3
> **Đề bài:**  
> Em hãy trình bày React Native là gì và giải thích ngắn gọn cách React Native hoạt động. Trong phần trả lời cần làm rõ vai trò của JavaScript engine, bridge và native views trong quá trình hiển thị giao diện ứng dụng trên thiết bị di động.

### 1. React Native là gì?
- **React Native** là một framework mã nguồn mở do tập đoàn Meta (trước đây là Facebook) phát triển và phát hành vào năm 2015.
- Framework này cho phép lập trình viên sử dụng ngôn ngữ **JavaScript** (hoặc **TypeScript**) cùng với thư viện **React** để xây dựng các ứng dụng di động có giao diện và trải nghiệm thuần gốc (**Native**) trên cả hai nền tảng Android và iOS.
- Khác với các giải pháp lai (Hybrid/WebView như Cordova, Ionic) – vốn render mã HTML/CSS trong một trình duyệt web thu nhỏ, React Native trực tiếp tạo ra các thành phần giao diện gốc của hệ điều hành.

---

### 2. Cách React Native hoạt động và vai trò của các thành phần cốt lõi

Quy trình hoạt động của React Native phân tách thành hai thế giới chính: **JavaScript World** (Logic) và **Native World** (Giao diện & Phần cứng hệ điều hành).

```
+--------------------------+                 +-----------------------------+
|     JavaScript World     |                 |        Native World         |
|                          |                 |   (Android: Java / Kotlin)  |
|  - React Components      |                 |   (iOS: Swift / Obj-C)      |
|  - JSX, State, Props     |                 |                             |
|  - Logic Nghiệp Vụ       |                 |                             |
|            |             |                 |                             |
|    [JavaScript Engine]   |                 |                             |
|    (Hermes / JSCore)     |                 |                             |
+------------|-------------+                 +--------------^--------------+
             |                                              |
             +-------------> [    BRIDGE    ] --------------+
                             (JSON Asynchronous)
                             (Tuần tự hóa thông điệp)
                                     |
                                     v
                           [    Native Views   ]
                           (Android: TextView, ViewGroup)
                           (iOS: UILabel, UIView)
```

#### a. Vai trò của JavaScript Engine (Công cụ thực thi JavaScript)
- **Nhiệm vụ:** Là môi trường thông dịch và thực thi toàn bộ mã nguồn JavaScript của ứng dụng (bao gồm React components, xử lý state, props, logic nghiệp vụ, gọi API).
- **Các engine thông dụng:** 
  - **Hermes:** JavaScript engine mã nguồn mở được Meta tối ưu riêng cho React Native trên mobile, giúp giảm dung lượng ứng dụng (APK/IPA), khởi động ứng dụng tức thì (TFTI) và tiết kiệm RAM.
  - **JavaScriptCore (JSC):** Engine mặc định trên iOS (Safari).
- **Cách thức:** Khi ứng dụng chạy, JavaScript Engine thông dịch mã logic, tính toán giao diện ảo (Virtual DOM/Render Tree) và chuẩn bị các mệnh lệnh cập nhật giao diện cần gửi sang phía Native.

#### b. Vai trò của Bridge (Cầu nối)
- **Nhiệm vụ:** Đóng vai trò là phương tiện trung gian kết nối và trao đổi dữ liệu hai chiều giữa luồng JavaScript (*JS Thread*) và luồng hệ điều hành (*Native/UI Thread*).
- **Đặc tính cơ bản của Bridge:**
  - **Bất đồng bộ (Asynchronous):** Luồng JS và luồng Native không chặn lẫn nhau khi trao đổi dữ liệu, giúp giao diện không bị đơ giật.
  - **Tuần tự hóa (Batched & Serialized):** Mọi lệnh giao tiếp (ví dụ: yêu cầu vẽ giao diện hoặc phản hồi sự kiện người dùng chạm màn hình) đều được đóng gói thành các chuỗi văn bản JSON và gửi qua cầu nối theo đợt.
- **Ví dụ luồng đi:** Khi JS engine tính toán xong một component cần render, lệnh JSON được gửi qua Bridge: *"Tạo một text với nội dung 'Xin chào' tại tọa độ (x, y)"*.

#### c. Vai trò của Native Views (Giao diện gốc)
- **Nhiệm vụ:** Hiển thị trực tiếp các thành phần thị giác lên màn hình thiết bị và tiếp nhận thao tác chạm (Touch Events) của người dùng thông qua các widget chính thống của hệ điều hành.
- **Cơ chế ánh xạ (Mapping):** React Native **không** hiển thị thẻ HTML `<div>` hay `<p>`, mà chuyển đổi trực tiếp các thẻ JSX thành Native Views tương ứng:
  - `<View>` $\rightarrow$ `android.view.ViewGroup` (Android) / `UIView` (iOS).
  - `<Text>` $\rightarrow$ `android.widget.TextView` (Android) / `UILabel` (iOS).
  - `<Image>` $\rightarrow$ `android.widget.ImageView` (Android) / `UIImageView` (iOS).
  - `<ScrollView>` $\rightarrow$ `android.widget.ScrollView` (Android) / `UIScrollView` (iOS).
- **Kết quả:** Người dùng nhận được trải nghiệm mượt mà, cảm ứng phản hồi nhạy bén và hiệu ứng giao diện tự nhiên hoàn toàn giống như một ứng dụng Native thuần túy.

---

## CÂU 4
> **Đề bài:**  
> Em hãy so sánh ứng dụng Native và ứng dụng React Native theo các tiêu chí: ngôn ngữ lập trình, cơ sở mã, hiệu suất, khả năng truy cập API thiết bị, tốc độ phát triển, công cụ debug và loại ứng dụng phù hợp.

### Bảng so sánh chi tiết giữa Native và React Native

| Tiêu chí | Ứng dụng Native (Gốc) | Ứng dụng React Native |
| :--- | :--- | :--- |
| **1. Ngôn ngữ lập trình** | - **iOS:** Swift hoặc Objective-C.<br>- **Android:** Kotlin hoặc Java. | - **JavaScript** hoặc **TypeScript** (kết hợp cú pháp JSX của React). |
| **2. Cơ sở mã (Codebase)** | - **Tách biệt hoàn toàn:** Phải xây dựng và duy trì 2 codebase riêng lẻ cho 2 hệ điều hành. | - **Dùng chung (Single Codebase):** Tái sử dụng từ 70% đến trên 90% mã nguồn giữa Android và iOS. |
| **3. Hiệu suất (Performance)** | - **Tối ưu tuyệt đối:** Truy cập trực tiếp CPU/GPU, không thông qua tầng trung gian, đạt tốc độ khung hình tối đa (60 - 120 FPS). | - **Rất cao (Gần tiệm cận Native):** Render bằng Native Views nên giao diện mượt mà. Tuy nhiên, có thể giảm hiệu năng nếu luồng dữ liệu truyền qua Bridge quá lớn hoặc animation quá phức tạp. |
| **4. Khả năng truy cập API thiết bị** | - **Toàn diện và tức thì (100%):** Hỗ trợ lập tức mọi cảm biến phần cứng và tính năng mới nhất từ Apple & Google khi OS cập nhật. | - **Thông qua Native Modules:** Hầu hết các API phổ biến (Camera, GPS, Storage, Biometrics) đều có thư viện sẵn. Nếu tính năng quá mới, lập trình viên phải tự viết mã cầu nối (Bridge/Native Module) bằng Java/Swift. |
| **5. Tốc độ phát triển (Development Speed)** | - **Chậm hơn:** Phải phát triển và kiểm thử độc lập hai lần. Thời gian biên dịch (build time) mỗi lần sửa mã khá lâu. | - **Nhanh hơn vượt bậc:** Viết code một lần cho cả hai máy. Tính năng **Fast Refresh** cho phép thấy ngay thay đổi trong vài giây mà không cần biên dịch lại. |
| **6. Công cụ debug (Debugging Tools)** | - Sử dụng IDE chính thức: **Xcode** (Instruments, LLDB) cho iOS; **Android Studio** (Logcat, Android Profiler) cho Android. | - Đa dạng và quen thuộc với dân Web: **React Native DevTools**, **Chrome DevTools**, **Flipper**, kết hợp cùng Xcode / Android Studio khi cần bắt lỗi tầng Native. |
| **7. Loại ứng dụng phù hợp** | - Game 3D nặng, ứng dụng AR/VR.<br>- Ứng dụng biên tập video/âm thanh thời gian thực.<br>- Ứng dụng bảo mật cấp thấp hoặc can thiệp sâu hệ thống phần cứng. | - Ứng dụng Thương mại điện tử (Shopee, Tiki).<br>- Mạng xã hội, tin tức, blog.<br>- Ứng dụng giao hàng, gọi xe, tài chính/ngân hàng phổ thông, app quản lý doanh nghiệp. |

---

## CÂU 5
> **Đề bài:**  
> Em hãy giải thích vì sao người học React Native cần nắm các kiến thức cơ bản của React như JSX, component, props và state. Hãy liên hệ các kiến thức này với việc xây dựng giao diện và xử lý dữ liệu trong một ứng dụng mobile đơn giản.

### 1. Vì sao người học React Native bắt buộc phải nắm vững kiến thức React?
1. **React Native kế thừa toàn bộ triết lý cốt lõi của React:**
   - React Native thực chất là việc đem tư duy lập trình giao diện của thư viện React trên Web (**"Learn once, write anywhere"**) áp dụng vào môi trường ứng dụng di động.
   - Các nguyên lý nền tảng như: Luồng dữ liệu một chiều (*Unidirectional Data Flow*), mô hình Component hóa (*Component-Driven Architecture*), chu kỳ sống (*Lifecycle* / *Hooks*) đều giống hệt như trong React.
2. **Không thể viết mã nếu thiếu nền tảng:**
   - Nếu không hiểu `JSX`, lập trình viên không thể mô tả được bố cục giao diện di động.
   - Nếu không hiểu `Component`, mã nguồn sẽ bị trùng lặp, cồng kềnh và không thể bảo trì.
   - Nếu không hiểu `Props` và `State`, lập trình viên không thể điều phối dòng chảy dữ liệu, ứng dụng sẽ trở nên "bất động" và không thể tương tác với người dùng.

---

### 2. Ý nghĩa và liên hệ thực tế trong một ứng dụng mobile đơn giản
*(Ví dụ thực tiễn: Xây dựng màn hình danh sách sản phẩm thời trang có tính năng bấm "Thích" và chọn "Số lượng")*

#### a. JSX (JavaScript XML)
- **Bản chất:** Là cú pháp mở rộng cho phép viết cấu trúc giao diện tương tự như HTML ngay bên trong mã JavaScript, giúp trực quan hóa cấu trúc UI.
- **Liên hệ thực tế trong Mobile:**
  - Thay vì dùng thẻ Web `<div>` và `<p>`, trong React Native ta dùng JSX để lồng ghép các thẻ Mobile:
  ```jsx
  <View style={styles.card}>
    <Image source={{ uri: 'https://example.com/ao.jpg' }} style={styles.thumbnail} />
    <Text style={styles.title}>Áo Polo Nam Cao Cấp</Text>
    <Text style={styles.price}>250.000 VNĐ</Text>
  </View>
  ```
  JSX giúp định hình bộ khung giao diện của thẻ sản phẩm một cách sạch sẽ và dễ đọc.

#### b. Component (Thành phần giao diện)
- **Bản chất:** Là các khối mã độc lập, đại diện cho một phần của giao diện người dùng. Component có thể lồng vào nhau và tái sử dụng nhiều lần.
- **Liên hệ thực tế trong Mobile:**
  - Ta có thể tạo một component độc lập tên là `<ProductCard />`.
  - Trên màn hình Trang chủ (`HomeScreen`), thay vì viết lặp đi lặp lại 100 lần đoạn mã vẽ thẻ sản phẩm, ta chỉ cần gọi component này trong một danh sách (`FlatList`):
  ```jsx
  <FlatList 
    data={productsList}
    renderItem={({ item }) => <ProductCard data={item} />}
  />
  ```
  Giúp dự án gọn gàng, module hóa cao và tái sử dụng được ở cả màn hình Tìm kiếm lẫn Màn hình Giỏ hàng.

#### c. Props (Properties - Thuộc tính truyền vào)
- **Bản chất:** Là phương thức truyền dữ liệu từ component cha xuống component con. Dữ liệu trong Props là **bất biến (Read-only)** đối với component con nhận nó.
- **Liên hệ thực tế trong Mobile:**
  - Màn hình cha `HomeScreen` có một mảng danh sách sản phẩm lấy từ Server. Khi render từng `<ProductCard />`, component cha sẽ truyền thông tin qua Props:
  ```jsx
  <ProductCard 
    name="Giày Thể Thao" 
    price={450000} 
    imageUri="https://..." 
  />
  ```
  Component con `ProductCard` chỉ việc đọc `props.name`, `props.price` để hiển thị đúng thông tin mà không được tự ý sửa đổi giá gốc của sản phẩm.

#### d. State (Trạng thái nội tại)
- **Bản chất:** Là dữ liệu động được quản lý bên trong chính component đó, có thể thay đổi qua các thao tác của người dùng. **Khi State thay đổi, component sẽ tự động được vẽ lại (Re-render)** để phản ánh dữ liệu mới nhất lên màn hình.
- **Liên hệ thực tế trong Mobile:**
  - **Tính năng Thích sản phẩm:** Sử dụng State boolean `const [isLiked, setIsLiked] = useState(false)`. Khi người dùng chạm ngón tay vào biểu tượng Trái tim, hàm gọi `setIsLiked(!isLiked)`. Giao diện tự động re-render và đổi màu trái tim từ Xám sang Đỏ.
  - **Tính năng Tăng/Giảm số lượng mua:** Sử dụng State số `const [quantity, setQuantity] = useState(1)`. Khi bấm nút `[+]`, ta gọi `setQuantity(quantity + 1)`. Con số hiển thị trên màn hình mobile lập tức nhảy từ `1` lên `2`.

---
*Tài liệu được biên soạn phục vụ cho Bài Luyện Tập 1 - Môn Lập trình Di động Đa Nền tảng với React Native.*

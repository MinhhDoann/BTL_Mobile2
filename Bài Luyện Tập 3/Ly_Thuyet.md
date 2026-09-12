# BÀI LUYỆN TẬP 3 - PHẦN A: CÂU HỎI ÔN TẬP LÝ THUYẾT

---

## CÂU HỎI 1
> **Đề bài:**  
> Hãy trình bày vai trò của các kiến thức JavaScript nền tảng như `let`, `const`, `scope`, `closure`, `arrow function`, `destructuring`, `rest parameters`, `spread syntax` và các hàm xử lý mảng trong quá trình học React Native. Theo anh/chị, nếu người học chưa nắm vững các kiến thức này thì có thể gặp những khó khăn gì khi xây dựng ứng dụng mobile?

### 1. Vai trò của các kiến thức JavaScript nền tảng trong React Native

React Native không phải là một ngôn ngữ mới mà là một **framework xây dựng hoàn toàn trên nền tảng JavaScript (ES6+)**. Mỗi khái niệm JavaScript cốt lõi đều đóng vai trò then chốt trong cấu trúc và vận hành của ứng dụng di động:

| Khái niệm JavaScript | Vai trò cụ thể trong lập trình React Native |
| :--- | :--- |
| **`let`, `const`** | Giúp quản lý biến an toàn, tránh lỗi rò rỉ biến (scope leak) và ghi đè ngoài ý muốn. Trong React Native, `const` được sử dụng cho phần lớn khai báo: định nghĩa Component, khai báo biến trạng thái State (Hooks), định nghĩa styles (`StyleSheet.create`), và hàm xử lý. `let` dùng cho các biến đếm hoặc biến tính toán tạm thời. |
| **`Scope` (Phạm vi biến)** | Quy định nơi một biến có thể được truy cập (Global, Function, Block scope `{}`). Hiểu rõ scope giúp lập trình viên kiểm soát biến trạng thái, tránh trùng tên biến giữa các component hoặc các khối logic xử lý. |
| **`Closure`** | Cơ chế cho phép một hàm con ghi nhớ và truy cập vào phạm vi biến của hàm cha ngay cả khi hàm cha đã thực thi xong. Đây là nền tảng hoạt động của toàn bộ hệ thống **React Hooks** (`useState`, `useEffect`, `useCallback`), giúp ghi nhớ giá trị state qua các lần re-render và giữ đúng dữ liệu trong các hàm hẹn giờ (Timer/API). |
| **`Arrow Function`** | Cung cấp cú pháp ngắn gọn, kế thừa từ khóa `this` theo phạm vi bao quanh (lexical `this`). Được sử dụng liên tục khi viết Functional Component, các hàm callback sự kiện (`onPress`, `onChangeText`) và truyền tham số trực tiếp trên giao diện. |
| **`Destructuring`** | Cú pháp bóc tách phần tử từ Object hoặc Array. Cực kỳ quan trọng để: giải nén `props` truyền vào component `({ name, price })`, bóc tách giá trị từ Hooks `const [count, setCount] = useState(0);`, hoặc trích xuất dữ liệu trả về từ API. |
| **`Rest Parameters` (`...args`)** | Cho phép hàm nhận số lượng tham số không giới hạn dưới dạng mảng. Thường dùng khi viết các hàm tiện ích linh hoạt (utilities) hoặc bọc lại các component (Higher-Order Components/Custom Components). |
| **`Spread Syntax` (`...obj`, `...arr`)** | Giúp sao chép và mở rộng mảng/đối tượng mà **không làm thay đổi dữ liệu gốc (Immutability)**. Đây là quy tắc bất di bất dịch khi cập nhật State phức tạp trong React Native: `setUserInfo({ ...userInfo, age: 21 })`. |
| **Hàm xử lý mảng (`map`, `filter`, `reduce`)** | Công cụ sống còn để xử lý dữ liệu: `map()` dùng để biến đổi mảng dữ liệu thành danh sách phần tử JSX hiển thị lên màn hình; `filter()` dùng cho tính năng tìm kiếm, lọc danh mục sản phẩm; `reduce()` dùng để tính tổng tiền đơn hàng, tổng số lượng sản phẩm trong giỏ hàng. |

---

### 2. Những khó khăn thực tế nếu người học chưa nắm vững các kiến thức này
1. **Lỗi vi phạm tính bất biến (State Mutation Bugs):**
   - Người chưa hiểu `spread syntax` thường gán trực tiếp: `user.name = "An"; setUser(user);`. Hậu quả: React Native không phát hiện được sự thay đổi địa chỉ ô nhớ nên **giao diện không hề cập nhật (không re-render)**, gây lỗi logic cực kỳ khó gỡ.
2. **Khủng hoảng với React Hooks (Stale Closures):**
   - Không hiểu `closure` dẫn đến việc sử dụng sai dependencies trong `useEffect`, khiến ứng dụng liên tục gọi API vô tận (Infinite Loop) làm sập app hoặc hiển thị dữ liệu cũ không đồng bộ.
3. **Bế tắc khi render giao diện danh sách:**
   - Không thành thạo `map()` và `filter()` sẽ không thể hiển thị danh sách động lên các thành phần như `FlatList` hay `ScrollView`, không viết được tính năng tìm kiếm hoặc lọc dữ liệu theo điều kiện.
4. **Mã nguồn cồng kềnh, khó đọc và khó bảo trì:**
   - Không sử dụng `destructuring` khiến mã nguồn ngập tràn các câu lệnh dài dòng như `props.navigation.state.params.item.name`, làm giảm năng suất viết mã và dễ phát sinh lỗi `undefined`.

---

## CÂU HỎI 2
> **Đề bài:**  
> Hãy giải thích sự khác nhau giữa `named export` và `default export` trong JavaScript. Trong một dự án React Native có nhiều file component và file tiện ích, anh/chị sẽ lựa chọn từng cách export trong những tình huống nào để giúp mã nguồn dễ quản lý và bảo trì?

### 1. Phân biệt `named export` và `default export`

| Tiêu chí | Named Export (Export có tên) | Default Export (Export mặc định) |
| :--- | :--- | :--- |
| **Số lượng trong một file** | Có thể có **nhiều** `named export` trong cùng một file. | Mỗi file chỉ được phép có **duy nhất một** `default export`. |
| **Cú pháp Export** | `export const sum = ...;`<br>hoặc `export { sum, sub };` | `export default MyComponent;` |
| **Cú pháp Import** | **Bắt buộc dùng dấu ngoặc nhọn `{ }`** và đúng tên biến:<br>`import { sum } from './math';` | **Không dùng dấu ngoặc nhọn**, có thể tự do đặt tên khi import:<br>`import AnyName from './MyComponent';` |
| **Đổi tên khi Import** | Phải dùng từ khóa `as`: `import { sum as add } from './math';` | Tự do đặt tên tùy ý mà không cần từ khóa phụ trợ. |

---

### 2. Chiến lược lựa chọn trong dự án React Native để mã nguồn dễ quản lý và bảo trì

1. **Khi nào NÊN chọn `default export`?**
   - **Các file Component chính:** Mỗi file component đại diện cho một màn hình hoặc một khối giao diện độc lập (ví dụ: `HomeScreen.js`, `ProductCard.js`, `ProfileScreen.js`). Sử dụng `default export` giúp khẳng định component đó là đối tượng trung tâm, linh hồn của file.
   - **File cấu hình hoặc dịch vụ đơn lẻ:** Ví dụ file cấu hình mạng `apiClient.js` hoặc cấu hình theme `theme.js`.
   ```jsx
   // File: src/components/ProductCard.js
   const ProductCard = ({ product }) => { ... };
   export default ProductCard;
   
   // Import ở nơi sử dụng:
   import ProductCard from './components/ProductCard';
   ```

2. **Khi nào NÊN chọn `named export`?**
   - **Các file tiện ích / hàm dùng chung (Utilities / Helpers):** Một file chứa nhiều hàm toán học, định dạng ngày tháng, kiểm tra dữ liệu (`helpers.js` gồm: `formatDate`, `formatCurrency`, `validateEmail`). Dùng `named export` giúp nơi gọi chỉ import đúng hàm cần dùng (*Tree-shaking* giúp giảm dung lượng app).
   - **Các file Hằng số (Constants / Colors):** File `colors.js` chứa `PRIMARY_COLOR`, `SECONDARY_COLOR`, `TEXT_COLOR`.
   - **File gom nhóm (Index Barrel Pattern):** Trong thư mục `src/components/index.js`, gom tất cả components lại để import gọn gàng trên 1 dòng:
   ```jsx
   // File: src/utils/format.js
   export const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + ' đ';
   export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

   // Import ở nơi sử dụng:
   import { formatCurrency } from '../utils/format';
   ```

---

## CÂU HỎI 3
> **Đề bài:**  
> Hãy trình bày ý nghĩa của `arrow function` trong JavaScript hiện đại. So sánh cách viết arrow function với function thông thường, đồng thời phân tích vì sao arrow function thường được sử dụng nhiều trong React Native, đặc biệt khi viết hàm xử lý sự kiện hoặc xử lý dữ liệu mảng.

### 1. Ý nghĩa của Arrow Function trong JavaScript hiện đại
- **Ra đời từ phiên bản ES6 (2015):** Arrow function (`() => {}`) là một bước đột phá giúp cú pháp định nghĩa hàm trở nên ngắn gọn, thanh thoát và trực quan hơn.
- **Ràng buộc ngữ cảnh từ vựng (Lexical `this` binding):** Khác với hàm truyền thống tự tạo ra ngữ cảnh `this` riêng, arrow function tự động "bắt" và kế thừa `this` từ phạm vi bao quanh nó tại thời điểm định nghĩa.
- **Hỗ trợ Implicit Return:** Với các biểu thức một dòng, có thể trả về giá trị trực tiếp mà không cần từ khóa `return` và dấu `{}`.

---

### 2. So sánh cách viết giữa Function thông thường và Arrow Function

```javascript
// 1. Function thông thường:
function square(x) {
    return x * x;
}

// 2. Arrow Function đầy đủ:
const square = (x) => {
    return x * x;
};

// 3. Arrow Function rút gọn (Một tham số, trả về trực tiếp):
const square = x => x * x;
```

---

### 3. Vì sao Arrow Function là lựa chọn thống trị trong React Native?

1. **Xử lý sự kiện (Event Handling) cực kỳ tự nhiên:**
   - Trong React Native, các sự kiện như `onPress` thường cần truyền thêm tham số (ví dụ: mã ID sản phẩm khi bấm nút Xóa). Arrow function cho phép viết callback nội dòng (inline) vô cùng dễ hiểu:
   ```jsx
   <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
       <Text>Xóa</Text>
   </TouchableOpacity>
   ```
2. **Xử lý dữ liệu mảng kết hợp render JSX:**
   - Cú pháp rút gọn trả về trực tiếp (`implicit return`) kết hợp với `map()` giúp đoạn mã tạo danh sách thẻ giao diện ngắn đi một nửa, trực quan và dễ bảo trì:
   ```jsx
   {products.map(item => (
       <Text key={item.id}>{item.name}</Text>
   ))}
   ```
3. **Định nghĩa Functional Component hiện đại:**
   - Toàn bộ cộng đồng React Native hiện đại sử dụng Functional Components bằng arrow function thay cho Class Components cồng kềnh ngày xưa, giúp mã sạch sẽ và thân thiện với React Hooks.

---

## CÂU HỎI 4
> **Đề bài:**  
> Hãy giải thích sự khác nhau giữa `rest parameters` và `spread syntax`. Dựa trên ví dụ về hàm nhận nhiều tham số và ví dụ truyền mảng vào `Math.max`, hãy phân tích khi nào dấu ba chấm `...` được hiểu là gom nhiều giá trị lại và khi nào được hiểu là trải các phần tử ra.

### 1. Phân biệt Rest Parameters và Spread Syntax

Cả hai đều sử dụng ký hiệu dấu ba chấm `...`, nhưng mục đích và vị trí sử dụng hoàn toàn **đối lập nhau**:

| Tiêu chí | Rest Parameters (Gom lại) | Spread Syntax (Trải ra) |
| :--- | :--- | :--- |
| **Bản chất hành động** | **GOM** nhiều phần tử riêng lẻ lại thành **MỘT MẢNG**. | **TRẢI PHẲNG (BUNG)** một mảng hoặc đối tượng thành **CÁC PHẦN TỬ ĐỘC LẬP**. |
| **Vị trí xuất hiện** | Nằm ở **phần khai báo danh sách tham số của hàm**. | Nằm ở **lời gọi hàm**, hoặc khi tạo mảng mới / object mới. |
| **Mục đích** | Cho phép hàm nhận số lượng tham số linh hoạt không cố định. | Truyền mảng vào hàm yêu cầu danh sách đối số; sao chép hoặc ghép nối mảng/object. |

---

### 2. Phân tích qua hai ví dụ thực tế

#### a. Trường hợp GOM LẠI (Rest Parameters - Gom nhiều giá trị thành mảng):
- **Ví dụ:** Viết hàm tính tổng nhận số lượng tham số tùy ý:
```javascript
function sum(...numbers) {
    // Dấu '...' ở đây là REST PARAMETER:
    // Nó gom tất cả các đối số truyền vào (1, 2, 3, 4) thành một mảng: numbers = [1, 2, 3, 4]
    return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(10, 20));          // numbers = [10, 20] -> Kết quả: 30
console.log(sum(1, 2, 3, 4, 5));   // numbers = [1, 2, 3, 4, 5] -> Kết quả: 15
```
👉 **Quy tắc nhận biết:** Khi `...` đứng trước tham số cuối cùng trong **định nghĩa hàm** `function fn(...args)`, nó có nghĩa là **GOM LẠI**.

#### b. Trường hợp TRẢI RA (Spread Syntax - Bung các phần tử):
- **Ví dụ:** Tìm số lớn nhất từ một mảng số bằng `Math.max`:
```javascript
const scores = [85, 92, 78, 99, 88];

// Hàm Math.max yêu cầu nhận từng đối số riêng lẻ: Math.max(a, b, c, ...)
// Nếu truyền cả mảng Math.max(scores) sẽ bị lỗi NaN!

// Dấu '...' ở đây là SPREAD SYNTAX:
// Nó trải/bung mảng [85, 92, 78, 99, 88] thành 85, 92, 78, 99, 88
const maxScore = Math.max(...scores); 
console.log(maxScore); // Kết quả: 99
```
👉 **Quy tắc nhận biết:** Khi `...` đứng trước một mảng/object trong **lời gọi hàm** `func(...arr)` hoặc trong biểu thức tạo mảng mới `[...arr1, ...arr2]` / object mới `{ ...state, newProp: 1 }`, nó có nghĩa là **TRẢI RA**.

---

## CÂU HỎI 5
> **Đề bài:**  
> Hãy trình bày khái niệm React Native và nêu các ưu điểm của việc phát triển ứng dụng di động đa nền tảng bằng React Native. Theo anh/chị, vì sao việc sử dụng chung một codebase cho Android và iOS có thể giúp tiết kiệm thời gian phát triển ứng dụng?

### 1. Khái niệm React Native
- **React Native** là một framework mã nguồn mở do tập đoàn Meta (Facebook) phát triển, cho phép xây dựng ứng dụng di động thực thụ chạy trên cả hai nền tảng **Android** và **iOS** bằng ngôn ngữ **JavaScript / TypeScript** và thư viện **React**.
- Ứng dụng tạo bởi React Native render trực tiếp các thành phần giao diện gốc của hệ điều hành (**Native Components**), mang lại giao diện và trải nghiệm cảm ứng hoàn toàn nguyên bản như ứng dụng viết bằng Java/Kotlin hay Swift.

---

### 2. Các ưu điểm nổi bật của React Native
1. **Trải nghiệm Native thực thụ:** Không chạy qua WebView chậm chạp; các thành phần `<Text>`, `<View>`, `<Image>` được chuyển đổi trực tiếp thành `TextView`/`UILabel`, `ViewGroup`/`UIView`.
2. **Cơ chế Fast Refresh (Hot Reloading):** Cho phép xem ngay lập tức các thay đổi mã nguồn trên màn hình thiết bị hoặc máy ảo trong 1-2 giây mà không làm mất trạng thái của ứng dụng.
3. **Hệ sinh thái và cộng đồng khổng lồ:** Thừa hưởng hàng triệu gói thư viện NPM từ JavaScript, tài liệu phong phú và sự hỗ trợ mạnh mẽ từ Meta và cộng đồng lập trình viên toàn cầu.
4. **Dễ tiếp cận với lập trình viên Web:** Kế thừa tư duy component, JSX và CSS Flexbox, giúp đội ngũ Web nhanh chóng làm chủ công nghệ di động.
5. **Khả năng mở rộng linh hoạt:** Dễ dàng kết nối và viết thêm các Native Module bằng Java/Kotlin hoặc Swift/Obj-C khi cần tối ưu phần cứng tầng thấp.

---

### 3. Vì sao sử dụng chung một Codebase giúp tiết kiệm thời gian phát triển?

1. **Loại bỏ sự trùng lặp mã nguồn (Tiết kiệm 70% - 90% thời gian viết code):**
   - Thay vì phải viết và kiểm tra 2 lần cho cùng một thuật toán tính giá, cùng một luồng đăng nhập, hay cùng một màn hình giỏ hàng bằng 2 ngôn ngữ khác nhau, lập trình viên chỉ cần viết một lần logic trên codebase chung.
2. **Đồng bộ tiến độ phát hành tính năng (Simultaneous Releases):**
   - Không còn tình trạng phiên bản Android ra mắt trước còn bản iOS bị chậm hàng tháng trời do thiếu nhân sự hoặc lệch tiến độ.
3. **Kiểm thử (Testing) và sửa lỗi (Debugging) tập trung:**
   - Hầu hết các lỗi liên quan đến nghiệp vụ dữ liệu chỉ cần sửa một lần duy nhất tại file nguồn JavaScript, cả 2 nền tảng sẽ cùng được vá lỗi ngay lập tức.
4. **Quy trình làm việc tinh gọn (Unified Workflow):**
   - Toàn bộ đội ngũ sử dụng chung một quy trình quản lý mã nguồn (Git), một hệ thống CI/CD, và một bộ tài liệu thiết kế.

---
*Tài liệu ôn tập Bài Luyện Tập 3 - Lập trình Di động Đa nền tảng với React Native.*

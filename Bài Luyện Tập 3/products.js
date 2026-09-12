// =============================================================================
// BÀI TẬP 3 – MỨC TRUNG BÌNH: XỬ LÝ MẢNG VỚI MAP, FILTER, REDUCE
// File: products.js
// =============================================================================

console.log("==================================================");
console.log("     BÀI TẬP 3: XỬ LÝ MẢNG DỮ LIỆU SẢN PHẨM       ");
console.log("==================================================\n");

// 1. Khởi tạo mảng gồm 6 sản phẩm công nghệ (đáp ứng tiêu chí ít nhất 5 sản phẩm)
const products = [
    { id: "SP01", name: "iPhone 15 Pro Max 256GB", price: 29500000, isAvailable: true },
    { id: "SP02", name: "Samsung Galaxy S24 Ultra", price: 26900000, isAvailable: true },
    { id: "SP03", name: "Tai nghe Sony WH-1000XM5", price: 7490000, isAvailable: false },
    { id: "SP04", name: "MacBook Air M3 16GB", price: 27990000, isAvailable: true },
    { id: "SP05", name: "Bàn phím cơ Keychron Q1 Pro", price: 4200000, isAvailable: false },
    { id: "SP06", name: "Đồng hồ Apple Watch Series 9", price: 8990000, isAvailable: true }
];

// Hàm định dạng tiền tệ Việt Nam Đồng (VND)
const formatMoney = (amount) => {
    return amount.toLocaleString('vi-VN') + ' VND';
};

// =============================================================================
// 2. THỰC HIỆN CÁC YÊU CẦU THEO ĐỀ BÀI
// =============================================================================

// YÊU CẦU 1: Dùng map() để tạo danh sách chỉ chứa tên các sản phẩm
const productNames = products.map(product => product.name);

// YÊU CẦU 2: Dùng filter() để lọc ra các sản phẩm còn hàng (isAvailable === true)
const availableProducts = products.filter(product => product.isAvailable);

// YÊU CẦU 3: Dùng reduce() để tính tổng giá trị của tất cả các sản phẩm trong danh sách
const totalInventoryValue = products.reduce((sum, product) => sum + product.price, 0);

// Tính thêm tổng giá trị các sản phẩm THỰC TẾ CÒN HÀNG (Ứng dụng thực tế cao)
const totalAvailableValue = availableProducts.reduce((sum, product) => sum + product.price, 0);

// =============================================================================
// 3. XUẤT KẾT QUẢ RA CONSOLE
// =============================================================================

console.log(">> DANH SÁCH TOÀN BỘ SẢN PHẨM BAN ĐẦU:");
console.table(products.map(p => ({
    "Mã SP": p.id,
    "Tên sản phẩm": p.name,
    "Giá bán": formatMoney(p.price),
    "Trạng thái": p.isAvailable ? "[Còn hàng]" : "[Hết hàng]"
})));

console.log("\n--------------------------------------------------");
console.log("1. KẾT QUẢ SỬ DỤNG MAP() - DANH SÁCH TÊN SẢN PHẨM:");
productNames.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`);
});

console.log("\n--------------------------------------------------");
console.log("2. KẾT QUẢ SỬ DỤNG FILTER() - CÁC SẢN PHẨM CÒN HÀNG:");
console.table(availableProducts.map(p => ({
    "Mã SP": p.id,
    "Tên sản phẩm": p.name,
    "Giá bán": formatMoney(p.price),
    "Trạng thái": "[Còn hàng]"
})));

console.log("--------------------------------------------------");
console.log("3. KẾT QUẢ SỬ DỤNG REDUCE() - TÍNH TỔNG GIÁ TRỊ:");
console.log(`   >> Tổng giá trị toàn bộ sản phẩm trong kho : ${formatMoney(totalInventoryValue)}`);
console.log(`   >> Tổng giá trị các sản phẩm ĐANG CÒN HÀNG : ${formatMoney(totalAvailableValue)}`);

console.log("\n==================================================");
console.log("     HOÀN THÀNH KIỂM TRA BÀI TẬP 3 THÀNH CÔNG!     ");
console.log("==================================================");

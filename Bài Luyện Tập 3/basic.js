// =============================================================================
// BÀI TẬP 1 – MỨC DỄ: LÀM QUEN VỚI ARROW FUNCTION TRONG JAVASCRIPT ES6+
// File: basic.js
// =============================================================================

console.log("==================================================");
console.log("             BÀI TẬP 1: ARROW FUNCTIONS           ");
console.log("==================================================\n");

// 1. Hàm tính tổng hai số bằng arrow function
const sum = (a, b) => a + b;

// 2. Hàm tính bình phương một số bằng arrow function
const square = x => x * x;

// 3. Hàm kiểm tra một số có lớn hơn 10 hay không bằng arrow function
const isGreaterThanTen = num => num > 10;

// =============================================================================
// KIỂM TRA VÀ IN KẾT QUẢ RA CONSOLE
// =============================================================================

// Test hàm tính tổng (sum)
const a = 15, b = 27;
console.log(`1. Kiểm tra hàm tính tổng:`);
console.log(`   - sum(${a}, ${b}) = ${sum(a, b)}`);
console.log(`   - sum(8, -3)  = ${sum(8, -3)}\n`);

// Test hàm tính bình phương (square)
const num1 = 6, num2 = 9;
console.log(`2. Kiểm tra hàm tính bình phương:`);
console.log(`   - square(${num1}) = ${square(num1)}`);
console.log(`   - square(${num2}) = ${square(num2)}\n`);

// Test hàm kiểm tra lớn hơn 10 (isGreaterThanTen)
const testNum1 = 15, testNum2 = 7, testNum3 = 10;
console.log(`3. Kiểm tra hàm so sánh lớn hơn 10:`);
console.log(`   - isGreaterThanTen(${testNum1}) = ${isGreaterThanTen(testNum1)} (Vì ${testNum1} > 10)`);
console.log(`   - isGreaterThanTen(${testNum2})  = ${isGreaterThanTen(testNum2)} (Vì ${testNum2} <= 10)`);
console.log(`   - isGreaterThanTen(${testNum3}) = ${isGreaterThanTen(testNum3)} (Vì ${testNum3} bằng 10)\n`);

console.log("==================================================");
console.log("     HOÀN THÀNH KIỂM TRA BÀI TẬP 1 THÀNH CÔNG!     ");
console.log("==================================================");

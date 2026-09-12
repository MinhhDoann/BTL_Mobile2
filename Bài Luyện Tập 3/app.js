// =============================================================================
// BÀI TẬP 2 – MỨC DỄ ĐẾN TRUNG BÌNH: IMPORT, EXPORT & DESTRUCTURING
// File: app.js
// =============================================================================

// 1. Import dữ liệu từ student.js (minh họa cả Default import và Named import)
import student, { getStudentSummary } from './student.js';

console.log("==================================================");
console.log("     BÀI TẬP 2: THÔNG TIN SINH VIÊN (DESTRUCTURING) ");
console.log("==================================================\n");

// 2. Sử dụng Object Destructuring để bóc tách các thuộc tính cần thiết
const { fullName, className, major, academicYear, gpa, email } = student;

// 3. Hiển thị thông tin sinh viên ra Console
console.log(">> KẾT QUẢ BÓC TÁCH THÔNG TIN BẰNG DESTRUCTURING:");
console.log(`   - Họ và tên     : ${fullName}`);
console.log(`   - Lớp sinh hoạt : ${className}`);
console.log(`   - Chuyên ngành  : ${major}`);
console.log(`   - Niên khóa     : ${academicYear}`);
console.log(`   - Điểm GPA      : ${gpa}`);
console.log(`   - Email liên hệ : ${email}\n`);

// Minh họa hàm tiện ích được import
console.log(`>> TÓM TẮT: ${getStudentSummary(student)}\n`);

// Hiển thị dạng bảng (Table) trực quan trong Console
console.log(">> HIỂN THỊ DẠNG BẢNG CHI TIẾT:");
console.table({
    "Họ và tên": fullName,
    "Lớp": className,
    "Ngành học": major,
    "Năm học": academicYear,
    "GPA": gpa,
    "Email": email
});

console.log("\n==================================================");
console.log("     HOÀN THÀNH KIỂM TRA BÀI TẬP 2 THÀNH CÔNG!     ");
console.log("==================================================");

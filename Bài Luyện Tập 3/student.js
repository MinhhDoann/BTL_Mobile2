// =============================================================================
// BÀI TẬP 2 – MỨC DỄ ĐẾN TRUNG BÌNH: QUẢN LÝ THÔNG TIN SINH VIÊN
// File: student.js
// =============================================================================

// Khởi tạo đối tượng lưu trữ thông tin sinh viên
const student = {
    id: "SV2026001",
    fullName: "Nguyễn Văn An",
    className: "KTPM-K17B",
    major: "Kỹ thuật phần mềm (Chuyên ngành Mobile React Native)",
    academicYear: "2023 - 2027",
    gpa: 3.65,
    email: "an.nguyen@university.edu.vn"
};

// Hàm tiện ích tóm tắt thông tin sinh viên
export const getStudentSummary = (std) => {
    return `${std.fullName} - Lớp ${std.className} (${std.academicYear})`;
};

// 1. Export dạng Named Export
export { student };

// 2. Export dạng Default Export (phù hợp với chuẩn component/module chính)
export default student;

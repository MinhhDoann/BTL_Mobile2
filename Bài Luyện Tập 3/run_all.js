// =============================================================================
// FILE CHẠY TOÀN BỘ 3 BÀI TẬP THỰC HÀNH - BÀI LUYỆN TẬP 3
// File: run_all.js
// =============================================================================

import { execSync } from 'child_process';

console.log("\n🚀 BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG TOÀN BỘ BÀI LUYỆN TẬP 3...\n");

try {
    console.log("▶️ [CHẠY BÀI TẬP 1: basic.js]");
    const out1 = execSync('node basic.js', { encoding: 'utf-8' });
    console.log(out1);

    console.log("\n▶️ [CHẠY BÀI TẬP 2: app.js]");
    const out2 = execSync('node app.js', { encoding: 'utf-8' });
    console.log(out2);

    console.log("\n▶️ [CHẠY BÀI TẬP 3: products.js]");
    const out3 = execSync('node products.js', { encoding: 'utf-8' });
    console.log(out3);

    console.log("🎉 TẤT CẢ CÁC BÀI TẬP ĐÃ HOÀN THÀNH XUẤT SẮC!\n");
} catch (error) {
    console.error("Lỗi khi chạy:", error.message);
}

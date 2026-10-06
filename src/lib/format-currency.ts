/**
 * Helper định dạng giá trị tiền mặt trong hệ thống
 * Sử dụng dấu . để ngăn cách mỗi ba chữ số kề nhau (ví dụ: 100.000, 1.500.000)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Math.round(Number(amount) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatVND(amount: number | string | null | undefined): string {
  return `${formatCurrency(amount)} VNĐ`;
}

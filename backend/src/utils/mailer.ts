import 'dotenv/config';
import nodemailer from 'nodemailer';

// Create a transporter. In production, environment variables can be passed.
// For local / test mode, if no env vars exist, it logs to console and attempts transport.
const isSecure = Number(process.env.SMTP_PORT) === 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: isSecure,
  pool: true,
  maxConnections: 3,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
  auth: {
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  },
});

export async function sendPasswordMail(email: string, username: string, oldPassword: string): Promise<boolean> {
  console.log(`[MAIL SERVICE] Request to send old password to email: ${email}`);
  console.log(`[MAIL SERVICE] Username: ${username}, Old Password: ${oldPassword}`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Mobile2 Music App" <no-reply@mobile2music.com>',
    to: email,
    subject: '[MOBILE2] Khôi phục mật khẩu tài khoản',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Khôi phục mật khẩu - Mobile2</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Bạn (hoặc ai đó) đã yêu cầu lấy lại mật khẩu cho tài khoản liên kết với email này.</p>
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #38bdf8; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8;">Mật khẩu cũ / hiện tại của bạn là:</p>
          <p style="margin: 5px 0 0 0; font-size: 22px; font-weight: bold; color: #38bdf8; letter-spacing: 1px;">${oldPassword}</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Vui lòng dùng mật khẩu trên để đăng nhập. Nếu bạn muốn đổi mật khẩu mới, bạn có thể thực hiện trong trang Hồ sơ cá nhân.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/>Đội ngũ Mobile2 App</p>
      </div>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAIL SERVICE] Email sent successfully to ${email}`);
      return true;
    } else {
      console.log(`[MAIL SERVICE] SMTP credentials not set. Simulated email sending to ${email}.`);
      return true;
    }
  } catch (err) {
    console.error(`[MAIL SERVICE] Error sending email to ${email}:`, err);
    return false;
  }
}

export async function sendPayoutReceiptMail(params: {
  to: string;
  artistName: string;
  requestId: number;
  amount: number | string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  approvedAt?: string;
}): Promise<boolean> {
  const { to, artistName, requestId, amount, bankName, accountNumber, accountHolder, approvedAt } = params;
  const formattedAmount = Number(amount).toLocaleString('vi-VN');
  const dateStr = approvedAt ? new Date(approvedAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');

  console.log(`[MAIL SERVICE] Gửi biên lai chuyển tiền tới email: ${to} cho nghệ sĩ: ${artistName}`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Mobile2 Music Finance" <no-reply@mobile2music.com>',
    to,
    subject: `[MOBILE2] Biên lai chuyển tiền nhuận bút - Giao dịch #${requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
        <div style="text-align: center; border-bottom: 2px dashed #475569; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #38bdf8; margin: 0 0 8px 0; font-size: 22px;">BIÊN LAI CHUYỂN TIỀN NGHỆ SĨ</h1>
          <p style="color: #94a3b8; margin: 0; font-size: 13px;">Hệ thống phân phối âm nhạc Mobile2</p>
        </div>

        <p>Xin chào nghệ sĩ <strong>${artistName}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">Yêu cầu rút tiền doanh thu / nhuận bút của bạn đã được ban quản trị phê duyệt và hoàn tất chuyển khoản thành công. Dưới đây là thông tin chi tiết biên lai:</p>

        <div style="background-color: #1e293b; padding: 18px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Mã giao dịch:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">#${requestId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Thời gian duyệt:</td>
              <td style="padding: 8px 0;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Nghệ sĩ nhận:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #38bdf8;">${artistName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Số tiền thanh toán:</td>
              <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #10b981;">${formattedAmount} VNĐ</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Ngân hàng:</td>
              <td style="padding: 8px 0;">${bankName || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Số tài khoản:</td>
              <td style="padding: 8px 0; font-family: monospace;">${accountNumber || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Chủ tài khoản:</td>
              <td style="padding: 8px 0; text-transform: uppercase;">${accountHolder || '—'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #94a3b8; font-style: italic; text-align: center; margin-top: 24px;">
          Giao dịch đã được xác nhận hoàn tất. Tiền sẽ ghi nhận vào tài khoản ngân hàng của bạn trong ít phút.
        </p>

        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Mobile2 Music Platform · Bộ phận Tài chính & Doanh thu Nghệ sĩ
        </p>
      </div>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAIL SERVICE] Đã gửi biên lai thành công tới ${to}`);
      return true;
    } else {
      console.log(`[MAIL SERVICE] SMTP chưa cấu hình credentials. Gửi giả lập thành công tới ${to}`);
      return true;
    }
  } catch (err) {
    console.error(`[MAIL SERVICE] Lỗi gửi email tới ${to}:`, err);
    return false;
  }
}

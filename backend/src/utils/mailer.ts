import nodemailer from 'nodemailer';

// Create a transporter. In production, environment variables can be passed.
// For local / test mode, if no env vars exist, it logs to console and attempts transport.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
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

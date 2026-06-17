import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendOtpEmail(to, otp) {
  const from = process.env.SMTP_FROM || `Grace Academy <${process.env.SMTP_USER}>`
  const baseUrl = process.env.AUTH_URL || 'http://localhost:3000'
  const illustrationUrl = `${baseUrl}/images/reset-mail-illustration.svg`
  const transporter = createTransport()

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Grace Academy Password Reset Code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1b22;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1b22;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#10222b;border:1px solid rgba(201,147,44,.22);border-radius:16px;overflow:hidden">

        <!-- Header / Brand -->
        <tr>
          <td style="background:linear-gradient(135deg,#071318 0%,#0d1e28 100%);padding:28px 40px 20px;border-bottom:1px solid rgba(201,147,44,.12);text-align:center">
            <div style="font-size:12px;font-weight:700;letter-spacing:.24em;color:#c9932c;margin-bottom:4px">GRACE ACADEMY</div>
            <div style="font-size:9px;letter-spacing:.18em;color:rgba(201,147,44,.45)">LONG LIVE LEARN</div>
          </td>
        </tr>

        <!-- Illustration -->
        <tr>
          <td style="background:linear-gradient(180deg,#0d1e28 0%,#10222b 100%);padding:32px 40px 0;text-align:center">
            <img src="${illustrationUrl}" alt="Password Reset" width="260" height="195"
              style="width:260px;max-width:100%;height:auto;display:inline-block" />
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:28px 40px 0;text-align:center">
            <div style="display:inline-block;background:rgba(201,147,44,.1);border:1px solid rgba(201,147,44,.28);border-radius:100px;padding:5px 16px;margin-bottom:16px">
              <span style="font-size:10px;font-weight:700;letter-spacing:.16em;color:#c9932c">ACCOUNT RECOVERY</span>
            </div>
            <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#ffffff;line-height:1.2">Your one-time reset code</h1>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,.42);line-height:1.65;max-width:380px;display:inline-block">
              Use the code below to reset your Grace Academy password.<br>
              This code expires in <strong style="color:#c9932c">3 minutes</strong>.
            </p>
          </td>
        </tr>

        <!-- OTP Box -->
        <tr>
          <td style="padding:28px 40px">
            <div style="background:rgba(201,147,44,.07);border:1.5px dashed rgba(201,147,44,.35);border-radius:14px;padding:30px 24px;text-align:center">
              <div style="font-size:10px;font-weight:700;letter-spacing:.2em;color:rgba(201,147,44,.55);margin-bottom:16px;text-transform:uppercase">Your One-Time Code</div>
              <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:#c9932c;font-family:'Courier New',Courier,monospace;padding-left:14px">${otp}</div>
              <div style="margin-top:14px;font-size:11px;color:rgba(255,255,255,.25);letter-spacing:.06em">⏱ Valid for 3 minutes · Single use only</div>
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px">
            <div style="height:1px;background:linear-gradient(to right,transparent,rgba(201,147,44,.18),transparent)"></div>
          </td>
        </tr>

        <!-- Security Notice -->
        <tr>
          <td style="padding:24px 40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32" valign="top" style="padding-top:2px">
                  <div style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);text-align:center;line-height:28px;font-size:13px">⚠️</div>
                </td>
                <td style="padding-left:12px">
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,.32);line-height:1.75">
                    <strong style="color:rgba(255,255,255,.5)">Security Notice:</strong>
                    Never share this code with anyone. Grace Academy will <em>never</em> ask for your OTP via phone or chat.
                    If you didn't request this reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 40px 24px;border-top:1px solid rgba(255,255,255,.05);text-align:center">
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,.18);letter-spacing:.06em">© 2025 GRACE ACADEMY · ALL RIGHTS RESERVED</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
